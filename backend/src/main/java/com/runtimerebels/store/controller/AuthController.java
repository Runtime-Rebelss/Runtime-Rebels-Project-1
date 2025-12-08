package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.UserRepository;
import com.runtimerebels.store.models.User;
import com.runtimerebels.store.models.dto.AuthenticateRequest;
import com.runtimerebels.store.models.dto.AuthenticationResponse;
import com.runtimerebels.store.services.AuthService;
import com.runtimerebels.store.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.dto.RegisterRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;


/**
 * REST controller responsible for authentication-related endpoints.
 *
 * <p>
 *     This controller wills serve as the entry point for user authentication
 *     operations such as login, registration, and token validation under the
 *     base path <code>/api/auth</code>.
 * </p>
 *
 * @author Henry Locke, Alexander Nima
 * @since 11-19-2025
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.created(URI.create("")).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticateRequest request, HttpServletResponse response) {
        // Used to implement the request
        AuthenticationResponse auth = authService.authenticate(request);

        // Set the cookie to the Token
        Cookie accessTokenCookie = new Cookie("access_token", auth.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(false);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(400 * 400 * 200);

        // Do the same for the refresh Token!!
        Cookie accessRefreshTokenCookie = new Cookie("access_refresh_token", auth.getRefreshToken());
        accessRefreshTokenCookie.setHttpOnly(true);
        accessRefreshTokenCookie.setSecure(false);
        accessRefreshTokenCookie.setPath("/");
        accessRefreshTokenCookie.setMaxAge(7 *  24 * 60 * 60); // <- This is seven days
        // Add the tokens to the cookies
        response.addCookie(accessTokenCookie);
        response.addCookie(accessRefreshTokenCookie);

        return ResponseEntity.ok(auth);
    }

    @PostMapping("/refreshToken")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response)
    {
        String refreshToken = null;
        // Get token from cookies
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("access_refresh_token")) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.status(401).body("Refresh token missing");
        }
        // Make new refreshToken
        AuthenticationResponse tokens = authService.refreshWithToken(refreshToken);

        Cookie newAccess = new Cookie("access_token", tokens.getAccessToken());
        newAccess.setHttpOnly(true);
        newAccess.setSecure(true);
        newAccess.setPath("/");
        newAccess.setMaxAge(7 * 200 * 200);

        response.addCookie(newAccess);

        return ResponseEntity.ok(tokens);
    }

    @PutMapping("/updateName")
    public ResponseEntity<?> updateName(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String fullName = body.get("fullName");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        String[] parts = fullName.trim().split(" ", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setFullName(fullName);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Name updated",
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "fullName", user.getFullName()
        ));
    }

    // Update user email
    @PutMapping("/email")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, String> updates) {

        String oldEmail = updates.get("oldEmail");
        String newEmail = updates.get("newEmail");

        Optional<User> existingUser = userRepository.findByEmail(oldEmail);

        if (existingUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = existingUser.get();

        user.setEmail(newEmail);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "message", "User updated successfully"
        ));
    }

    @PutMapping("/updatePassword")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        String confirmPassword = body.get("confirmPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Old password incorrect"));
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.status(400).body(Map.of("message", "Passwords do not match"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Password updated successfully"
        ));
    }

    @GetMapping("/{userEmail}")
    public ResponseEntity<User> getUserEmail(@PathVariable String userEmail) {
        return userRepository.findByEmail(userEmail)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
