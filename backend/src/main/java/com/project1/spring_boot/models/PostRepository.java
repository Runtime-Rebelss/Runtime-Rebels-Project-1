package com.project1.spring_boot.models;

import org.springframework.data.mongodb.repository.MongoRepository;

// Data you want to get and key 
public interface PostRepository extends MongoRepository<Post, String>{
    
}
