package com.runtimerebels.store.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;

import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.Order;
import com.runtimerebels.store.dao.OrderRepository;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    // Get all orders
    @GetMapping
    public List<Order> getAllOrders() { return orderRepository.findAll(); }

    // Get order
    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable String userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders);
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

    @PostMapping("/confirm/{userId}")
    public ResponseEntity<Order> confirmPayment(@PathVariable String userId) throws Exception {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found!"));
        Calendar calendar = Calendar.getInstance();

        // Create the order
        Order order = new Order();
        order.setUserId(userId);
        order.setProductIds(cart.getProductIds());
        order.setQuantity(cart.getQuantity());
        order.setTotalPrice(cart.getTotalPrice());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setCreatedAt(calendar.getTime());
        order.setProcessAt(null);
        orderRepository.save(order);

        // Remove item(s) from cart
        cart.setProductIds(new ArrayList<>());
        cart.setQuantity(new ArrayList<>());
        cart.setTotalPrice(new ArrayList<>());
        cartRepository.save(cart);

        return ResponseEntity.ok(order);
    }
}
