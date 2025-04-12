package com.portfolio.management.service.impl;

import com.portfolio.management.model.mongo.CachedMarketData;
import com.portfolio.management.repository.mongo.CachedMarketDataRepository;
import com.portfolio.management.service.MarketDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Implementation of MarketDataService with caching layer.
 * This service will first check if data is in cache before calling the real API.
 */
@Service
@Primary
public class CachedMarketDataServiceImpl implements MarketDataService {
    
    private static final Logger logger = LoggerFactory.getLogger(CachedMarketDataServiceImpl.class);
    private static final int CACHE_DURATION_MINUTES = 15; // Cache data for 15 minutes
    
    @Autowired
    private CachedMarketDataRepository marketDataRepository;
    
    @Autowired
    @Qualifier("FMPMarketDataServiceImpl")
    private MarketDataService primaryDataService;
    
    @Autowired
    @Qualifier("alphaVantageMarketDataServiceImpl")
    private MarketDataService backupDataService;

    @Override
    public BigDecimal getCurrentPrice(String symbol) {
        // Check cache first
        Optional<CachedMarketData> cachedData = marketDataRepository.findBySymbol(symbol);
        
        if (cachedData.isPresent() && !cachedData.get().isStale(CACHE_DURATION_MINUTES)) {
            logger.info("Using cached market data for symbol: {}", symbol);
            return cachedData.get().getCurrentPrice();
        }
        
        // Cache miss or stale data, fetch from API
        try {
            BigDecimal price = primaryDataService.getCurrentPrice(symbol);
            
            // Update cache
            if (price.compareTo(BigDecimal.ZERO) > 0) {
                updateCache(symbol, price, null, "FMP");
                return price;
            }
            
            // Try backup service if primary fails
            price = backupDataService.getCurrentPrice(symbol);
            if (price.compareTo(BigDecimal.ZERO) > 0) {
                updateCache(symbol, price, null, "ALPHA_VANTAGE");
                return price;
            }
            
            return BigDecimal.ZERO;
        } catch (Exception e) {
            logger.error("Error fetching current price for {}: {}", symbol, e.getMessage());
            
            // If we have stale data, return it as a fallback
            if (cachedData.isPresent()) {
                logger.warn("Using stale cached data for symbol: {}", symbol);
                return cachedData.get().getCurrentPrice();
            }
            
            return BigDecimal.ZERO;
        }
    }

    @Override
    public Map<String, BigDecimal> getCurrentPrices(String[] symbols) {
        Map<String, BigDecimal> prices = new HashMap<>();
        
        Arrays.stream(symbols).forEach(symbol -> 
            prices.put(symbol, getCurrentPrice(symbol))
        );
        
        return prices;
    }

    @Override
    public Map<String, BigDecimal> getHistoricalPrices(String symbol, int days) {
        // Check cache first
        Optional<CachedMarketData> cachedData = marketDataRepository.findBySymbol(symbol);
        
        if (cachedData.isPresent() && !cachedData.get().isStale(CACHE_DURATION_MINUTES)) {
            Map<String, BigDecimal> cachedPrices = cachedData.get().getHistoricalPrices();
            if (cachedPrices != null && !cachedPrices.isEmpty()) {
                logger.info("Using cached historical prices for symbol: {}", symbol);
                return cachedPrices;
            }
        }
        
        // Cache miss or stale data, fetch from API
        try {
            Map<String, BigDecimal> prices = primaryDataService.getHistoricalPrices(symbol, days);
            
            // Update cache
            if (prices != null && !prices.isEmpty()) {
                updateCache(symbol, null, prices, "FMP");
                return prices;
            }
            
            // Try backup service if primary fails
            prices = backupDataService.getHistoricalPrices(symbol, days);
            if (prices != null && !prices.isEmpty()) {
                updateCache(symbol, null, prices, "ALPHA_VANTAGE");
                return prices;
            }
            
            return new HashMap<>();
        } catch (Exception e) {
            logger.error("Error fetching historical prices for {}: {}", symbol, e.getMessage());
            
            // If we have stale data, return it as a fallback
            if (cachedData.isPresent() && cachedData.get().getHistoricalPrices() != null) {
                logger.warn("Using stale cached historical data for symbol: {}", symbol);
                return cachedData.get().getHistoricalPrices();
            }
            
            return new HashMap<>();
        }
    }
    
    /**
     * Update the cache with new market data
     * 
     * @param symbol The stock symbol
     * @param currentPrice The current price (can be null if only updating historical prices)
     * @param historicalPrices The historical prices (can be null if only updating current price)
     * @param dataSource The data source name
     */
    private void updateCache(String symbol, BigDecimal currentPrice, Map<String, BigDecimal> historicalPrices, String dataSource) {
        try {
            Optional<CachedMarketData> existingData = marketDataRepository.findBySymbol(symbol);
            
            if (existingData.isPresent()) {
                CachedMarketData data = existingData.get();
                
                if (currentPrice != null) {
                    data.setCurrentPrice(currentPrice);
                }
                
                if (historicalPrices != null) {
                    data.setHistoricalPrices(historicalPrices);
                }
                
                data.setLastUpdated(LocalDateTime.now());
                data.setDataSource(dataSource);
                
                marketDataRepository.save(data);
            } else {
                CachedMarketData newData = new CachedMarketData();
                newData.setSymbol(symbol);
                newData.setCurrentPrice(currentPrice != null ? currentPrice : BigDecimal.ZERO);
                newData.setHistoricalPrices(historicalPrices != null ? historicalPrices : new HashMap<>());
                newData.setLastUpdated(LocalDateTime.now());
                newData.setDataSource(dataSource);
                
                marketDataRepository.save(newData);
            }
            
            logger.info("Updated cache for symbol: {}", symbol);
        } catch (Exception e) {
            logger.error("Error updating cache for symbol {}: {}", symbol, e.getMessage());
        }
    }
}