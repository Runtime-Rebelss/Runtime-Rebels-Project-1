package com.runtimerebels.store.controller;

import com.runtimerebels.store.models.dto.AuthenticateRequest;
import com.runtimerebels.store.models.dto.AuthenticationResponse;
import com.runtimerebels.store.services.AuthService;
import com.runtimerebels.store.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.net.URI;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.dto.RegisterRequest;


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
//    // User info for account Page
//    @GetMapping("/user")
//    public ResponseEntity<?> getUserByEmail(HttpServletRequest request, HttpServletResponse response) {
//
//    }
}
