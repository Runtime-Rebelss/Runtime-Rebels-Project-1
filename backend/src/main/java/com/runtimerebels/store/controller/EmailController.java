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

    // Example endpoint to send a test email
    // POST /api/email/send
    @PostMapping("/welcome")
    public String sendWelcomeEmail(
        @RequestParam(name="name") String name,
        @RequestParam(name="to") String to
    ) {
        emailService.sendWelcomeEmail(to, name);
        return "Welcome email sent to " + to;
        
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