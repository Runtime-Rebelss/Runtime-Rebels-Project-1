package com.runtimerebels.store.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.models.Product;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.Arrays;
/**
 * ProductController - REST API for managing products.
 *
 * Endpoints implemented:
 * - GET /api/products        : Get all products
 * - GET /api/products/{id}   : Get a single product by ID
 * - POST /api/products       : Create a new product
 *
 * Extra endpoints (not required for Product Details, but useful for full CRUD):
 * - PUT /api/products/{id}   : Update an existing product
 * - DELETE /api/products/{id} : Delete a product
 */


@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;

    @Autowired
    public ProductController(ProductRepository productRepository, MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get a single product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get products by category (case-insensitive, must match all)
    @GetMapping("/category")
    public List<Product> getProductsByCategory(@RequestParam(required = false) String[] categories) {
        if (categories == null || categories.length == 0) {
            return productRepository.findAll();
        }
        // Build regex patterns for case-insensitive exact match
        List<Pattern> patterns = Arrays.stream(categories)
            .map(cat -> Pattern.compile("^" + Pattern.quote(cat) + "$", Pattern.CASE_INSENSITIVE))
            .collect(Collectors.toList());
        Query query = new Query(Criteria.where("categories").all(patterns));
        return mongoTemplate.find(query, Product.class);
    }

    // Create a new product
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // Update an existing product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setDescription(productDetails.getDescription());
                    product.setPrice(productDetails.getPrice());
                    Product updatedProduct = productRepository.save(product);
                    return ResponseEntity.ok(updatedProduct);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a product
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
