package com.portfolio.management.model.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document model for cached news articles
 */
@Document(collection = "cached_news_articles")
public class CachedNewsArticle {
    
    @Id
    private String id;
    
    private String title;
    private String description;
    private String content;
    private String url;
    private String imageUrl;
    private String source;
    private String author;
    private LocalDateTime publishedAt;
    private String symbol; // The stock symbol this news is related to, or null for general financial news
    private LocalDateTime cachedAt;
    
    public CachedNewsArticle() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public LocalDateTime getCachedAt() {
        return cachedAt;
    }

    public void setCachedAt(LocalDateTime cachedAt) {
        this.cachedAt = cachedAt;
    }
    
    /**
     * Check if the cached news is stale (older than the specified hours)
     * 
     * @param hours Hours threshold for staleness
     * @return True if the news is stale, false otherwise
     */
    public boolean isStale(int hours) {
        return cachedAt.plusHours(hours).isBefore(LocalDateTime.now());
    }
}