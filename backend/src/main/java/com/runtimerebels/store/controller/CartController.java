package com.runtimerebels.store.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.Cart;

import com.runtimerebels.store.service.CartService;

import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.dao.CartItemRepository;
import com.runtimerebels.store.dao.ProductRepository;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartService cartService;

    // Get all carts
    @GetMapping
    public List<Cart> getAllCart() { return cartRepository.findAll(); }

    // Get cart by unique ID
    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCartById(@PathVariable String cartId) {
        return cartRepository.findById(cartId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create "Add to Cart" API endpoint (POST/cart)
    @PostMapping("/add/{productId}")
    public Cart addToCart(@PathVariable String productId, @RequestParam Integer quantity) {
        return cartService.addItemToCart(productId, quantity);
    }
}
