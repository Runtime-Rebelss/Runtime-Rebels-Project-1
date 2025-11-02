package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRepository extends MongoRepository<Order, String> {
}
