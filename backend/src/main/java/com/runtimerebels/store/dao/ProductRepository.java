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
}