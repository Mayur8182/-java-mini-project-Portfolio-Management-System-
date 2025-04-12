package com.portfolio.management.service;

import com.portfolio.management.dto.NewsArticleDTO;

import java.util.List;

/**
 * Service interface for fetching financial news
 */
public interface NewsService {
    
    /**
     * Get general financial news
     * 
     * @param limit Maximum number of news articles to return
     * @return List of news articles
     */
    List<NewsArticleDTO> getFinancialNews(int limit);
    
    /**
     * Get news for a specific company/symbol
     * 
     * @param symbol Company symbol (e.g., AAPL, MSFT)
     * @param limit Maximum number of news articles to return
     * @return List of news articles specific to the company
     */
    List<NewsArticleDTO> getCompanyNews(String symbol, int limit);
}