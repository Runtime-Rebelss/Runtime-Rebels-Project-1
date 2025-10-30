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

@Data // <- Combines the getters and setters into one annotation
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    private String userId;
    private List<String> productIds;
    private List<Integer> quantity;
    private BigDecimal totalPrice;
    private Date createdAt;

    private String deliveryName;
    private String deliveryContact;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;



}
