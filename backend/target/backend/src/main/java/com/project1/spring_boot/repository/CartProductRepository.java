package com.project1.spring_boot.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.project1.spring_boot.models.Cart;
public interface CartProductRepository extends  MongoRepository<Cart, String> {
    Optional<Cart> findByUserId(String userId);
}
