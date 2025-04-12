package com.portfolio.management.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.portfolio.management.config.AppConfig;
import com.portfolio.management.dto.NewsArticleDTO;
import com.portfolio.management.service.NewsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class NewsServiceImpl implements NewsService {
    private static final Logger logger = LoggerFactory.getLogger(NewsServiceImpl.class);
    private static final String NEWS_API_BASE_URL = "https://newsapi.org/v2";
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    @Autowired
    private AppConfig appConfig;
    
    @Autowired
    private RestTemplate restTemplate;

    @Override
    public List<NewsArticleDTO> getFinancialNews(int limit) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(NEWS_API_BASE_URL + "/top-headlines")
                    .queryParam("category", "business")
                    .queryParam("language", "en")
                    .queryParam("pageSize", limit)
                    .queryParam("apiKey", appConfig.getNewsApiKey())
                    .toUriString();
            
            return fetchNewsArticles(url);
        } catch (Exception e) {
            logger.error("Error fetching financial news: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<NewsArticleDTO> getCompanyNews(String symbol, int limit) {
        try {
            // Format the date for the last 30 days
            LocalDateTime toDate = LocalDateTime.now();
            LocalDateTime fromDate = toDate.minusDays(30);
            
            String formattedFromDate = fromDate.format(formatter);
            String formattedToDate = toDate.format(formatter);
            
            String url = UriComponentsBuilder.fromHttpUrl(NEWS_API_BASE_URL + "/everything")
                    .queryParam("q", symbol)
                    .queryParam("from", formattedFromDate)
                    .queryParam("to", formattedToDate)
                    .queryParam("language", "en")
                    .queryParam("sortBy", "publishedAt")
                    .queryParam("pageSize", limit)
                    .queryParam("apiKey", appConfig.getNewsApiKey())
                    .toUriString();
            
            return fetchNewsArticles(url);
        } catch (Exception e) {
            logger.error("Error fetching company news for {}: {}", symbol, e.getMessage());
            return new ArrayList<>();
        }
    }
    
    private List<NewsArticleDTO> fetchNewsArticles(String url) {
        List<NewsArticleDTO> articles = new ArrayList<>();
        
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response != null && response.has("articles")) {
                JsonNode articlesNode = response.get("articles");
                
                for (JsonNode articleNode : articlesNode) {
                    NewsArticleDTO article = new NewsArticleDTO();
                    
                    article.setTitle(getTextValue(articleNode, "title"));
                    article.setDescription(getTextValue(articleNode, "description"));
                    article.setContent(getTextValue(articleNode, "content"));
                    article.setUrl(getTextValue(articleNode, "url"));
                    article.setImageUrl(getTextValue(articleNode, "urlToImage"));
                    article.setAuthor(getTextValue(articleNode, "author"));
                    
                    // Parse publishedAt date
                    String publishedAt = getTextValue(articleNode, "publishedAt");
                    if (publishedAt != null && !publishedAt.isEmpty()) {
                        article.setPublishedAt(LocalDateTime.parse(publishedAt, formatter));
                    }
                    
                    // Get source name
                    if (articleNode.has("source") && articleNode.get("source").has("name")) {
                        article.setSource(articleNode.get("source").get("name").asText());
                    }
                    
                    articles.add(article);
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing news articles: {}", e.getMessage());
        }
        
        return articles;
    }
    
    private String getTextValue(JsonNode node, String fieldName) {
        if (node.has(fieldName) && !node.get(fieldName).isNull()) {
            return node.get(fieldName).asText();
        }
        return null;
    }
}