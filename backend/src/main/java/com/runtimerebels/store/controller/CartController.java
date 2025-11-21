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
import com.runtimerebels.store.dao.CartRepository;

/**
 * REST controller that exposes endpoints for managing shopping carts.
 *
 * <p>This controller allows clients to create, read, update, and delete
 * items within a user's cart using a {@link CartRepository}.</p>
 *
 * @author Henry Locke, Alexander Nima
 * @since 11-19-2025
 */

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    CartRepository cartRepository;

    /**
     * Retrives the cart for a specific user.
     *
     * <p> If a cart does not exist for the given user ID, a new empty cart
     * instance is created and returned (but not persisted).</p>
     *
     * <p> The method also ensures that the internal lists for product IDs,
     * quantities, and prices all have the same length.</p>
     *
     * @param userId the unique identifier of the user whose cart is requested
     * @return a {@link ResponseEntity} containing the user's {@link Cart}
     * and an HTTP 200 (OK) status
     *
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

    /**
     * Adds a product to a user's cart or updates the quantity and price
     * if a product is already present.
     *
     * <p> If no car exists for the given user ID, a new cart is created.
     * Input is validated so that quantity must be greater than zero and
     * totalPrice must be positive.</p>
     *
     * @param userId        the unique identifier of the user who owns the cart
     * @param productId     the unique identifier of the product to add or update
     * @param quantity      the quantity of the product to add (defaults to 1 if not provided)
     * @param totalPrice    the total price for this cart line item
     * @return a {@link ResponseEntity} containing the updated {@link Cart}
     *      and an HTTP 200 (OK) status if successful, or
     *      HTTP 400 (Bad Request) if the input is invalid
     */
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestParam String userId, @RequestParam String productId, @RequestParam(defaultValue = "1") int quantity, @RequestParam BigDecimal totalPrice) {
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

    /**
     *  Updates the quantity of a specific product in a user's cart.
     *
     *  <p> If the quantity is set to zero, the product is removed from the cart.
     *  A negative quantity is rejected as invalid.</p>
     *
     * @param userId        the unique identifier of the user who owns the cart
     * @param productId     the unique identifier of the product to update
     * @param quantity      the new quantity for the product (must be zero or positive)
     * @return a {@link ResponseEntity} containing the updated {@link Cart}
     *      and an HTTP 200 (OK) status if successful, HTTP 404 (Not Found)
     *      if the car does not exist, or HTTP 400 (Bad Request) if the
     *      product is not in the cart or the quantity is negative
     */

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
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
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

    /**
     *  Removes a specific product from a user's cart.
     *
     * @param userId        the unique identifier of the user who owns the cart
     * @param productId     the unique identifier of th eproduct to remove
     * @return a {@link ResponseEntity} containing the updated {@link Cart}
     *      and an HTTP 200 (OK) status if successful, HTTP 404 (Not Found)
     *      if the cart does not exist, or HTTP 400 (Bad Request) if the
     *      product is not present in the cart
     */

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
