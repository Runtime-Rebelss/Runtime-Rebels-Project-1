package com.runtimerebels.store.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // 1. CRITICAL: Explicitly allow the POST method for login first
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/signup").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/email").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/updateName").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/updatePassword").permitAll()
                        .requestMatchers(HttpMethod.GET, "api/auth/userEmail").permitAll()
                        .requestMatchers("/api/payments/**").permitAll()
                        .requestMatchers("/api/email/**").permitAll()
                        // 2. All other public/whitelisted paths (General GETs, Swagger, etc.)
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/api/auth/refreshToken",
                                "/api/products/**",
                                "/api/carts/**",
                                "/api/orders/**",
                                "/api/stripe/**",
                                "/api/carts/update",
                                "/api/products/category",
                                "/api/auth/**",
                                "/api/auth/email",
                                "/api/address/**",
                                "/api/address/",
                                "/api/address/delete",
                                "/api/address/update",
                                "/api/email/**",
                                "/api/payments/**"

                        ).permitAll()
                        // 3. Keep this essential rule for CORS pre-flight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // 4. Secure all other requests (they must have a valid token/principal)
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        // CRITICAL: Ensure this exactly matches your frontend URL
        c.setAllowedOrigins(List.of("https://runtime-rebelss.github.io/Runtime-Rebels-Project-1/"));
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true); // This tells the browser it's okay

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }
}