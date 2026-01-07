package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.dao.OrderRepository;
import com.runtimerebels.store.models.dto.CheckoutRequest;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.stripe.model.PaymentIntent;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for handling Stripe payment operations.
 * Creates Stripe Checkout Sessions based on frontend requests
 * and configures shipping, billing, and customer options.
 * Base URL: /api/payments
 *
 * @see com.runtimerebels.store.models.dto.CheckoutRequest
 * @author Haley Kenney, and Henry Locke
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${frontend.successUrl}")
    private String successUrl;

    @Value("${frontend.cancelUrl}")
    private String cancelUrl;

    /**
     * Creates a new Stripe Checkout Session for the given order request.
     *
     * @param req The {@link CheckoutRequest} containing order and customer details
     * @return A ResponseEntity containing the Checkout Session URL
     * @throws Exception if session creation fails
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckout(@RequestBody CheckoutRequest req) throws Exception {

        // Build Stripe line items (as raw param maps to avoid typed builder issues)
        List<Map<String, Object>> lineItems = new ArrayList<>();
        for (var it : req.items()) {
            Map<String, Object> productData = new HashMap<>();
            productData.put("name", it.name());

            Map<String, Object> priceData = new HashMap<>();
            priceData.put("currency", it.currency());
            priceData.put("unit_amount", it.unitAmount()); // in cents
            priceData.put("product_data", productData);

            Map<String, Object> lineItem = new HashMap<>();
            lineItem.put("price_data", priceData);
            lineItem.put("quantity", it.quantity());

            lineItems.add(lineItem);
        }

        // Build the top-level params map for Stripe Checkout Session
        Map<String, Object> params = new HashMap<>();
        params.put("mode", "payment");
        params.put("success_url", successUrl);
        params.put("cancel_url", cancelUrl);
        params.put("line_items", lineItems);

        // Require billing address and contact info
        params.put("billing_address_collection", "required");

        // Shipping address collection
        Map<String, Object> shippingAddressCollection = new HashMap<>();
        List<String> allowed = new ArrayList<>();
        allowed.add("US");
        shippingAddressCollection.put("allowed_countries", allowed);
        params.put("shipping_address_collection", shippingAddressCollection);

        // Shipping options (as raw maps)
        List<Map<String, Object>> shippingOptions = new ArrayList<>();

        Map<String, Object> standard = new HashMap<>();
        Map<String, Object> standardRateData = new HashMap<>();
        standardRateData.put("display_name", "Standard (5–7 days)");
        standardRateData.put("type", "fixed_amount");
        Map<String, Object> standardFixed = new HashMap<>();
        standardFixed.put("amount", 799);
        standardFixed.put("currency", "usd");
        standardRateData.put("fixed_amount", standardFixed);
        standard.put("shipping_rate_data", standardRateData);
        shippingOptions.add(standard);

        Map<String, Object> expedited = new HashMap<>();
        Map<String, Object> expeditedRateData = new HashMap<>();
        expeditedRateData.put("display_name", "Expedited (2–3 days)");
        expeditedRateData.put("type", "fixed_amount");
        Map<String, Object> expeditedFixed = new HashMap<>();
        expeditedFixed.put("amount", 1499);
        expeditedFixed.put("currency", "usd");
        expeditedRateData.put("fixed_amount", expeditedFixed);
        expedited.put("shipping_rate_data", expeditedRateData);
        shippingOptions.add(expedited);

        params.put("shipping_options", shippingOptions);

        // Request contact info fields directly from Stripe
        Map<String, Object> phoneNumberCollection = new HashMap<>();
        phoneNumberCollection.put("enabled", true);
        params.put("phone_number_collection", phoneNumberCollection);

        // Ask Stripe to collect the customer's email at checkout
        params.put("customer_creation", "always");
        params.put("submit_type", "pay");

        // Create the session using a raw params map to be compatible across stripe-java versions
        Session session = Session.create(params);

        System.out.println("Stripe Checkout session created for: " + req.customerEmail());

        return ResponseEntity.ok().body(new CreateCheckoutResponse(session.getUrl()));
    }
    /** Response record for returning the Stripe Checkout URL. */
    private record CreateCheckoutResponse(String url) {}
}