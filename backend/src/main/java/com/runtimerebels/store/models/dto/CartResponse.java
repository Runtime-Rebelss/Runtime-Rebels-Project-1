package com.runtimerebels.store.models.dto;

import com.runtimerebels.store.models.CartItem;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartResponse {
    private String id;
    private UserResponse user;
    private List<CartItem> cartItems;
}