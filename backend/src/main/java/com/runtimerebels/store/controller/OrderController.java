package com.runtimerebels.store.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;

import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.OrderStatus;
import com.runtimerebels.store.models.Product;
import com.runtimerebels.store.models.dto.OrderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.Order;
import com.runtimerebels.store.dao.OrderRepository;

/**
 * REST controller for managing customer orders.
 * Handles endpoints for creating new orders and retrieving existing ones.
 * Communicates with the {@link OrderRepository} for persistence.
 *
 * Base URL: /api/orders
 *
 * @author Haley Kenney, Henry Locke
 */

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ProductRepository productRepository;

    // Get all orders
    @GetMapping
    public List<Order> getAllOrders() { return orderRepository.findAll(); }

    /**
     * get orders by user id
     *
     * @param userId userId
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see List
     */ // Get all orders for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable String userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/email/{userEmail}")
    public ResponseEntity<List<Order>> getOrdersByEmail(@PathVariable String userEmail) {
        List<Order> orders = orderRepository.findByUserId(userEmail);
        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders);
    }

    /**
     * get order details
     *
     * @param orderId orderId
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see OrderResponse
     */ // Gets one specific order
    @GetMapping("/details/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetails(@PathVariable String orderId) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    List<Product> products = productRepository.findAllById(order.getProductIds());
                    return ResponseEntity.ok(new OrderResponse(order, products));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * create order
     *
     * @param order order
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see Order
     */ // Create new order
    @PostMapping("create/{userId}")
    public ResponseEntity<Order> createOrder(@PathVariable String userId, @RequestBody Order order) {
        System.out.println("Received order: " + order);
        // Prevents dupe
        order.setUserId(userId);

        // simple duplicate check by sessionId
        if (order.getStripeSessionId() != null) {
            List<Order> existingOrders = orderRepository.findByStripeSessionId(order.getStripeSessionId());
            if (!existingOrders.isEmpty()) {
                System.out.println("Duplicate order detected, ignoring...");
                return ResponseEntity.ok(existingOrders.get(0));
            }
        }

        order.setPaymentStatus("Paid");
        Order savedOrder = orderRepository.save(order);
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found!"));

        // Remove item(s) from cart
        cart.setProductIds(new ArrayList<>());
        cart.setQuantity(new ArrayList<>());
        cart.setTotalPrice(new ArrayList<>());
        cartRepository.save(cart);

        System.out.println("Saved order with ID: " + savedOrder.getOrderId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    /**
     * delete order by id
     *
     * @param orderId orderId
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see String
     */ // Delete the order
    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteOrderById(@PathVariable String orderId) {
        if (!orderRepository.existsById(orderId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found.");
        }
        orderRepository.deleteById(orderId);
        return ResponseEntity.ok("Order deleted.");
    }

    /**
     * confirm payment
     *
     * @param userId userId
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see Order
     * @throws Exception java.lang. exception
     */
    @PostMapping("/confirm/{userId}")
public ResponseEntity<Order> confirmPayment(@PathVariable String userId, @RequestBody Order request) throws Exception {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found!"));
        Calendar calendar = Calendar.getInstance();

        // Create the order
        Order order = new Order();
        order.setUserId(userId);
        order.setProductIds(cart.getProductIds());
        order.setQuantity(cart.getQuantity());
        order.setTotalPrice(cart.getTotalPrice());
        order.setStripeSessionId(request.getStripeSessionId());
        order.setPaymentStatus("paid");
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