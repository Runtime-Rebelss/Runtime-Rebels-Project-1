package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    // query by name
    List<Product> findByName(String name);
    List<Product> findByNameContaining(String name);

    // query by price
    List<Product> findByPrice(BigDecimal price);
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    // query by category
    // Find products whose `categories` list contains any of the provided values.
    // Use a Collection/List parameter so Spring Data can derive the proper $in query.
    @org.springframework.data.mongodb.repository.Query("{ 'categories': { $all: ?0 } }")
    List<Product> findByCategoriesAllIgnoreCaseSensitive(java.util.List<String> categories);
    // For single-value case-insensitive contains, keep a helper method
    List<Product> findByCategoriesContainingIgnoreCase(String category);
}