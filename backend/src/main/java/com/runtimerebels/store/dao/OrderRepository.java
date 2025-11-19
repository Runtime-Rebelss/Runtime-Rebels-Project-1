package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserEmail(String email);
    List<Order> findByStripeSessionId(String stripeSessionId);
}
