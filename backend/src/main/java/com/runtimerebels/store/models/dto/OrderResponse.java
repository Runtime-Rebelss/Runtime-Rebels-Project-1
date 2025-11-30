package com.runtimerebels.store.models.dto;

import com.runtimerebels.store.models.Order;
import com.runtimerebels.store.models.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private Order order;
    private List<Product> products;
}
