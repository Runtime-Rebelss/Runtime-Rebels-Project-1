package com.runtimerebels.store.config;

import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.models.Product;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDatabase(ProductRepository repository) {
        return args -> {
            System.out.println("🌱 Checking if Fake Store API data needs to be seeded...");
            RestTemplate restTemplate = new RestTemplate();

            // Only seed if not already populated
            if (repository.count() < 20) {
                System.out.println("🌱 Fetching data from Fake Store API...");
                Object[] fakeStoreResponse = restTemplate.getForObject("https://fakestoreapi.com/products", Object[].class);

                // Convert JSON response to a list of maps
                var products = Arrays.stream(fakeStoreResponse)
                        .map(obj -> (Map<?, ?>) obj)
                        .collect(Collectors.toList());

                products.forEach(data -> {
                    String name = (String) data.get("title");
                    String description = (String) data.get("description");
                    Double price = ((Number) data.get("price")).doubleValue();
                    String imageUrl = (String) data.get("image");
                    String category = (String) data.get("category");

                    // Skip duplicates by name
                    boolean exists = repository.findAll().stream()
                            .anyMatch(p -> p.getName().equalsIgnoreCase(name));

                    if (!exists) {
                        Product p = new Product();
                        p.setName(name);
                        p.setDescription(description);
                        p.setPrice(BigDecimal.valueOf(price));
                        p.setImageUrl(imageUrl);
                        p.setCategory(category);
                        repository.save(p);
                        System.out.println("✅ Added: " + name + " (" + category + ")");
                    }
                });

                System.out.println("✅ Seeding complete! Total products: " + repository.count());
            } else {
                System.out.println("✅ Products already exist, skipping seeding.");
            }
        };
    }
}
