package com.portfolio.management.service.impl;

import com.portfolio.management.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.text.DecimalFormat;
import java.text.NumberFormat;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);
    private static final NumberFormat currencyFormatter = new DecimalFormat("$#,##0.00");
    private static final NumberFormat percentFormatter = new DecimalFormat("+#,##0.00%;-#,##0.00%");
    
    @Value("${mail.username}")
    private String fromEmail;
    
    @Autowired
    private JavaMailSender emailSender;

    @Override
    public boolean sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
            
            logger.info("Simple email sent to: {}", to);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send simple email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            emailSender.send(message);
            
            logger.info("HTML email sent to: {}", to);
            return true;
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean sendWelcomeEmail(String to, String username) {
        String subject = "Welcome to Portfolio Management System";
        
        String htmlContent = 
            "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px;'>" +
            "    <h2 style='color: #0066cc;'>Welcome to Portfolio Management System!</h2>" +
            "    <p>Hello <strong>" + username + "</strong>,</p>" +
            "    <p>Thank you for joining our Portfolio Management System. We're excited to have you on board!</p>" +
            "    <p>With our platform, you can:</p>" +
            "    <ul>" +
            "        <li>Create and manage multiple investment portfolios</li>" +
            "        <li>Track stocks, bonds, and mutual funds</li>" +
            "        <li>Access real-time market data</li>" +
            "        <li>Analyze your investment performance</li>" +
            "    </ul>" +
            "    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>" +
            "    <p>Happy investing!</p>" +
            "    <p>The Portfolio Management Team</p>" +
            "</div>";
        
        return sendHtmlEmail(to, subject, htmlContent);
    }

    @Override
    public boolean sendPortfolioSummaryEmail(String to, String username, String portfolioName, double totalValue, double dailyChange) {
        String subject = "Portfolio Summary: " + portfolioName;
        
        String valueFormatted = currencyFormatter.format(totalValue);
        String changeFormatted = percentFormatter.format(dailyChange / 100.0);
        String changeClass = dailyChange >= 0 ? "positive" : "negative";
        String changeColor = dailyChange >= 0 ? "#00aa00" : "#dd0000";
        
        String htmlContent = 
            "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px;'>" +
            "    <h2 style='color: #0066cc;'>Portfolio Summary</h2>" +
            "    <p>Hello <strong>" + username + "</strong>,</p>" +
            "    <p>Here's a summary of your portfolio <strong>" + portfolioName + "</strong>:</p>" +
            "    <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px;'>" +
            "        <p><strong>Total Value:</strong> <span style='font-size: 18px;'>" + valueFormatted + "</span></p>" +
            "        <p><strong>Daily Change:</strong> <span class='" + changeClass + "' style='color: " + changeColor + "; font-size: 18px;'>" + changeFormatted + "</span></p>" +
            "    </div>" +
            "    <p style='margin-top: 20px;'>Log in to your account to view more detailed information and performance metrics.</p>" +
            "    <p>Happy investing!</p>" +
            "    <p>The Portfolio Management Team</p>" +
            "</div>";
        
        return sendHtmlEmail(to, subject, htmlContent);
    }
}