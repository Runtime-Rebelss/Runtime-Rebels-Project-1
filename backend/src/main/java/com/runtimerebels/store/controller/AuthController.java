package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.UserRepository;
import com.runtimerebels.store.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/user")
    public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User no found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/user")
    public ResponseEntity<?> updateUser(@RequestParam String email, @RequestParam User userUp) {
        Map<String, String> response = new HashMap<>();
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            response.put("error", "User no found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User existingUser = user.get();
        existingUser.setEmail(userUp.getUsername());
        userRepository.save(existingUser);
        return ResponseEntity.ok(existingUser);
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        Map<String, String> response = new HashMap<>();
        if (userRepository.existsByEmail(user.getEmail())) {
            response.put("error", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        response.put("Status", "Account Created!");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    // Add thing for login here!!
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody User user) {
        Map<String, String> response = new HashMap<>();
        Optional<User> userOptional = userRepository.findByEmail(user.getEmail());
        if (userOptional.isPresent() && passwordEncoder.matches(user.getPassword(), userOptional.get().getPassword())) {
            response.put("message", "Login Successful");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Wrong Credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
