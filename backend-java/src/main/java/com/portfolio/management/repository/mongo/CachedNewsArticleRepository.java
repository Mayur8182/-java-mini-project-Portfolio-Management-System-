package com.portfolio.management.repository.mongo;

import com.portfolio.management.model.mongo.CachedNewsArticle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CachedNewsArticleRepository extends MongoRepository<CachedNewsArticle, String> {
    
    /**
     * Find cached news articles by symbol
     * 
     * @param symbol The stock symbol
     * @return List of news articles related to the symbol
     */
    List<CachedNewsArticle> findBySymbolOrderByPublishedAtDesc(String symbol);
    
    /**
     * Find general financial news (not related to a specific symbol)
     * 
     * @return List of general financial news articles
     */
    List<CachedNewsArticle> findBySymbolIsNullOrderByPublishedAtDesc();
    
    /**
     * Find cached news articles by symbol and published after the specified time
     * 
     * @param symbol The stock symbol
     * @param publishedAt The cutoff date/time
     * @return List of news articles related to the symbol and published after the specified time
     */
    List<CachedNewsArticle> findBySymbolAndPublishedAtAfterOrderByPublishedAtDesc(String symbol, LocalDateTime publishedAt);
    
    /**
     * Find general financial news published after the specified time
     * 
     * @param publishedAt The cutoff date/time
     * @return List of general financial news articles published after the specified time
     */
    List<CachedNewsArticle> findBySymbolIsNullAndPublishedAtAfterOrderByPublishedAtDesc(LocalDateTime publishedAt);
    
    /**
     * Delete all cached news articles for the specified symbol
     * 
     * @param symbol The stock symbol
     */
    void deleteBySymbol(String symbol);
    
    /**
     * Delete all cached news articles older than the specified time
     * 
     * @param cachedAt The cutoff date/time
     */
    void deleteByCachedAtBefore(LocalDateTime cachedAt);
}