package com.runtimerebels.store.controller;

import com.runtimerebels.store.models.dto.AuthenticateRequest;
import com.runtimerebels.store.models.dto.AuthenticationResponse;
import com.runtimerebels.store.services.AuthService;
import com.runtimerebels.store.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.net.URI;

import org.springframework.web.bind.annotation.*;

import com.runtimerebels.store.models.dto.RegisterRequest;


/**
 * REST controller responsible for authentication-related endpoints.
 *
 * <p>
 *     This controller wills erve as the entry point for user authentication
 *     opperations such as login, registration, and token validiation under the
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

    @PostMapping("/signup")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.created(URI.create("")).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticateRequest request) {

        return ResponseEntity.accepted().body(authService.authenticate(request));
    }

    @PostMapping("/refreshToken")
    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response

    ) throws IOException {
        authService.refreshToken(request, response);
    }
}
