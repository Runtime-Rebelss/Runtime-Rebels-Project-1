package com.runtimerebels.store.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
/**
 * Represents a customer's order in the e-commerce app.
 * Stores user info, ordered product IDs, quantities, total price,
 * delivery details, and payment status for persistence in MongoDB.
 *
 * @author Haley Kenney
 *
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
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

    private String deliveryName;
    private String deliveryContact;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;

    // Payment + Stripe info
    private String paymentStatus;     // "paid", "pending", etc.
    private String stripeSessionId;   // unique ID from Stripe
}
