package com.runtimerebels.store.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.CartItem;
import com.runtimerebels.store.models.Product;
import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.models.User;

/**
 * cart controller
 *  * @author Henry Locke
 *
 */
@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    CartRepository cartRepository;

    @Autowired
    ProductRepository productRepository;

    /**
     * get all carts
     *
     * @return {@link List}
     * @see List
     * @see Cart
     */
    @GetMapping
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    /**
     * get cart
     *
     * @param userId userId
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see Cart
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(new Cart(userId, new ArrayList<>()));

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    /**
     * add to cart
     *
     * @param userId userId
     * @param productId productId
     * @param quantity quantity
     * @param totalPrice totalPrice
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see Cart
     */
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestParam String userId, @RequestParam String productId, @RequestParam(defaultValue = "1") int quantity, @RequestParam(required = false) BigDecimal totalPrice) {
        if (quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Product> maybeProduct = productRepository.findById(productId);
        if (maybeProduct.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Product product = maybeProduct.get();

        Cart cart = cartRepository.findByUserId(userId)
                .orElse(new Cart(userId, new ArrayList<>()));

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        List<CartItem> items = cart.getItems();

        int index = -1;
        for (int i = 0; i < items.size(); i++) {
            CartItem it = items.get(i);
            if (it != null && it.getProduct() != null && productId.equals(it.getProduct().getId())) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            CartItem existing = items.get(index);
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            items.add(new CartItem(product, quantity));
        }

        cart.setItems(items);
        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    /**
     * update cart
     *
     * @param userId userId
     * @param productId productId
     * @param quantity quantity
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see Cart
     */
    @PutMapping("/update")
    public ResponseEntity<Cart> updateCart(@RequestParam String userId, @RequestParam String productId, @RequestParam int quantity) {
        Optional<Cart> cartOptional = cartRepository.findByUserId(userId);
        if (cartOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Cart cart = cartOptional.get();
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        List<CartItem> items = cart.getItems();
        int index = -1;
        for (int i = 0; i < items.size(); i++) {
            CartItem it = items.get(i);
            if (it != null && it.getProduct() != null && productId.equals(it.getProduct().getId())) {
                index = i;
                break;
            }
        }

        if (index < 0) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (quantity < 0) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (quantity == 0) {
            items.remove(index);
        } else {
            items.get(index).setQuantity(quantity);
        }

        cart.setItems(items);
        cartRepository.save(cart);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    /**
     * remove item
     *
     * @param userId userId
     * @param productId productId
     * @return {@link ResponseEntity}
     * @see ResponseEntity
     * @see Cart
     */
    @DeleteMapping("/remove")
    public ResponseEntity<Cart> removeItem(@RequestParam String userId, @RequestParam String productId) {
        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
        if (optionalCart.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Cart cart = optionalCart.get();
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        List<CartItem> items = cart.getItems();
        int index = -1;
        for (int i = 0; i < items.size(); i++) {
            CartItem it = items.get(i);
            if (it != null && it.getProduct() != null && productId.equals(it.getProduct().getId())) {
                index = i;
                break;
            }
        }

        if (index < 0) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        items.remove(index);
        cart.setItems(items);
        cartRepository.save(cart);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

}
