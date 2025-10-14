package com.runtimerebels.store.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@Builder
// @Document() specifies the collection name
@Document(collection = "carts")
public class Cart {

    @Id
    private String id;

    private String userId;
    private List<String> productIds;
    private List<Integer> quantity;
    private List<BigDecimal> totalPrice;

    public Cart() {
        this.productIds = new ArrayList<>();
        this.quantity = new ArrayList<>();
    }

    public Cart(String userId, List<String> productIds, List<Integer> quantity, List<BigDecimal> totalPrice) {
        this.userId = userId;
        this.productIds = productIds != null ? new ArrayList<>(productIds) : new ArrayList<>();
        this.quantity = quantity != null ? new ArrayList<>(quantity) : new ArrayList<>();
        this.totalPrice = totalPrice != null ? new ArrayList<>(totalPrice) : new ArrayList<>();
    }

}
