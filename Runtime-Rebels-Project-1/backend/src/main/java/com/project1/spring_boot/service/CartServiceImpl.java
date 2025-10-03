package com.project1.spring_boot.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project1.spring_boot.models.Cart;
import com.project1.spring_boot.models.CartProduct;
import com.project1.spring_boot.repository.CartProductRepository;
@Service
public class CartServiceImpl {

    @Autowired
    private CartProductRepository repo;

    public Cart addItemToCart(String userId, CartProduct newItem) {
        // Check if there is an already existing cart for a user
        Optional<Cart> existingCart = repo.findByUserId(userId);
        Cart cart;

        // Check if the existing cart is present
        if (existingCart.isPresent()) {
            cart = existingCart.get();
            Optional<CartProduct> existingItem = cart.getCartProducts().stream()
                .filter(item -> item.getCartProductId().equals(newItem.getCartProductId()))
                .findFirst();

            if (existingItem.isPresent()) {
                // if item does exist -> update quantity in cart
                //existingItem.get().set
                System.out.println("Placeholder");
            } else {
                cart.getCartProducts().add(newItem);
            }
        // else if not an existing cart, create new one
        } else {
            cart = new Cart();
            cart.setUserId(userId);
            cart.getCartProducts().add(newItem);
        }
        return repo.save(cart);
    }

}
