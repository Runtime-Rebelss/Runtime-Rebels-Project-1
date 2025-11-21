package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.dao.OrderRepository;
import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.OrderStatus;
import com.runtimerebels.store.models.dto.CheckoutRequest;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.runtimerebels.store.models.Order;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for handling Stripe payment operations.
 * Creates Stripe Checkout Sessions based on frontend requests
 * and configures shipping, billing, and customer options.
 *
 * Base URL: /api/payments
 *
 * @see com.runtimerebels.store.models.dto.CheckoutRequest
 * @author Haley Kenney
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
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

        // Build Stripe line items
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
        for (var it : req.items()) {
            SessionCreateParams.LineItem.PriceData.ProductData product =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(it.name())
                            .build();

            SessionCreateParams.LineItem.PriceData priceData =
                    SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency(it.currency())
                            .setUnitAmount(it.unitAmount()) // in cents
                            .setProductData(product)
                            .build();

            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(it.quantity())
                            .setPriceData(priceData)
                            .build()
            );
        }

        // Shipping options
        SessionCreateParams.ShippingOption standard =
                SessionCreateParams.ShippingOption.builder()
                        .setShippingRateData(
                                SessionCreateParams.ShippingOption.ShippingRateData.builder()
                                        .setDisplayName("Standard (5–7 days)")
                                        .setType(SessionCreateParams.ShippingOption.ShippingRateData.Type.FIXED_AMOUNT)
                                        .setFixedAmount(
                                                SessionCreateParams.ShippingOption.ShippingRateData.FixedAmount.builder()
                                                        .setAmount(799L)
                                                        .setCurrency("usd")
                                                        .build()
                                        )
                                        .build()
                        ).build();

        SessionCreateParams.ShippingOption expedited =
                SessionCreateParams.ShippingOption.builder()
                        .setShippingRateData(
                                SessionCreateParams.ShippingOption.ShippingRateData.builder()
                                        .setDisplayName("Expedited (2–3 days)")
                                        .setType(SessionCreateParams.ShippingOption.ShippingRateData.Type.FIXED_AMOUNT)
                                        .setFixedAmount(
                                                SessionCreateParams.ShippingOption.ShippingRateData.FixedAmount.builder()
                                                        .setAmount(1499L)
                                                        .setCurrency("usd")
                                                        .build()
                                        )
                                        .build()
                        ).build();

        // Build the checkout session parameters
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addAllLineItem(lineItems)

                // Require billing address and contact info
                .setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.REQUIRED)

                // Require shipping address
                .setShippingAddressCollection(
                        SessionCreateParams.ShippingAddressCollection.builder()
                                .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.US)
                                .build()
                )

                // Add shipping choices
                .addShippingOption(standard)
                .addShippingOption(expedited)

                // Request contact info fields directly from Stripe
                .setPhoneNumberCollection(
                        SessionCreateParams.PhoneNumberCollection.builder().setEnabled(true).build()
                )

                // Ask Stripe to collect the customer's email at checkout
                .setCustomerCreation(SessionCreateParams.CustomerCreation.ALWAYS)
                .setSubmitType(SessionCreateParams.SubmitType.PAY);

        // include email if already known (logged-in users)
        if (req.customerEmail() != null && !req.customerEmail().isBlank()) {
            paramsBuilder.setCustomerEmail(req.customerEmail());
        }

        // Create the session
        Session session = Session.create(paramsBuilder.build());

        System.out.println("Stripe Checkout session created for: " + req.customerEmail());

        return ResponseEntity.ok().body(new CreateCheckoutResponse(session.getUrl()));
    }
    /** Response record for returning the Stripe Checkout URL. */
    private record CreateCheckoutResponse(String url) {}
}