package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.OrderRepository;
import com.runtimerebels.store.models.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        System.out.println("Received order: " + order);

        // simple duplicate check by sessionId
        if (order.getStripeSessionId() != null) {
            List<Order> existingOrders = orderRepository.findByStripeSessionId(order.getStripeSessionId());
            if (!existingOrders.isEmpty()) {
                System.out.println("Duplicate order detected, ignoring...");
                return existingOrders.get(0);
            }
        }

        order.setPaymentStatus("paid");
        Order savedOrder = orderRepository.save(order);
        System.out.println("Saved order with ID: " + savedOrder.getId());
        return savedOrder;
    }

    @GetMapping("/{email}")
    public List<Order> getOrdersByEmail(@PathVariable String email) {
        return orderRepository.findByUserEmail(email);
    }
}
