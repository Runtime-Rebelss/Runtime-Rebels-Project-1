package com.project1.spring_boot.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.project1.spring_boot.models.Cart;

// Update this to containt the CartProduct and CartProductId
public interface CartRepository extends MongoRepository<Cart, Integer> {

}
