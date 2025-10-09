package com.runtimerebels.store.models;

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
@NoArgsConstructor
@Builder
// @Document() specifies the collection name
@Document(collection = "carts")
public class Cart {

    @Id
    private String cartId;
    private String userId;
    private LocalDateTime createdAt = LocalDateTime.now();
    private List<CartItem> cartItems;
}
