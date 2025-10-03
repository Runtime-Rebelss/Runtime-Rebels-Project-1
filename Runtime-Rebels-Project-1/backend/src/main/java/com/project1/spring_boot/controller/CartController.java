package com.project1.spring_boot.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project1.spring_boot.models.Cart;
import com.project1.spring_boot.models.CartProduct;
import com.project1.spring_boot.repository.CartProductRepository;
import com.project1.spring_boot.service.CartServiceImpl;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class CartController {

    @RequestMapping(value = "/add-to-cart")
    public void addToCart(HttpServletResponse session) throws IOException {
        session.sendRedirect("/swagger-ui.html");
    }

    @Autowired
    private CartProductRepository repo;

    @Autowired
    private CartServiceImpl cartService;

    @GetMapping("carts")
    public List<Cart> getAllCarts() {
        return repo.findAll();
    }

    // POST - Sends data to the server to create or update a resource

    // @PostMapping("cart")
    // public Cart addCart(@RequestBody Cart cart) {
    //     return repo.save(cart);
    // }

    // Create "Add to Cart" API endpoint (POST/cart)

    @PostMapping("/cart")
    public ResponseEntity<Cart> addItemToCart(@RequestParam String userId, @RequestBody CartProduct cartProduct) {
        Cart updatedCart = cartService.addItemToCart(userId, cartProduct);
        return new ResponseEntity<>(updatedCart, HttpStatus.OK);
    }

    // @GetMapping("/")
    // public ResponseEntity<Integer> count(HttpSession session) {
    //     Integer counter = (Integer) session.getAttribute("count");

    //     if (counter == null) {
    //         counter = 1;
    //     } else {
    //         counter++;
    //     }

    //     session.setAttribute("count", counter);

    //     return ResponseEntity.ok(counter);
    // }
}
