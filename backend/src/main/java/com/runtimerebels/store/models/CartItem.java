package com.runtimerebels.store.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Document
public class CartItem {
    @Id
    private String productId;
    private Product product;
    private Integer quantity;
    private BigDecimal finalPrice;
}
