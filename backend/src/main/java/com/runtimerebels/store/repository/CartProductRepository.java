package com.runtimerebels.store.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.runtimerebels.store.models.Cart;
public interface CartProductRepository extends  MongoRepository<Cart, String> {
    Optional<Cart> findByUserId(String userId);
}
