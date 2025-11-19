package com.runtimerebels.store.controller;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeSessionController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @GetMapping("/session/{id}")
    public Map<String, Object> getSession(@PathVariable String id) throws Exception {
        Stripe.apiKey = stripeSecretKey;

        // Retrieve checkout session
        Session session = Session.retrieve(id);
        Map<String, Object> response = new HashMap<>();

        // Basic info
        response.put("id", session.getId());
        response.put("customer_email", session.getCustomerEmail());
        response.put("payment_status", session.getPaymentStatus());
        response.put("amount_total", session.getAmountTotal());

        // Customer details
        if (session.getCustomerDetails() != null) {
            Map<String, Object> cd = new HashMap<>();
            cd.put("email", session.getCustomerDetails().getEmail());
            cd.put("name", session.getCustomerDetails().getName());
            cd.put("phone", session.getCustomerDetails().getPhone());
            response.put("customer_details", cd);
        }

        // Shipping details
        if (session.getShippingDetails() != null &&
                session.getShippingDetails().getAddress() != null) {

            Map<String, Object> shipping = new HashMap<>();
            shipping.put("name", session.getShippingDetails().getName());

            Map<String, Object> addr = new HashMap<>();
            addr.put("line1", session.getShippingDetails().getAddress().getLine1());
            addr.put("city", session.getShippingDetails().getAddress().getCity());
            addr.put("state", session.getShippingDetails().getAddress().getState());

            shipping.put("address", addr);
            response.put("shipping_details", shipping);
        }

        return response;
    }
}
