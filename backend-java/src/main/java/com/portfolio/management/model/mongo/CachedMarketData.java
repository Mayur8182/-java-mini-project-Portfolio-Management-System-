package com.portfolio.management.model.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * MongoDB document model for cached market data
 */
@Document(collection = "cached_market_data")
public class CachedMarketData {
    
    @Id
    private String id;
    
    private String symbol;
    private BigDecimal currentPrice;
    private Map<String, BigDecimal> historicalPrices;
    private LocalDateTime lastUpdated;
    private String dataSource; // "FMP", "ALPHA_VANTAGE", etc.
    
    public CachedMarketData() {
    }
    
    public CachedMarketData(String symbol, BigDecimal currentPrice, 
                           Map<String, BigDecimal> historicalPrices, 
                           String dataSource) {
        this.symbol = symbol;
        this.currentPrice = currentPrice;
        this.historicalPrices = historicalPrices;
        this.lastUpdated = LocalDateTime.now();
        this.dataSource = dataSource;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Map<String, BigDecimal> getHistoricalPrices() {
        return historicalPrices;
    }

    public void setHistoricalPrices(Map<String, BigDecimal> historicalPrices) {
        this.historicalPrices = historicalPrices;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getDataSource() {
        return dataSource;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }
    
    /**
     * Check if the cached data is stale (older than the specified minutes)
     * 
     * @param minutes Minutes threshold for staleness
     * @return True if the data is stale, false otherwise
     */
    public boolean isStale(int minutes) {
        return lastUpdated.plusMinutes(minutes).isBefore(LocalDateTime.now());
    }
}