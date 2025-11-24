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
    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;


    @Autowired
    public ProductController(ProductRepository productRepository, MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.mongoTemplate = mongoTemplate;
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
     * Get products by category (must match all)
     * `/api/products/category?categories=cat1`
     * @author Frank Gonzalez
     * @param categories Array of category names
     * @return returns list of products matching all categories
    */
    @GetMapping("/category")
    public List<Product> getProductsByCategory(@RequestParam(required = false) String[] categories) {
        if (categories == null || categories.length == 0) {
            return productRepository.findAll();
        }
        return productRepository.findByCategoriesAll(Arrays.asList(categories));
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
