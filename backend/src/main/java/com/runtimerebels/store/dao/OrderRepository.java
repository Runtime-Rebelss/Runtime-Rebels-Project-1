package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByUserId(String userId);
}
