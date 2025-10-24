package com.runtimerebels.store.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.runtimerebels.store.models.Product;
import com.runtimerebels.store.dao.CartItemRepository;
import com.runtimerebels.store.dao.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.runtimerebels.store.models.Cart;
import com.runtimerebels.store.models.CartItem;
import com.runtimerebels.store.dao.CartRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Service
public class CartServiceImpl implements CartService {
//
//    @Autowired
//    private CartRepository cartRepository;
//    @Autowired
//    private ProductRepository productRepository;
//    @Autowired
//    private CartItemRepository cartItemRepository;
//
////    @GetMapping("/{id}")
////    public ResponseEntity<Cart> getCartById(@PathVariable String id) {
////        return cartRepository.findById(id)
////                .map(ResponseEntity::ok)
////                .orElse(ResponseEntity.notFound().build());
////    }
//    public Cart createCart(@RequestBody Cart cartId) {
//        return cartRepository.save(cartId);
//    }
//
//    public Cart addItemToCart(String cartId, String productId, Integer quantity) {
//        // Create a new cart if one doesn't exist yet
//        Cart cart = cartRepository.findById(cartId).orElse(new Cart());
//        Product product = productRepository.findById(productId).orElse(null);
//
//        Optional<CartItem> existingItem = cart.getCartItems().stream()
//                .filter(item -> item.getProductId().equals(productId))
//                .findFirst();
//
//        if (existingItem.isPresent()) {
//            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
//        } else {
//            CartItem newItem = new CartItem();
//            assert product != null;
//            newItem.setProductId(product.getId());
//            newItem.setProduct(product);
//            newItem.setQuantity(quantity);
//            cart.getCartItems().add(newItem);
//        }
//        updateTotalPrice(cart);
//        return cartRepository.save(cart);
//    }
//
//    private void updateTotalPrice(Cart cart) {
//        double total = cart.getCartItems().stream()
//                .mapToDouble(item -> item.getPrice() * item.getQuantity())
//                .sum();
//        cart.setTotalPrice(total);
//    }
    // Move the quantity code to another method
    // public Cart addItemToCart(@PathVariable String productId, @RequestParam Integer quantity) {
    //     // Need to change to userId
    //     Cart cart = this.cartRepository.findById(productId).orElse(null);
    //     Product product = productRepository.findById(productId).orElse(null);
    //     LocalDateTime createdAt = LocalDateTime.now();
    //     // Need to check if a product has the same id, update the quantity of product
    //     // If cart existence doesn't exist, create one
    //     if (cart == null) {
    //         // Update quantity
    //         List<CartItem> cartItems = new ArrayList<>();
    //         // Create new cart item
    //         CartItem savedCartItem = this.cartItemRepository.save(
    //                 CartItem.builder()
    //                         .product(product)
    //                         .quantity(quantity)
    //                         .build()
    //         );
    //         cartItems.add(savedCartItem);
    //         // Creates new cart item and add to new cart
    //         // Save the new cart into database
    //         Cart savedCart = this.cartRepository.save(Cart.builder().cartItems(cartItems).build());
    //         return Cart.builder()
    //                 .cartId(savedCart.getCartId())
    //                 .createdAt(createdAt)
    //                 .cartItems(savedCart.getCartItems())
    //                 .build();
    //     } else {
    //         // Check if product already exists in one of the cart items
    //         if (cart.getCartItems() != null) {
    //             for (CartItem cartItem : cart.getCartItems()) {
    //                 assert product != null;
    //                 if (Objects.equals(cartItem.getProduct().getId(), product.getId())) {
    //                     // If product exists add 1 to the quantity of the product (Not working atm)
    //                     cartItem.setQuantity(cartItem.getQuantity() + quantity);
    //                     this.cartRepository.save(cart);
    //                     return Cart.builder()
    //                             .cartId(cart.getCartId())
    //                             .userId(cart.getUserId())
    //                             .createdAt(createdAt)
    //                             .cartItems(cart.getCartItems())
    //                             .build();
    //                 }
    //             }
    //         }
    //         // If product doesn't exist
    //         // Create a new cart item with product and quantity as 1
    //         CartItem savedCartItem = this.cartItemRepository.save(
    //                 CartItem.builder()
    //                         .product(product)
    //                         .quantity(quantity)
    //                         .build()
    //         );
    //         // Add the Cart item in the Cart
    //         if (cart.getCartItems() != null) {
    //             cart.getCartItems().add(savedCartItem);
    //         } else {
    //             List<CartItem> cartItems = new ArrayList<>();
    //             cartItems.add(savedCartItem);
    //             cart.setCartItems(cartItems);
    //         }
    //         // Returns the cart items
    //         this.cartRepository.save(cart);
    //         return Cart.builder()
    //                 .cartId(cart.getCartId())
    //                 .userId(cart.getUserId())
    //                 .createdAt(createdAt)
    //                 .cartItems(cart.getCartItems())
    //                 .build();
    //     }
    // }
}
