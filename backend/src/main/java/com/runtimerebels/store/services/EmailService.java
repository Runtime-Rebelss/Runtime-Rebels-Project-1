package com.runtimerebels.store.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.mail.SimpleMailMessage;
import jakarta.mail.internet.MimeMessage;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



@Service
public class EmailService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("runtimerebelsproject@gmail.com");
        message.setTo(to); 
        message.setSubject(subject); 
        message.setText(text);
        mailSender.send(message);

        log.info("Email sent to {}", to);
    }

    public void sendWelcomeEmail(String to, String name) {
        Context context = new Context();
        context.setVariable("name", name);

        String processHtml = templateEngine.process("welcome-email", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        try {
            helper.setText(processHtml, true);
            helper.setTo(to);
            helper.setSubject("Welcome to Runtime Rebels Store!");
            helper.setFrom("runtimerebelsproject@gmail.com");
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}", to, e);
        }
    }

    public void sendOrderConfirmationEmail(String to, String name, String orderNumber, String confirmationNumber) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("orderNumber", orderNumber);
        context.setVariable("confirmationNumber", confirmationNumber);

        String processHtml = templateEngine.process("order-confirmation", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        try {
            helper.setText(processHtml, true);
            helper.setTo(to);
            helper.setSubject("Your Order Confirmation from Runtime Rebels Store");
            helper.setFrom("runtimerebelsproject@gmail.com");
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email to {}", to, e);
        }
    }
}