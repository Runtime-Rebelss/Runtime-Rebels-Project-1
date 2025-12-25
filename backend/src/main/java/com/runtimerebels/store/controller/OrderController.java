package com.runtimerebels.store.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.dao.OrderRepository;
import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.CartItem;
import com.runtimerebels.store.models.Order;
import com.runtimerebels.store.models.OrderStatus;
import com.runtimerebels.store.models.Product;
import com.runtimerebels.store.models.dto.OrderResponse;

/**
 * REST controller for managing customer orders. Handles endpoints for creating
 * new orders and retrieving existing ones. Communicates with the
 * {@link OrderRepository} for persistence.
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
    @Autowired
    private StripeSessionController stripeSessionController;

    // -------------------- Helpers: normalize Stripe session data --------------------

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }

    private String firstString(Object... candidates) {
        if (candidates == null) return null;
        for (Object c : candidates) {
            if (c == null) continue;
            if (c instanceof String) {
                String s = ((String) c).trim();
                if (!s.isEmpty()) return s;
            } else {
                String s = c.toString().trim();
                if (!s.isEmpty()) return s;
            }
        }
        return null;
    }

    private Map<String, Object> firstMap(Object... candidates) {
        if (candidates == null) return null;
        for (Object c : candidates) {
            Map<String, Object> m = asMap(c);
            if (m != null && !m.isEmpty()) return m;
        }
        return null;
    }

    /**
     * Populate shipping/customer details into the provided order using the
     * Stripe session map. This method defensively checks multiple possible key
     * names and falls back to customer details when shipping is absent.
     */
    private void populateShippingFromSession(Order order, Map<String, Object> session) {
        if (session == null || order == null) return;

        // debug: print whole session map to make it easy to inspect what's returned
        System.out.println("DEBUG stripe session: " + session);

        Map<String, Object> shipping = firstMap(session.get("shipping"), session.get("shipping_details"), session.get("shipping_details_response"));
        String stripeFullName = null;

        if (shipping != null) {
            stripeFullName = firstString(shipping.get("name"), shipping.get("full_name"));
            String shippingName = firstString(shipping.get("name"), shipping.get("full_name"));
            if (shippingName != null) order.setDeliveryName(shippingName);

            Map<String, Object> addr = firstMap(shipping.get("address"), shipping.get("addr"));
            if (addr != null) {
                String line1 = firstString(addr.get("line1"), addr.get("line_1"), addr.get("address_line1"));
                String city = firstString(addr.get("city"), addr.get("locality"));
                String state = firstString(addr.get("state"), addr.get("region"));
                if (line1 != null) order.setDeliveryAddress(line1);
                if (city != null) order.setDeliveryCity(city);
                if (state != null) order.setDeliveryState(state);
            }
        }

        Map<String, Object> cust = firstMap(session.get("customer_details"), session.get("customer"));
        if (cust != null) {
            if (stripeFullName == null) {
                stripeFullName = firstString(cust.get("name"), cust.get("full_name"));
            }
            String phone = firstString(cust.get("phone"), cust.get("contact"));
            if (phone != null) order.setDeliveryContact(phone);

            Map<String, Object> custAddr = firstMap(cust.get("address"), cust.get("addr"));
            if (custAddr != null) {
                if (order.getDeliveryAddress() == null) {
                    String line1 = firstString(custAddr.get("line1"), custAddr.get("line_1"), custAddr.get("address_line1"));
                    if (line1 != null) order.setDeliveryAddress(line1);
                }
                if (order.getDeliveryCity() == null) {
                    String city = firstString(custAddr.get("city"), custAddr.get("locality"));
                    if (city != null) order.setDeliveryCity(city);
                }
                if (order.getDeliveryState() == null) {
                    String state = firstString(custAddr.get("state"), custAddr.get("region"));
                    if (state != null) order.setDeliveryState(state);
                }
            }
        }

        if ((order.getFullName() == null || order.getFullName().trim().isEmpty()) && stripeFullName != null) {
            order.setFullName(stripeFullName);
        }
    }

    // -------------------- End helpers --------------------

    // Get all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

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

        if (order.getStripeSessionId() != null) {
            try {
                Map<String, Object> session = stripeSessionController.getSession(order.getStripeSessionId());
                // use helper to populate shipping/customer details
                populateShippingFromSession(order, session);
            } catch (Exception e) {
                System.err.println("Failed to fetch stripe session for order creation: " + e.getMessage());
            }
        }

        order.setPaymentStatus("Paid");
        Order savedOrder = orderRepository.save(order);
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found!"));

        // Clear cart items
        cart.setItems(new ArrayList<>());
        cartRepository.save(cart);

        System.out.println("Saved order with ID: " + savedOrder.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    /**
     *
     * @param request
     * @return
     */
    @PostMapping("/guest")
    public ResponseEntity<Order> createGuestOrder(@RequestBody Order request) {
        Calendar calendar = Calendar.getInstance();

        Order order = new Order();
        order.setUserId("guest-" + calendar.getTimeInMillis()); // unique guest ID
        order.setUserEmail("Guest");
        order.setProductIds(request.getProductIds());
        order.setQuantity(request.getQuantity());
        order.setTotalPrice(request.getTotalPrice());
        order.setStripeSessionId(request.getStripeSessionId());

        if (request.getStripeSessionId() != null) {
            try {
                Map<String, Object> session = stripeSessionController.getSession(request.getStripeSessionId());
                // use helper to populate shipping/customer details
                populateShippingFromSession(order, session);
            } catch (Exception e) {
                System.err.println("Failed to fetch stripe session for guest order: " + e.getMessage());
            }
        }
        order.setPaymentStatus("paid");
        order.setOrderStatus(OrderStatus.PENDING);
        order.setCreatedAt(calendar.getTime());
        order.setProcessAt(null);

        Order saved = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
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
        order.setFullName(request.getFullName());
        // Map cart items into order product lists
        List<String> productIds = new ArrayList<>();
        List<Integer> quantities = new ArrayList<>();
        List<java.math.BigDecimal> totalPrices = new ArrayList<>();
        if (cart.getItems() != null) {
            for (CartItem it : cart.getItems()) {
                if (it == null || it.getProduct() == null) {
                    continue;
                }
                productIds.add(it.getProduct().getId());
                Integer qty = it.getQuantity();
                if (qty == null) {
                    qty = 0;
                }
                quantities.add(qty);
                totalPrices.add(it.getItemTotal());
            }
        }
        order.setProductIds(productIds);
        order.setQuantity(quantities);
        order.setTotalPrice(totalPrices);
        order.setStripeSessionId(request.getStripeSessionId());
        // If we have a stripe session id, attempt to fetch shipping/customer details and prefer shipping name for fullname
        if (request.getStripeSessionId() != null) {
            try {
                Map<String, Object> session = stripeSessionController.getSession(request.getStripeSessionId());
                // use helper to populate shipping/customer details
                populateShippingFromSession(order, session);
            } catch (Exception e) {
                System.err.println("Failed to fetch stripe session for confirmPayment: " + e.getMessage());
            }
        }
        order.setPaymentStatus("Paid");
        order.setOrderStatus(OrderStatus.PENDING);
        order.setCreatedAt(calendar.getTime());
        order.setProcessAt(null);
        orderRepository.save(order);

        // Remove item(s) from cart
        cart.setItems(new ArrayList<>());
        cartRepository.save(cart);

        return ResponseEntity.ok(order);
    }
}
