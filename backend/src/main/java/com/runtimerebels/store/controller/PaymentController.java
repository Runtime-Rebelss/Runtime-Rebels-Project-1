package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.AddressRepository;
import com.runtimerebels.store.models.Address;
import com.runtimerebels.store.models.dto.CheckoutRequest;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

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

    @Value("${frontend.successUrl}")
    private String successUrl;

    @Value("${frontend.cancelUrl}")
    private String cancelUrl;

    @Autowired
    private AddressRepository addressRepository;

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
                .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addAllLineItem(lineItems)

                // Add shipping choices
                .addShippingOption(standard)
                .addShippingOption(expedited)

                // Request contact info
                .setPhoneNumberCollection(
                        SessionCreateParams.PhoneNumberCollection.builder().setEnabled(true).build()
                )

                // Get customer email at checkout
                .setCustomerCreation(SessionCreateParams.CustomerCreation.ALWAYS)
                .setSubmitType(SessionCreateParams.SubmitType.PAY);

        // If there is an addressId
        boolean b = req.customerEmail() != null && !req.customerEmail().isBlank();
        if (req.addressId() != null && !req.addressId().isBlank()) {
            Address address = addressRepository.findById(req.addressId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Address"));

            CustomerCreateParams.Builder customerBuilder = CustomerCreateParams.builder();
            if (b) {
                customerBuilder.setEmail(req.customerEmail());
                // prefill email in checkout
                paramsBuilder.setCustomerEmail(req.customerEmail());
            }

            if (address.getName() != null) customerBuilder.setName(address.getName());
            if (address.getPhoneNumber() != null) customerBuilder.setPhone(address.getPhoneNumber());

            customerBuilder.setAddress(
                    CustomerCreateParams.Address.builder()
                            .setLine1(address.getAddress())
                            .setCity(address.getCity())
                            .setState(address.getState())
                            .setPostalCode(address.getZipCode())
                            .setCountry(address.getCountry())
                            .build()
            );

            customerBuilder.setShipping(
                    CustomerCreateParams.Shipping.builder()
                            .setName(address.getName())
                            .setPhone(address.getPhoneNumber())
                            .setAddress(
                                    CustomerCreateParams.Shipping.Address.builder()
                                            .setLine1(address.getAddress())
                                            .setCity(address.getCity())
                                            .setState(address.getState())
                                            .setPostalCode(address.getZipCode())
                                            .setCountry(address.getCountry())
                                            .build()
                            )
                            .build()
            );

            Customer customer = Customer.create(customerBuilder.build());
            paramsBuilder.setCustomer(customer.getId());

        } else {
            // No address provided
            paramsBuilder.setShippingAddressCollection(
                    SessionCreateParams.ShippingAddressCollection.builder()
                            .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.US)
                            .build()
            );

            // If email provided, prefill it
            if (b) {
                paramsBuilder.setCustomerEmail(req.customerEmail());
            }
        }

        // Create the session
        Session session = Session.create(paramsBuilder.build());

        System.out.println("Stripe Checkout session created for: " + req.customerEmail());

        return ResponseEntity.ok().body(new CreateCheckoutResponse(session.getUrl()));
    }
    /** Response record for returning the Stripe Checkout URL. */
    private record CreateCheckoutResponse(String url) {}
}
