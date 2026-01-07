package com.runtimerebels.store.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.models.Product;
import com.runtimerebels.store.search.EmbeddingService;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.beans.factory.ObjectProvider;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Locale;
import java.util.LinkedHashSet;
import java.util.Set;
/**
 * ProductController - REST API for managing products.
 * Can create, fetch, update, and delete products.
 *
 * Endpoints implemented:
 * - GET /api/products        : Get all products
 * - GET /api/products/{id}   : Get a single product by ID
 * - GET /api/products/category?categories=cat1 : Get products by category (case-insensitive, must match all)
 * - POST /api/products       : Create a new product
 *
 * Extra endpoints (not required for Product Details, but useful for full CRUD):
 * - PUT /api/products/{id}   : Update an existing product
 * - DELETE /api/products/{id} : Delete a product
 * 
 * @author Haley Kenney, Frank Gonzalez
 * @since 11-19-2025
 */


@RestController
@RequestMapping("/api/products")
public class ProductController {
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);
    private static final String FIELD_CATEGORIES = "categories";

    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;
    private final EmbeddingService embeddingService;

    @Value("${atlas.vector.index:product_embedding}")
    private String atlasVectorIndex;

    @Value("${atlas.vector.path:embedding}")
    private String atlasVectorPath;

    // Relative cutoff for semantic results. Items with a vector score below (bestScore * ratio)
    // are dropped unless they also lexically match the query.
    @Value("${atlas.vector.minScoreRatio:0.80}")
    private double atlasVectorMinScoreRatio;

    // Absolute minimum vector score allowed (unless lexically matching).
    // Keep at 0 to disable; tune via env var ATLAS_VECTOR_MIN_SCORE.
    @Value("${atlas.vector.minScore:0.0}")
    private double atlasVectorMinScore;

    // If the best vector score is below this value, semantic search is likely low-confidence.
    // Returning an empty list triggers the controller's lexical fallback.
    @Value("${atlas.vector.minBestScore:0.0}")
    private double atlasVectorMinBestScore;

    // After score filtering, only keep the top-K semantic matches (by vector rank),
    // plus any lexical matches. This removes the low-confidence long tail.
    @Value("${atlas.vector.semanticTopK:20}")
    private int atlasVectorSemanticTopK;


    @Autowired
    public ProductController(
            ProductRepository productRepository,
            MongoTemplate mongoTemplate,
            ObjectProvider<EmbeddingService> embeddingServiceProvider
    ) {
        this.productRepository = productRepository;
        this.mongoTemplate = mongoTemplate;
        this.embeddingService = embeddingServiceProvider.getIfAvailable();
    }

    /**
     * GET method
     * Get all products
     * `/api/products`
     * @author Haley Kenney
     * @return returns list of all products
     */
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * GET method
     * Get a single product by ID
     * `/api/products/{id}`
     * @author Haley Kenney
     * @param id Product ID
     * @return returns product with given ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET method
     * Get products by search parameters (must match all)
     * `/api/products/results?search=searchTerm&categories=cat1`
     * @author Frank Gonzalez
     * @param categories Array of category names
     * @param searchTerm Search term for product fields
     * @return returns list of products matching all categories and search term
    */
    @GetMapping("/results")
    public ResponseEntity<List<Product>> searchProducts(
        @RequestParam(name="categories", required = false) List<String> categories,
        @RequestParam(name="search", required = false) String searchTerm,
        @RequestParam(name="mode", required = false, defaultValue = "lexical") String mode,
        @RequestParam(name="limit", required = false, defaultValue = "60") int limit
    ) {

      // Semantic search path (Atlas Vector Search)
      if ("semantic".equalsIgnoreCase(mode) && searchTerm != null && !searchTerm.isBlank()) {
          try {
              int safeLimit = limit <= 0 ? 60 : Math.min(limit, 200);

              // Hybrid search:
              // 1) semantic candidates (vector search)
              // 2) lexical candidates (regex)
              // 3) merge distinct IDs
              List<Product> semantic = semanticSearch(categories, searchTerm, safeLimit);
              List<Product> lexical = lexicalSearch(categories, searchTerm, safeLimit);

              // If vector search returns nothing (common when embeddings aren't populated yet),
              // fall back to lexical search rather than returning an empty page.
              if (semantic == null || semantic.isEmpty()) {
                  log.info("Semantic search returned 0 results; falling back to lexical.");
                  return ResponseEntity.ok(lexical);
              }

              // Heuristic: for very short/generic queries (e.g. "home"), lexical matches are usually more precise.
              String q = searchTerm.trim();
              boolean preferLexical = q.length() <= 4;

              List<Product> merged = preferLexical
                      ? mergeDistinct(lexical, semantic, safeLimit)
                      : mergeDistinct(semantic, lexical, safeLimit);

              return ResponseEntity.ok(merged);
          } catch (Exception e) {
              // Fail open: if embeddings aren't configured or Atlas index is missing, fall back to lexical search.
              log.warn("Semantic search unavailable; falling back to lexical. Reason: {}", e.getMessage());
          }
      }

      List<Product> products = lexicalSearch(categories, searchTerm, limit);
      return ResponseEntity.ok(products);
    }

    private List<Product> lexicalSearch(List<String> categories, String searchTerm, int limit) {
        List<Criteria> criteriaList = new ArrayList<>();

        // If categories were supplied, match documents that have ALL of them (intersection)
        if (categories != null && !categories.isEmpty()) {
            criteriaList.add(Criteria.where(FIELD_CATEGORIES).all(categories));
        }

        // If a search term is supplied, do a case-insensitive regex search across relevant fields
        if (searchTerm != null && !searchTerm.isBlank()) {
            Pattern regex = buildExpandedRegex(searchTerm);
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(regex),
                    Criteria.where("slug").regex(regex),
                    Criteria.where(FIELD_CATEGORIES).regex(regex)
            );
            criteriaList.add(searchCriteria);
        }

        Query qObj = new Query();
        if (!criteriaList.isEmpty()) {
            qObj.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        if (limit > 0) {
            qObj.limit(Math.min(limit, 200));
        }

        return mongoTemplate.find(qObj, Product.class);
    }

    private static List<Product> mergeDistinct(List<Product> primary, List<Product> secondary, int limit) {
        int safeLimit = limit <= 0 ? 60 : Math.min(limit, 200);
        Set<String> seen = new LinkedHashSet<>();
        List<Product> out = new ArrayList<>();

        for (Product p : primary) {
            if (p == null) continue;
            String id = p.getId();
            if (id == null || id.isBlank()) continue;
            if (seen.add(id)) {
                out.add(p);
                if (out.size() >= safeLimit) return out;
            }
        }

        for (Product p : secondary) {
            if (p == null) continue;
            String id = p.getId();
            if (id == null || id.isBlank()) continue;
            if (seen.add(id)) {
                out.add(p);
                if (out.size() >= safeLimit) return out;
            }
        }

        return out;
    }

    private List<Product> semanticSearch(List<String> categories, String searchTerm, int limit) {
        if (embeddingService == null || !embeddingService.isEnabled()) {
            throw new IllegalStateException("Embeddings API not configured");
        }

        int safeLimit = limit <= 0 ? 60 : Math.min(limit, 200);
        int numCandidates = Math.max(100, safeLimit * 10);

        // Expand short queries a bit (plural/singular + a few domain synonyms) so embeddings
        // have a better chance to surface conceptual matches (e.g. shoe -> sneakers).
        String embeddingText = buildEmbeddingText(searchTerm);
        List<Double> queryVector = embeddingService.embed(embeddingText);

        Document vectorStage = new Document("$vectorSearch",
                new Document("index", atlasVectorIndex)
                        .append("path", atlasVectorPath)
                        .append("queryVector", queryVector)
                        .append("numCandidates", numCandidates)
                        .append("limit", safeLimit)
        );

        // Optional filter: enforce category intersection (all categories)
        if (categories != null && !categories.isEmpty()) {
            vectorStage.get("$vectorSearch", Document.class)
                    .append("filter", new Document(FIELD_CATEGORIES, new Document("$all", categories)));
        }

        List<Document> pipeline = new ArrayList<>();
        pipeline.add(vectorStage);

        // Include score metadata, but still return normal Product objects
        pipeline.add(new Document("$project", new Document("score", new Document("$meta", "vectorSearchScore"))
                .append("_id", 1)
                .append("id", 1)
                .append("name", 1)
                .append("description", 1)
                .append("price", 1)
                .append("imageUrl", 1)
                .append("slug", 1)
                .append("externalId", 1)
                .append("sku", 1)
                .append("categories", 1)
                .append("embedding", 1)
        ));

        List<Document> docs = mongoTemplate
                .getCollection("products")
                .aggregate(pipeline)
                .into(new ArrayList<>());

        // Hybrid tightening:
        // - Keep high-scoring semantic matches
        // - Also keep anything that lexically matches the query (prevents dropping obvious exact hits)
        // - Drop low-score outliers relative to the top score (reduces "weird" results)
        final String q = (searchTerm == null) ? "" : searchTerm.trim();
        final double bestScore = docs.stream()
                .mapToDouble(d -> {
                    Object s = d.get("score");
                    return (s instanceof Number n) ? n.doubleValue() : 0.0;
                })
                .max()
                .orElse(0.0);

        if (atlasVectorMinBestScore > 0 && bestScore > 0 && bestScore < atlasVectorMinBestScore) {
            log.info("Semantic search low-confidence (bestScore={}); falling back to lexical.", bestScore);
            return List.of();
        }

        final double ratio = (atlasVectorMinScoreRatio <= 0 || atlasVectorMinScoreRatio > 1)
                ? 0.80
                : atlasVectorMinScoreRatio;
        final double relativeCutoff = bestScore > 0 ? (bestScore * ratio) : 0.0;
        final double absoluteCutoff = Math.max(0.0, atlasVectorMinScore);
        final double cutoff = Math.max(relativeCutoff, absoluteCutoff);

        int topK = atlasVectorSemanticTopK <= 0 ? 20 : atlasVectorSemanticTopK;
        topK = Math.min(topK, safeLimit);

        List<Document> kept = new ArrayList<>();
        int keptSemantic = 0;

        // docs are already ordered by vectorSearchScore descending.
        for (Document d : docs) {
            Object s = d.get("score");
            double score = (s instanceof Number n) ? n.doubleValue() : 0.0;
            boolean isLex = lexicalMatch(d, q);

            if (score < cutoff && !isLex) {
                continue;
            }

            // Cap the long tail: only keep top-K semantic matches.
            if (!isLex) {
                if (keptSemantic >= topK) {
                    continue;
                }
                keptSemantic++;
            }

            kept.add(d);
        }

        return kept.stream()
                .map(d -> {
                    Object mongoId = d.get("_id");
                    if (mongoId != null && d.get("id") == null) {
                        d.put("id", mongoId.toString());
                    }
                    d.remove("_id");
                    d.remove("score");
                    return mongoTemplate.getConverter().read(Product.class, d);
                })
                .toList();
    }

    private static boolean lexicalMatch(Document d, String rawQuery) {
        if (d == null) return false;
        String q = rawQuery == null ? "" : rawQuery.trim().toLowerCase(Locale.ROOT);
        if (q.isBlank()) return true;

        String name = asLower(d.get("name"));
        String slug = asLower(d.get("slug"));
        String description = asLower(d.get("description"));
        String categories = "";
        Object catsObj = d.get("categories");
        if (catsObj instanceof List<?> list) {
            categories = list.stream()
                    .filter(it -> it != null)
                    .map(it -> String.valueOf(it).toLowerCase(Locale.ROOT))
                    .collect(Collectors.joining(" "));
        } else {
            categories = asLower(catsObj);
        }

        String haystack = (name + " " + slug + " " + description + " " + categories).trim();
        if (haystack.isBlank()) return false;

        // Match any expanded token (min length 3) to keep obvious exact-ish hits.
        Set<String> tokens = expandQueryTokens(q);
        for (String token : tokens) {
            if (token.length() >= 3 && haystack.contains(token)) return true;
        }
        return false;
    }

    private static Pattern buildExpandedRegex(String rawQuery) {
        Set<String> tokens = expandQueryTokens(rawQuery);
        if (tokens.isEmpty()) {
            // avoid regex injection
            String escaped = Pattern.quote(rawQuery == null ? "" : rawQuery.trim());
            return Pattern.compile(escaped, Pattern.CASE_INSENSITIVE);
        }

        String pattern = tokens.stream()
                .map(Pattern::quote)
                .collect(Collectors.joining("|"));

        return Pattern.compile("(?:" + pattern + ")", Pattern.CASE_INSENSITIVE);
    }

    private static String buildEmbeddingText(String rawQuery) {
        if (rawQuery == null) return "";
        String trimmed = rawQuery.trim();
        if (trimmed.isBlank()) return trimmed;

        Set<String> tokens = expandQueryTokens(trimmed);
        if (tokens.isEmpty()) return trimmed;

        // Preserve the user's original query, but add expansions for better recall.
        String expanded = String.join(" ", tokens);
        return trimmed + " " + expanded;
    }

    private static Set<String> expandQueryTokens(String rawQuery) {
        String q = rawQuery == null ? "" : rawQuery.trim().toLowerCase(Locale.ROOT);
        if (q.isBlank()) return Set.of();

        LinkedHashSet<String> out = new LinkedHashSet<>();
        for (String token : q.split("\\s+")) {
            addToken(out, token);

            String singular = singularize(token);
            addToken(out, singular);

            String plural = pluralize(token);
            addToken(out, plural);

            // Minimal domain synonyms to reduce common misses.
            if ("shoe".equals(token) || "shoes".equals(token) || "sneaker".equals(token) || "sneakers".equals(token)) {
                addToken(out, "shoe");
                addToken(out, "shoes");
                addToken(out, "sneaker");
                addToken(out, "sneakers");
                addToken(out, "footwear");
            }
        }
        return out;
    }

    private static void addToken(Set<String> out, String token) {
        if (out == null || token == null) return;
        String t = token.trim().toLowerCase(Locale.ROOT);
        if (!t.isBlank()) out.add(t);
    }

    private static String singularize(String token) {
        if (token == null) return "";
        String t = token.trim().toLowerCase(Locale.ROOT);
        if (t.length() <= 3) return t;
        if (t.endsWith("ss")) return t;
        if (t.endsWith("s")) return t.substring(0, t.length() - 1);
        return t;
    }

    private static String pluralize(String token) {
        if (token == null) return "";
        String t = token.trim().toLowerCase(Locale.ROOT);
        if (t.length() <= 2) return t;
        if (t.endsWith("s")) return t;
        return t + "s";
    }

    private static String asLower(Object v) {
        if (v == null) return "";
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? "" : s.toLowerCase(Locale.ROOT);
    }

    /**
     * POST Method
     * Create a new product
     * `/api/products`
     * @author Haley Kenney
     * @param product
     * @return saves new product to the database
     */
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    /**
     * PUT Method
     * Update an existing product
     * `/api/products/{id}`
     * @author Haley Kenney
     * @param id Product ID
     * @param productDetails Updated product details
     * @return returns success if product successfully updated, else not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setDescription(productDetails.getDescription());
                    product.setPrice(productDetails.getPrice());
                    product.setImageUrl(productDetails.getImageUrl());
                    product.setCategories(productDetails.getCategories());
                    Product updatedProduct = productRepository.save(product);
                    return ResponseEntity.ok(updatedProduct);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE Method
     * Delete a product
     * `/api/products/{id}`
     * @author Haley Kenney
     * @param id Product ID
     * @return returns success if product successfully deleted, else not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
