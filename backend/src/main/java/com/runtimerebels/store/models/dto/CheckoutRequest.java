package com.runtimerebels.store.models.dto;

import java.util.List;

public record CheckoutRequest(
        List<Item> items,
        String shippingMethod,    // std vs exp
        String customerEmail,
        boolean savePaymentMethod // if true we’ll create/attach a Stripe Customer
) {
    public record Item(String name, long unitAmount, String currency, long quantity) {}
}
