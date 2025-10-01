package com.project1.spring_boot.models;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartRepository extends MongoRepository<Cart, Integer> {
    
}
