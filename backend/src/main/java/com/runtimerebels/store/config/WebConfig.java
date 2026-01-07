package com.runtimerebels.store.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

/**
 * WebConfig - Configuration class for CORS settings.
 * Allows cross-origin requests from the frontend application.
 * @author Frank Gonzalez
 * @since 11-19-2025
 */
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            /**
             * Configure CORS mappings to allow requests from the frontend.
             * @param registry the CorsRegistry to configure
             */
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // NOTE: CORS "origins" must NOT include a path (only scheme + host + optional port).
                        // GitHub Pages for a project site runs at origin https://runtime-rebelss.github.io
                        .allowedOriginPatterns(
                                "http://localhost:*",
                                "https://runtime-rebelss.github.io"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .exposedHeaders("*");
            }
        };
    }
}
