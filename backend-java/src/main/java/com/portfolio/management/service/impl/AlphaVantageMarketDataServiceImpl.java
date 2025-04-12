package com.portfolio.management.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.portfolio.management.config.AppConfig;
import com.portfolio.management.service.MarketDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Service
public class AlphaVantageMarketDataServiceImpl implements MarketDataService {
    private static final Logger logger = LoggerFactory.getLogger(AlphaVantageMarketDataServiceImpl.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

    @Autowired
    private AppConfig appConfig;
    
    @Autowired
    private RestTemplate restTemplate;

    @Override
    public BigDecimal getCurrentPrice(String symbol) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(ALPHA_VANTAGE_BASE_URL)
                    .queryParam("function", "GLOBAL_QUOTE")
                    .queryParam("symbol", symbol)
                    .queryParam("apikey", appConfig.getAlphaVantageApiKey())
                    .toUriString();
            
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response != null && response.has("Global Quote")) {
                JsonNode quote = response.get("Global Quote");
                return new BigDecimal(quote.get("05. price").asText());
            } else {
                logger.warn("No data returned from Alpha Vantage API for symbol: {}", symbol);
                return BigDecimal.ZERO;
            }
        } catch (Exception e) {
            logger.error("Error fetching current price from Alpha Vantage for {}: {}", symbol, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    @Override
    public Map<String, BigDecimal> getCurrentPrices(String[] symbols) {
        Map<String, BigDecimal> prices = new HashMap<>();
        
        for (String symbol : symbols) {
            prices.put(symbol, getCurrentPrice(symbol));
            
            // Alpha Vantage has rate limits, so add a small delay between requests
            try {
                Thread.sleep(1200); // Sleep for 1.2 seconds to avoid hitting rate limits
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        return prices;
    }

    @Override
    public Map<String, BigDecimal> getHistoricalPrices(String symbol, int days) {
        Map<String, BigDecimal> historicalPrices = new HashMap<>();
        
        try {
            String url = UriComponentsBuilder.fromHttpUrl(ALPHA_VANTAGE_BASE_URL)
                    .queryParam("function", "TIME_SERIES_DAILY")
                    .queryParam("symbol", symbol)
                    .queryParam("outputsize", days > 100 ? "full" : "compact")
                    .queryParam("apikey", appConfig.getAlphaVantageApiKey())
                    .toUriString();
            
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response != null && response.has("Time Series (Daily)")) {
                JsonNode timeSeries = response.get("Time Series (Daily)");
                
                // Get current date for calculating the date range
                LocalDate currentDate = LocalDate.now();
                LocalDate cutoffDate = currentDate.minusDays(days);
                
                // Iterate through the time series data
                Iterator<Map.Entry<String, JsonNode>> fields = timeSeries.fields();
                
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    String dateStr = entry.getKey();
                    LocalDate date = LocalDate.parse(dateStr, formatter);
                    
                    // Only include dates within the requested range
                    if (!date.isBefore(cutoffDate)) {
                        JsonNode dayData = entry.getValue();
                        BigDecimal closePrice = new BigDecimal(dayData.get("4. close").asText());
                        historicalPrices.put(dateStr, closePrice);
                    }
                }
            } else {
                logger.warn("No historical data returned from Alpha Vantage API for symbol: {}", symbol);
            }
        } catch (Exception e) {
            logger.error("Error fetching historical prices from Alpha Vantage for {}: {}", symbol, e.getMessage());
        }
        
        return historicalPrices;
    }
}