package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.UserRepository;
import com.runtimerebels.store.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.stripe.Stripe;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable String userId) {
        return userRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); // Creates new userId
    }
    // Updates user
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody User updatedUser) {
        return userRepository.findById(userId).map(existing -> {
            existing.setUsername(updatedUser.getUsername());
            existing.setEmail(updatedUser.getEmail());
            existing.setAdmin(updatedUser.isAdmin());
            userRepository.save(existing);
            return ResponseEntity.ok(existing);
            }).orElse(ResponseEntity.notFound().build());
    }
}
