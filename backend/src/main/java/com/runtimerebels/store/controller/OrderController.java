package com.runtimerebels.store.controller;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.Order;
import com.runtimerebels.store.dao.OrderRepository;

import static org.springframework.web.servlet.function.ServerResponse.status;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;
    // Get all orders
    @GetMapping
    public List<Order> getAllOrders() { return orderRepository.findAll(); }
    // Get order
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable String orderId) {
        return orderRepository.findById(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // Create new order
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }
    // Delete the order
    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteOrderById(@PathVariable String orderId) {
        if (!orderRepository.existsById(orderId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found.");
        }
        orderRepository.deleteById(orderId);
        return ResponseEntity.ok("Order deleted.");
    }
}
