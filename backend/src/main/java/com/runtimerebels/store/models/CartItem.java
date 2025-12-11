package com.runtimerebels.store.models;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItem {

    /**
     * Embedded product snapshot for the item
     */
    private Product product;
    private Integer quantity;

    public BigDecimal getItemTotal() {
        if (product == null || product.getPrice() == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        try {
            return product.getPrice().multiply(new BigDecimal(quantity));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}