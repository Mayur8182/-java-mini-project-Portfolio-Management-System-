package com.portfolio.management.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.portfolio.management.service.MarketDataService;

@Service
public class MarketDataServiceImpl implements MarketDataService {
    private static final Logger logger = LoggerFactory.getLogger(MarketDataServiceImpl.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    // For production, this would be replaced with a real API client
    private final Map<String, BigDecimal> priceCache = new ConcurrentHashMap<>();
    private final Random random = new Random();
    
    @Value("${market.data.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    public MarketDataServiceImpl() {
        this.restTemplate = new RestTemplate();
        
        // Initialize some default prices for demo purposes
        priceCache.put("AAPL", new BigDecimal("150.50"));
        priceCache.put("MSFT", new BigDecimal("305.25"));
        priceCache.put("GOOGL", new BigDecimal("2750.75"));
        priceCache.put("AMZN", new BigDecimal("3350.60"));
        priceCache.put("FB", new BigDecimal("325.45"));
        priceCache.put("TSLA", new BigDecimal("775.20"));
        priceCache.put("BRK.A", new BigDecimal("420000.00"));
        priceCache.put("V", new BigDecimal("230.40"));
        priceCache.put("JPM", new BigDecimal("160.30"));
        priceCache.put("JNJ", new BigDecimal("165.75"));
    }

    @Override
    public BigDecimal getCurrentPrice(String symbol) {
        // In a real implementation, this would call an external API
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                // This is a placeholder for real API call
                // String url = "https://api.marketdata.com/v1/quotes?symbol=" + symbol + "&apikey=" + apiKey;
                // Return restTemplate.getForObject(url, MarketResponse.class).getPrice();
                logger.info("Using API key to get real market data for {}", symbol);
            } catch (Exception e) {
                logger.error("Error fetching market data for {}: {}", symbol, e.getMessage());
            }
        }
        
        // Return cached price or generate random price for demo
        if (!priceCache.containsKey(symbol)) {
            // If symbol not in cache, generate a random price between 10 and 1000
            priceCache.put(symbol, new BigDecimal(10 + random.nextInt(990) + random.nextDouble()).setScale(2, BigDecimal.ROUND_HALF_UP));
        } else {
            // Simulate small market fluctuations (±2%)
            BigDecimal currentPrice = priceCache.get(symbol);
            double fluctuation = 0.98 + (random.nextDouble() * 0.04); // 0.98 to 1.02
            BigDecimal newPrice = currentPrice.multiply(new BigDecimal(fluctuation)).setScale(2, BigDecimal.ROUND_HALF_UP);
            priceCache.put(symbol, newPrice);
        }
        
        return priceCache.get(symbol);
    }

    @Override
    public Map<String, BigDecimal> getCurrentPrices(String[] symbols) {
        Map<String, BigDecimal> prices = new HashMap<>();
        
        // In production, this would be a batch API call
        for (String symbol : symbols) {
            prices.put(symbol, getCurrentPrice(symbol));
        }
        
        return prices;
    }

    @Override
    public Map<String, BigDecimal> getHistoricalPrices(String symbol, int days) {
        Map<String, BigDecimal> historicalPrices = new HashMap<>();
        
        // Get the current price as a starting point
        BigDecimal currentPrice = getCurrentPrice(symbol);
        
        // Generate historical prices with some randomness
        LocalDate today = LocalDate.now();
        for (int i = 0; i < days; i++) {
            LocalDate date = today.minusDays(i);
            
            // Add some randomness to historical prices (±10% from current price)
            double randomFactor = 0.9 + (random.nextDouble() * 0.2); // 0.9 to 1.1
            BigDecimal historicalPrice = currentPrice.multiply(new BigDecimal(randomFactor)).setScale(2, BigDecimal.ROUND_HALF_UP);
            
            historicalPrices.put(date.format(formatter), historicalPrice);
        }
        
        return historicalPrices;
    }
}