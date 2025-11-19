package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.math.BigDecimal;
import java.util.List;

/**
 * ProductRepository - MongoDB repository for Product entities.
 * Provides CRUD operations and custom query methods.
 * @author Haley Kenney, Frank Gonzalez
 * @since 11-19-2025
 */

public interface ProductRepository extends MongoRepository<Product, String> {
    
    /**
     * Find products by exact name.
     * @param name the product name
     * @return list of products with the given name
    */
    List<Product> findByName(String name);

    /**
     * Find products by name containing a given string.
     * @param name the substring to search for in product names
     * @return list of products whose names contain the given string
    */
    List<Product> findByNameContaining(String name);

    /**
     * Find products by exact price.
     * @param price given price 
     * @return list of products with the given price
     */
    List<Product> findByPrice(BigDecimal price);

    /**
     * Find products with prices between the given minimum and maximum values.
     * @param min the minimum price
     * @param max the maximum price
     * @return list of products with prices between min and max
    */
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    /**
     * Find products whose `categories` list contains all of the provided values (case-sensitive).
     * @param categories the list of categories to match
     * @return list of products whose categories contain all the given values
     */
    @org.springframework.data.mongodb.repository.Query("{ 'categories': { $all: ?0 } }")
    List<Product> findByCategoriesAllIgnoreCaseSensitive(java.util.List<String> categories);
    /**
     * Find products whose `categories` list contains the provided value (case-insensitive).
     * @param category the category to match
     * @return list of products whose categories contain the given value
     */
    List<Product> findByCategoriesContainingIgnoreCase(String category);
}