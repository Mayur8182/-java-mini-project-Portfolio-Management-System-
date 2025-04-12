package com.portfolio.management.service;

/**
 * Service interface for sending emails
 */
public interface EmailService {
    
    /**
     * Send a simple text email
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param text Email body text
     * @return True if the email was sent successfully, false otherwise
     */
    boolean sendSimpleEmail(String to, String subject, String text);
    
    /**
     * Send an HTML email
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param htmlContent Email HTML content
     * @return True if the email was sent successfully, false otherwise
     */
    boolean sendHtmlEmail(String to, String subject, String htmlContent);
    
    /**
     * Send a welcome email to a new user
     * 
     * @param to User's email address
     * @param username User's username
     * @return True if the email was sent successfully, false otherwise
     */
    boolean sendWelcomeEmail(String to, String username);
    
    /**
     * Send a portfolio summary email
     * 
     * @param to User's email address
     * @param username User's username
     * @param portfolioName Portfolio name
     * @param totalValue Total portfolio value
     * @param dailyChange Daily change percentage
     * @return True if the email was sent successfully, false otherwise
     */
    boolean sendPortfolioSummaryEmail(String to, String username, String portfolioName, double totalValue, double dailyChange);
}