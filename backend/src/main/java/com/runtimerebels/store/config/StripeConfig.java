package com.runtimerebels.store.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
/**
 * Configuration class for initializing the Stripe API key.
 * Loads the Stripe secret key from the application's environment
 * or properties file and assigns it to {@link com.stripe.Stripe#apiKey}.
 *
 * This ensures that Stripe API calls made by the application
 * are authenticated using the correct secret key.
 *
 * @author Haley Kenney
 */

@Configuration
public class StripeConfig {
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    /**
     * Initializes the Stripe API key after Spring context startup.
     * Called automatically once the configuration has been loaded.
     */
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
}
