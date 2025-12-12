package com.runtimerebels.store.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Global CORS configuration which reads allowed origins from the
 * FRONTEND_ALLOWED_ORIGINS environment variable (comma-separated).
 * Falls back to common localhost dev ports if not provided.
 */
@Configuration
public class CorsConfig {

    // Expect comma separated list, e.g. http://localhost:5173,http://example.com
    @Value("${FRONTEND_ALLOWED_ORIGINS:}")
    private String allowedOriginsEnv;

    @Bean
    public CorsFilter corsFilter() {
        List<String> origins;
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isBlank()) {
            origins = Arrays.stream(allowedOriginsEnv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        } else {
            origins = Arrays.asList("http://localhost:5173", "http://localhost:3000");
        }

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}

