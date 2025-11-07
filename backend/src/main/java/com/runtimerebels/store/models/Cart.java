package com.runtimerebels.store.models;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
@Document(collection = "carts")
public class Cart {

    @Id
    private String id;

    private String userId;
    private List<String> productIds;
    private List<Integer> quantity;
    private List<BigDecimal> totalPrice;

    public Cart(String userId, List<String> productIds, List<Integer> quantity, List<BigDecimal> totalPrice) {
        this.userId = userId;
        this.productIds = productIds != null ? new ArrayList<>(productIds) : new ArrayList<>();
        this.quantity = quantity != null ? new ArrayList<>(quantity) : new ArrayList<>();
        this.totalPrice = totalPrice != null ? new ArrayList<>(totalPrice) : new ArrayList<>();
    }
}
