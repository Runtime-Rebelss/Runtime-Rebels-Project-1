package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {


    List<Order> findByUserId(String userId);
}
