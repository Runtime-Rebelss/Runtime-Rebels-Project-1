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
import com.project1.spring_boot.models.CartRepository;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class CartController {

    @RequestMapping(value = "/")
    public void redirect(HttpServletResponse response) throws IOException {
        response.sendRedirect("/swagger-ui.html");
    }

    @Autowired
    CartRepository repo;

    @GetMapping("/carts")
    public List<Cart> getAllCarts() {
        return repo.findAll();
    }

    @PostMapping("/cart")
    public Cart addPost(@RequestBody Cart cart) {
        return repo.save(cart);
    }

}
//34:40


