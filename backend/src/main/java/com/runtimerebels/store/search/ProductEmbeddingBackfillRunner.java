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
        int processed = 0;
        int updated = 0;

        for (Product p : all) {
            if (maxToProcess > 0 && processed >= maxToProcess) break;
            processed++;

            if (p.getEmbedding() != null && !p.getEmbedding().isEmpty()) {
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
            }
        }

        log.info("Embedding backfill finished. processed={} updated={}", processed, updated);
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
            parts.add("Categories: " + String.join(", ", cats.stream().filter(Objects::nonNull).toList()));
        }

        return String.join("\n", parts).trim();
    }
}
