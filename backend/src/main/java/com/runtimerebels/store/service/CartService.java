package com.runtimerebels.store.service;

import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.CartItem;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface CartService {

//    public List<CartItem> getCartItems();
//    public CartItem getCartItemsById(int id);
    public Cart addItemToCart(String cartId, String productId, Integer quantity);
//    public CartItem deleteCartItem(int id);

}
