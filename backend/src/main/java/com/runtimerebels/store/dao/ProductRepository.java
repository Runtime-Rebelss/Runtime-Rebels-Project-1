package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.math.BigDecimal;
import java.util.List;
/**
 * Repository interface for accessing and managing {@link Product} documents
 * in MongoDB. Extends {@link MongoRepository} to provide CRUD operations
 * and defines custom query methods for filtering products by name or price.
 *
 * @author Haley Kenney
 */
public interface ProductRepository extends MongoRepository<Product, String> {
    /** Retrieves products matching an exact name. */
    List<Product> findByName(String name);
    /** Retrieves products whose name contains the specified text. */
    List<Product> findByNameContaining(String name);

    /** Retrieves products that match the exact price. */
    List<Product> findByPrice(BigDecimal price);
    /** Retrieves products whose prices fall within a given range. */
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);
}