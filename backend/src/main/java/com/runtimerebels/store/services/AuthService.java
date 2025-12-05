package com.runtimerebels.store.services;

import com.runtimerebels.store.models.Role;
import com.runtimerebels.store.models.Token;
import com.runtimerebels.store.models.TokenType;
import com.runtimerebels.store.models.User;
import com.runtimerebels.store.dao.TokenRepository;
import com.runtimerebels.store.dao.UserRepository;
import com.runtimerebels.store.models.dto.AuthenticateRequest;
import com.runtimerebels.store.models.dto.AuthenticationResponse;
import com.runtimerebels.store.models.dto.LoggedUserResponse;
import com.runtimerebels.store.models.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static com.runtimerebels.store.util.Util.getUserByToken;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    private void saveUserToken(User user, String jwtToken, TokenType type) {
        var token = Token
                .builder()
                .user(user)
                .token(jwtToken)
                .tokenType(type)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    public LoggedUserResponse fetchLoggedInUserByToken(HttpServletRequest request) {
        User user = getUserByToken(request, jwtService, this.userRepository);
        return LoggedUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .build();
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        System.out.println(user.getId());
        if (validUserTokens.isEmpty()) {
            return;
        }

        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });

        tokenRepository.saveAll(validUserTokens);
    }

    public AuthenticationResponse register(RegisterRequest request) {
        var userEmail = userRepository.findByEmail(request.getEmail());
        if (userEmail.isPresent()) {
            throw new RuntimeException("User email already exists");
        }

        var role = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        var adminRole = request.getRole() != null ? request.getRole() : Role.ADMIN;

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .mobileNumber(request.getMobileNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        var savedUser = userRepository.save(user);
        var jwtToken = jwtService.generateToken(savedUser);
        var refreshToken = jwtService.generateRefreshToken(savedUser);
        saveUserToken(savedUser, jwtToken, TokenType.ACCESS);
        saveUserToken(savedUser, refreshToken, TokenType.REFRESH);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                savedUser.getEmail(), savedUser.getPassword()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticateRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User email does not exist"));

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword()
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            revokeAllUserTokens(user);
            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            saveUserToken(user, jwtToken, TokenType.ACCESS);
            saveUserToken(user, refreshToken, TokenType.REFRESH);

            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .fullName(user.getFirstName() + " " + user.getLastName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
        }
        throw new RuntimeException("Incorrect password");
    }

    public AuthenticationResponse refreshWithToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token missing");
        }

        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail == null) {
            throw new RuntimeException("Invalid refresh token");
        }

        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Refresh token expired or invalid");
        }

        revokeAllUserTokens(user);

        String newRefreshToken = jwtService.generateToken(user);

        saveUserToken(user, newRefreshToken, TokenType.ACCESS);

        return AuthenticationResponse.builder()
                .accessToken(newRefreshToken)
                .refreshToken(refreshToken) // re-use same refresh token
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
