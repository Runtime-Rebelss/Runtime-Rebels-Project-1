package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.OrderRepository;
import com.runtimerebels.store.models.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
/**
 * REST controller for managing customer orders.
 * Handles endpoints for creating new orders and retrieving existing ones.
 * Communicates with the {@link OrderRepository} for persistence.
 *
 * Base URL: /api/orders
 *
 * @author Haley Kenney
 */

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    /**
     * Creates a new order or returns an existing one if a duplicate Stripe session ID is found.
     *
     * @param order The {@link Order} to be created
     * @return The saved or existing {@link Order}
     */
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
    /**
     * Retrieves all orders associated with a given user's email.
     *
     * @param email The user's email address
     * @return List of {@link Order} objects for that user
     */
    @GetMapping("/{email}")
    public List<Order> getOrdersByEmail(@PathVariable String email) {
        return orderRepository.findByUserEmail(email);
    }
}
