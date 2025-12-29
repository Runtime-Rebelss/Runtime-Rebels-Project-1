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

/**
 * cart controller
 *  * @author Henry Locke
 *
 */
@RestController
@RequestMapping("/api/carts")
public class CartController2 {

    @Autowired
    CartRepository cartRepository;

    @Autowired
    ProductRepository productRepository;
    // Gets all carts
    @GetMapping
    public List<Cart> getAllCarts() { return cartRepository.findAll(); }

    // Gets cart by userId


}