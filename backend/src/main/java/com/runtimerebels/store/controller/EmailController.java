package com.runtimerebels.store.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.beans.factory.annotation.Autowired;
import com.runtimerebels.store.services.EmailService;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    public static class WelcomeRequest {
        public String name;
        public String to;
    }

    // Example endpoint to send a test email
    // POST /api/email/send
    @PostMapping("/welcome")
    public String sendWelcomeEmail(
        @RequestBody WelcomeRequest req
    ) {
        emailService.sendWelcomeEmail(req.to, req.name);
        return "Welcome email sent to " + req.to;
        
    }

    // Accept JSON body from frontend instead of query params
    public static class ConfirmationRequest {
        public String name;
        public String to;
        public String orderNumber;
        public String confirmationNumber;
    }

    @PostMapping("/confirmation")
    public String sendOrderConfirmationEmail(@RequestBody ConfirmationRequest req) {
        emailService.sendOrderConfirmationEmail(req.to, req.name, req.orderNumber, req.confirmationNumber);
        return "Order confirmation email sent to " + req.to;
    }
}