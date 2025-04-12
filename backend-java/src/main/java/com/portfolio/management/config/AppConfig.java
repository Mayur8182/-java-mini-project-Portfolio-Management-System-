package com.portfolio.management.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.client.RestTemplate;

import java.util.Properties;

@Configuration
public class AppConfig {

    @Value("${api.fmp.key}")
    private String fmpApiKey;
    
    @Value("${api.alphavantage.key}")
    private String alphaVantageApiKey;
    
    @Value("${api.news.key}")
    private String newsApiKey;
    
    @Value("${mail.username}")
    private String mailUsername;
    
    @Value("${mail.password}")
    private String mailPassword;
    
    @Value("${mongodb.uri}")
    private String mongoDbUri;
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false");
        
        return mailSender;
    }
    
    public String getFmpApiKey() {
        return fmpApiKey;
    }
    
    public String getAlphaVantageApiKey() {
        return alphaVantageApiKey;
    }
    
    public String getNewsApiKey() {
        return newsApiKey;
    }
    
    public String getMongoDbUri() {
        return mongoDbUri;
    }
}