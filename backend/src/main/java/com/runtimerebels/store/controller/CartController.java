package com.runtimerebels.store.controller;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.Cart;

//import com.runtimerebels.store.service.CartService;

import com.runtimerebels.store.dao.CartRepository;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    CartRepository cartRepository;

    @GetMapping
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElse(new Cart(userId, new ArrayList<>(), new ArrayList<>(), new ArrayList<>()));

        int minLength = Math.min(
                Math.min(cart.getProductIds().size(), cart.getQuantity().size()),
                cart.getTotalPrice().size());

        if (minLength < cart.getProductIds().size()) {
            cart.setProductIds(new ArrayList<>(cart.getProductIds().subList(0, minLength)));
            cart.setQuantity(new ArrayList<>(cart.getQuantity().subList(0, minLength)));
            cart.setTotalPrice(new ArrayList<>(cart.getTotalPrice().subList(0, minLength)));
        }

        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestParam String userId,
                                          @RequestParam String productId,
                                          @RequestParam(defaultValue = "1") int quantity,
                                          @RequestParam BigDecimal totalPrice) {

        // Check input
        if (quantity <= 0 || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElse(new Cart(userId, new ArrayList<>(), new ArrayList<>(), new ArrayList<>()));

        // Find existing product
        int productIdIndex = cart.getProductIds().indexOf(productId);

        if (productIdIndex >= 0) {
            // Update existing items
            cart.getQuantity().set(productIdIndex, cart.getQuantity().get(productIdIndex) + quantity);
            cart.getTotalPrice().set(productIdIndex, totalPrice);
        } else {
            // Add new item
            cart.getProductIds().add(productId);
            cart.getQuantity().add(quantity);
            cart.getTotalPrice().add(totalPrice);
        }

        int minLength = Math.min(Math.min(cart.getProductIds().size(), cart.getQuantity().size()), cart.getTotalPrice().size());

        cart.setProductIds(new ArrayList<>(cart.getProductIds().subList(0, minLength)));
        cart.setQuantity(new ArrayList<>(cart.getQuantity().subList(0, minLength)));
        cart.setTotalPrice(new ArrayList<>(cart.getTotalPrice().subList(0, minLength)));

        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update")
    public ResponseEntity<Cart> updateCart(@RequestParam String userId, @RequestParam String productId, @RequestParam int quantity) {

        Optional<Cart> cartOptional = cartRepository.findByUserId(userId);
        if (cartOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Cart cart = cartOptional.get();
        List<String> products = cart.getProductIds();
        List<Integer> quantities = cart.getQuantity();
        List<BigDecimal> totalPrices = cart.getTotalPrice();

        int index = products.indexOf(productId);
        if (index < 0) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (quantity < 0) {
            return new  ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (quantity == 0) {
            // Remove all arrays
            products.remove(index);
            quantities.remove(index);
            totalPrices.remove(index);
        } else {
            // Update quantity only
            quantities.set(index, quantity);
        }

        cart.setProductIds(products);
        cart.setQuantity(quantities);
        cart.setTotalPrice(totalPrices);

        cartRepository.save(cart);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Cart> removeItem(@RequestParam String userId, @RequestParam String productId) {
        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
        if (optionalCart.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Cart cart = optionalCart.get();
        List<String> products = cart.getProductIds();
        List<Integer> quantities = cart.getQuantity();
        List<BigDecimal> finalPrices = cart.getTotalPrice();

        int index = products.indexOf(productId);
        if (index < 0) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // Remove from arrays
        products.remove(index);
        quantities.remove(index);
        finalPrices.remove(index);

        cart.setProductIds(products);
        cart.setQuantity(quantities);
        cart.setTotalPrice(finalPrices);

        cartRepository.save(cart);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

}
