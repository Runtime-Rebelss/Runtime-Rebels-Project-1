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
              List<Product> semantic = semanticSearch(categories, searchTerm, limit);
              return ResponseEntity.ok(semantic);
          } catch (Exception e) {
              // Fail open: if embeddings aren't configured or Atlas index is missing, fall back to lexical search.
              log.warn("Semantic search unavailable; falling back to lexical. Reason: {}", e.getMessage());
          }
      }

      List<Criteria> criteriaList = new ArrayList<>();

      // If categories were supplied, match documents that have ALL of them (intersection)
      if (categories != null && 
        !categories.isEmpty()) {
                    criteriaList.add(Criteria.where(FIELD_CATEGORIES).all(categories));
      }

      // If a search term is supplied, do a case-insensitive regex search across relevant fields
      if (searchTerm != null && 
        !searchTerm.isBlank()) {
          String escaped = Pattern.quote(searchTerm.trim()); // avoid regex injection
          Pattern regex = Pattern.compile(escaped, Pattern.CASE_INSENSITIVE);
          // Example: search name, slug, and description
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

      List<Product> products = mongoTemplate.find(qObj, Product.class);

      return ResponseEntity.ok(products);
    }

    private List<Product> semanticSearch(List<String> categories, String searchTerm, int limit) {
        if (embeddingService == null || !embeddingService.isEnabled()) {
            throw new IllegalStateException("Embeddings API not configured");
        }

        int safeLimit = limit <= 0 ? 60 : Math.min(limit, 200);
        int numCandidates = Math.max(100, safeLimit * 10);

        List<Double> queryVector = embeddingService.embed(searchTerm);

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

        return docs.stream()
                .map(d -> {
                    // Prefer converting from Mongo's internal _id to the Product.id field.
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
