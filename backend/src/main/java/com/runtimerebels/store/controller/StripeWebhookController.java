package com.runtimerebels.store.controller;

import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Charge;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Stripe.apiKey = stripeSecretKey;
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("⚠️ Webhook signature verification failed.");
        }

        // ✅ Handle checkout.session.completed events
        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            if (dataObjectDeserializer.getObject().isPresent()) {
                Session session = (Session) dataObjectDeserializer.getObject().get();
                try {
                    PaymentIntent pi = PaymentIntent.retrieve(session.getPaymentIntent());

                    // ✅ Retrieve the Charge object via latest_charge (no getCharges() in Stripe 24.x)
                    if (pi.getLatestCharge() != null) {
                        Charge charge = Charge.retrieve(pi.getLatestCharge());
                        Map<String, Object> cardInfo = new HashMap<>();

                        if (charge.getPaymentMethodDetails() != null &&
                                charge.getPaymentMethodDetails().getCard() != null) {

                            cardInfo.put("brand", charge.getPaymentMethodDetails().getCard().getBrand());
                            cardInfo.put("last4", charge.getPaymentMethodDetails().getCard().getLast4());
                        } else {
                            cardInfo.put("brand", "unknown");
                            cardInfo.put("last4", "0000");
                        }

                        System.out.println("💳 Webhook received! Card info: " + cardInfo);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        return ResponseEntity.ok("✅ Webhook received");
    }
}
