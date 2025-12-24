package com.runtimerebels.store.models.dto;

import java.util.List;
/**
 * Represents a checkout request sent from the frontend to the backend
 * when initiating a Stripe payment session.
 * Includes item details, shipping method, and customer information.
 *
 * @param items List of products being purchased
 * @param shippingMethod Selected shipping option (e.g., "standard" or "expedited")
 * @param customerEmail Email of the purchasing customer
 * @param savePaymentMethod Whether to save the payment method for future use
 *
 * @author Haley Kenney
 * @version 1.0
 */

public record CheckoutRequest(
        List<Item> items,
        String shippingMethod,// std vs exp
        String addressId,
        String customerEmail,
        boolean savePaymentMethod // if true we’ll create/attach a Stripe Customer
) {
    /**
     * Represents an individual item in the checkout request.
     *
     * @param name Product name
     * @param unitAmount Price per item (in smallest currency unit, e.g. cents)
     * @param currency ISO currency code (e.g. "USD")
     * @param quantity Quantity of the item being purchased
     */
    public record Item(String name, long unitAmount, String currency, long quantity) {}
}
