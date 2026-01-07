package com.runtimerebels.store.search;

import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.models.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * One-off backfill job to generate embeddings for all products.
 *
 * Enable with:
 * -Dembeddings.backfill=true
 * or env var: EMBEDDINGS_BACKFILL=true
 */
@Component
public class ProductEmbeddingBackfillRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductEmbeddingBackfillRunner.class);

    private final ProductRepository productRepository;
    private final EmbeddingService embeddingService;

    @Value("${embeddings.backfill:false}")
    private boolean backfill;

    @Value("${embeddings.backfill.limit:0}")
    private int maxToProcess;

    @Value("${embeddings.backfill.force:false}")
    private boolean force;

    public ProductEmbeddingBackfillRunner(ProductRepository productRepository, EmbeddingService embeddingService) {
        this.productRepository = productRepository;
        this.embeddingService = embeddingService;
    }

    @Override
    public void run(String... args) {
        if (!backfill) return;
        if (!embeddingService.isEnabled()) {
            log.warn("Embedding backfill requested, but embeddings.apiKey is not set; skipping.");
            return;
        }

        List<Product> all = productRepository.findAll();
        long missingBefore = all.stream()
                .filter(p -> p == null || p.getEmbedding() == null || p.getEmbedding().isEmpty())
                .count();

        log.info("Embedding backfill starting. totalProducts={} missingEmbeddingsBefore={} force={} limit={}",
                all.size(), missingBefore, force, maxToProcess);

        int processed = 0;
        int updated = 0;
        int skipped = 0;
        int failed = 0;

        for (Product p : all) {
            if (maxToProcess > 0 && processed >= maxToProcess) break;
            processed++;

            if (!force && p.getEmbedding() != null && !p.getEmbedding().isEmpty()) {
                skipped++;
                continue;
            }

            String text = buildEmbeddingText(p);
            if (text.isBlank()) continue;

            try {
                List<Double> vec = embeddingService.embed(text);
                p.setEmbedding(vec);
                productRepository.save(p);
                updated++;

                // Keep it gentle on rate limits.
                sleepQuietly(150L);
            } catch (Exception e) {
                log.warn("Failed embedding for product id={}: {}", p.getId(), e.getMessage());
                failed++;
            }
        }

        long missingAfter = productRepository.findAll().stream()
                .filter(p -> p == null || p.getEmbedding() == null || p.getEmbedding().isEmpty())
                .count();

        log.info("Embedding backfill finished. processed={} updated={} skipped={} failed={} missingEmbeddingsAfter={}",
                processed, updated, skipped, failed, missingAfter);
    }

    private static void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static String buildEmbeddingText(Product p) {
        List<String> parts = new ArrayList<>();
        if (p == null) return "";

        if (p.getName() != null && !p.getName().isBlank()) parts.add(p.getName());
        if (p.getDescription() != null && !p.getDescription().isBlank()) parts.add(p.getDescription());

        List<String> cats = p.getCategories();
        if (cats != null && !cats.isEmpty()) {
            List<String> normalized = cats.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();

            if (!normalized.isEmpty()) {
                parts.add("Categories: " + String.join(", ", normalized));
                parts.add("Category keywords: " + String.join(", ", normalized.stream().map(ProductEmbeddingBackfillRunner::expandCategoryKeywords).flatMap(List::stream).distinct().toList()));
            }
        }

        return String.join("\n", parts).trim();
    }

    private static List<String> expandCategoryKeywords(String raw) {
        // Keep this tiny + deterministic: it's just to avoid obvious misses like
        // query "furniture" when category is "home+and+garden".
        String c = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        if (c.isBlank()) return List.of();

        String spaced = c.replace('+', ' ').replace('&', ' ').replaceAll("\\band\\b", " ").replaceAll("\\s+", " ").trim();
        List<String> out = new ArrayList<>();
        out.add(c);
        if (!spaced.equals(c)) out.add(spaced);

        // Synonym-ish expansions
        if (spaced.contains("home") || spaced.contains("garden")) {
            out.add("home");
            out.add("garden");
            out.add("furniture");
            out.add("decor");
        }
        if (spaced.contains("furniture")) {
            out.add("home");
            out.add("decor");
        }

        return out.stream().filter(s -> s != null && !s.isBlank()).distinct().toList();
    }
}
