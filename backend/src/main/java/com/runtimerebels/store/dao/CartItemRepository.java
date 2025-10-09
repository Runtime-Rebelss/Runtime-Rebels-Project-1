package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartItemRepository extends MongoRepository<CartItem, String> {
}
