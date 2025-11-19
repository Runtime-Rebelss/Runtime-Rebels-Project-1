package com.runtimerebels.store.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String userEmail;
    private List<String> productIds;
    private List<Integer> quantities;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt = LocalDateTime.now();

    private String deliveryName;
    private String deliveryContact;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;

    // Payment + Stripe info
    private String paymentStatus;     // "paid", "pending", etc.
    private String stripeSessionId;   // unique ID from Stripe
}
