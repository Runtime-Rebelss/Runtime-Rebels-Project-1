package com.runtimerebels.store.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    private String userId;
    private String userEmail;
    private List<String> productIds;
    private List<Integer> quantity;
    private List<BigDecimal> totalPrice;
    private OrderStatus orderStatus;
    private Date createdAt;
    private Date processAt;

    // Payment + Stripe info
    private String paymentStatus;     // "paid", "pending", etc.
    private String stripeSessionId;   // unique ID from Stripe
}

