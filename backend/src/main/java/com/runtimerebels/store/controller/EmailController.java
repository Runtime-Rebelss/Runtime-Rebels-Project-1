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

    @PostMapping("/confirmation")
    public String sendOrderConfirmationEmail(
        @RequestParam(name="name") String name,
        @RequestParam(name="to") String to,
        @RequestParam(name="orderNumber") String orderNumber,
        @RequestParam(name="confirmationNumber") String confirmationNumber
    ) {
        emailService.sendOrderConfirmationEmail(to, name, orderNumber, confirmationNumber);
        return "Order confirmation email sent to " + to;
    }
}