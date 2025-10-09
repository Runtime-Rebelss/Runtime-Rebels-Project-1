package com.runtimerebels.store.dao;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.runtimerebels.store.models.Cart;
public interface CartRepository extends  MongoRepository<Cart, String> {
    List<Cart> findByUserId(String userId);
}
