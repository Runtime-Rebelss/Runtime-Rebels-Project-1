package com.runtimerebels.store.services;

import com.runtimerebels.store.models.dto.PaymentRequest;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    public PaymentIntent createPaymentIntent(PaymentRequest paymentRequest) throws Exception {
        // Implementation for creating a PaymentIntent with Stripe
        PaymentIntentCreateParams.Builder builder =
                PaymentIntentCreateParams.builder()
                        .setAmount(paymentRequest.getAmount())
                        .setCurrency(paymentRequest.getCurrency())
                        .setDescription(paymentRequest.getDescription())
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods
                                        .builder()
                                        .setEnabled(true)
                                        .build()
                        );

        // If shipping info provided, add it to the PaymentIntent
        try {
            if (paymentRequest.getShippingName() != null || paymentRequest.getShippingAddressLine1() != null) {
                PaymentIntentCreateParams.Shipping.Address address =
                        PaymentIntentCreateParams.Shipping.Address.builder()
                                .setLine1(paymentRequest.getShippingAddressLine1())
                                .setLine2(paymentRequest.getShippingAddressLine2())
                                .setCity(paymentRequest.getShippingCity())
                                .setState(paymentRequest.getShippingState())
                                .setPostalCode(paymentRequest.getShippingPostalCode())
                                .setCountry(paymentRequest.getShippingCountry() == null ? "US" : paymentRequest.getShippingCountry())
                                .build();

                PaymentIntentCreateParams.Shipping shipping =
                        PaymentIntentCreateParams.Shipping.builder()
                                .setName(paymentRequest.getShippingName())
                                .setPhone(paymentRequest.getShippingPhone())
                                .setAddress(address)
                                .build();

                builder.setShipping(shipping);
            }
        } catch (Exception e) {
            System.err.println("Failed to attach shipping to PaymentIntent: " + e.getMessage());
        }

        PaymentIntentCreateParams params = builder.build();
        return PaymentIntent.create(params);
    }
}
