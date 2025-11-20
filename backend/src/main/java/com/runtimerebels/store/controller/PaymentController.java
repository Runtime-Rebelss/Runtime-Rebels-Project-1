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

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    @Value("${frontend.successUrl}")
    private String successUrl;

    @Value("${frontend.cancelUrl}")
    private String cancelUrl;

    public PaymentController(CartRepository cartRepository, OrderRepository orderRepository) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckout(@RequestBody CheckoutRequest req) throws Exception {
        // Line items
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

        // Shipping: std & exp (fixed amounts for now, can change to dynamic price change later based on item)
        SessionCreateParams.ShippingOption standard =
                SessionCreateParams.ShippingOption.builder()
                        .setShippingRateData(
                                SessionCreateParams.ShippingOption.ShippingRateData.builder()
                                        .setDisplayName("Standard (5–7 days)")
                                        .setType(SessionCreateParams.ShippingOption.ShippingRateData.Type.FIXED_AMOUNT)
                                        .setFixedAmount(
                                                SessionCreateParams.ShippingOption.ShippingRateData.FixedAmount.builder()
                                                        .setAmount(799L)   // $7.99
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
                                                        .setAmount(1499L)  // $14.99
                                                        .setCurrency("usd")
                                                        .build()
                                        )
                                        .build()
                        ).build();

        var paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addAllLineItem(lineItems)
                .setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.REQUIRED)
                .setShippingAddressCollection(
                        SessionCreateParams.ShippingAddressCollection.builder()
                                .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.US)
                                .build()
                )
                .addShippingOption(standard)
                .addShippingOption(expedited)
                .setSubmitType(SessionCreateParams.SubmitType.PAY);

        if (req.customerEmail() != null && !req.customerEmail().isBlank()) {
            paramsBuilder.setCustomerEmail(req.customerEmail());
            // ask Stripe to create/keep customer to save payment methods
            if (req.savePaymentMethod()) {
                paramsBuilder.setCustomerCreation(SessionCreateParams.CustomerCreation.ALWAYS);
            }
        }

        Session session = Session.create(paramsBuilder.build());
        // return URL to redirect  browser
        return ResponseEntity.ok().body(new CreateCheckoutResponse(session.getUrl()));
    }

    private record CreateCheckoutResponse(String url) {}
}