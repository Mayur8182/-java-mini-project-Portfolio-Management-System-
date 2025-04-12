package com.portfolio.management.controller;

import com.portfolio.management.dto.NewsArticleDTO;
import com.portfolio.management.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/news")
public class NewsController {
    
    @Autowired
    private NewsService newsService;
    
    @GetMapping("/financial")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<NewsArticleDTO>> getFinancialNews(
            @RequestParam(defaultValue = "10") int limit) {
        
        // Limit the number of news articles
        limit = Math.min(Math.max(limit, 1), 50);
        
        List<NewsArticleDTO> news = newsService.getFinancialNews(limit);
        return ResponseEntity.ok(news);
    }
    
    @GetMapping("/company/{symbol}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<NewsArticleDTO>> getCompanyNews(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "10") int limit) {
        
        // Limit the number of news articles
        limit = Math.min(Math.max(limit, 1), 50);
        
        List<NewsArticleDTO> news = newsService.getCompanyNews(symbol, limit);
        return ResponseEntity.ok(news);
    }
}