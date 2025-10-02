package com.project1.spring_boot.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project1.spring_boot.models.Cart;
import com.project1.spring_boot.repository.CartProductRepository;

import jakarta.servlet.http.HttpServletResponse;


@RestController
public class CartController {

    @RequestMapping(value = "/add-to-cart")
    public void addToCart(HttpServletResponse session) throws IOException {
        session.sendRedirect("/swagger-ui.html");
    }

    @Autowired
    CartProductRepository repo;

    @GetMapping("cart")
    public List<Cart> getAllCarts() {
        return repo.findAll();
    }

    @PostMapping("carts")
    public Cart addCart(@RequestBody Cart cart) {
        return repo.save(cart);
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
