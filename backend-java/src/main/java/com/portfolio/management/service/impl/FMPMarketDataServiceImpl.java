package com.portfolio.management.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.portfolio.management.config.AppConfig;
import com.portfolio.management.service.MarketDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@Primary
public class FMPMarketDataServiceImpl implements MarketDataService {
    private static final Logger logger = LoggerFactory.getLogger(FMPMarketDataServiceImpl.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";

    @Autowired
    private AppConfig appConfig;
    
    @Autowired
    private RestTemplate restTemplate;

    @Override
    public BigDecimal getCurrentPrice(String symbol) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(FMP_BASE_URL + "/quote/" + symbol)
                    .queryParam("apikey", appConfig.getFmpApiKey())
                    .toUriString();
            
            JsonNode[] response = restTemplate.getForObject(url, JsonNode[].class);
            
            if (response != null && response.length > 0) {
                return new BigDecimal(response[0].get("price").asText());
            } else {
                logger.warn("No data returned from FMP API for symbol: {}", symbol);
                return BigDecimal.ZERO;
            }
        } catch (Exception e) {
            logger.error("Error fetching current price for {}: {}", symbol, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    @Override
    public Map<String, BigDecimal> getCurrentPrices(String[] symbols) {
        Map<String, BigDecimal> prices = new HashMap<>();
        
        for (String symbol : symbols) {
            prices.put(symbol, getCurrentPrice(symbol));
        }
        
        return prices;
    }

    @Override
    public Map<String, BigDecimal> getHistoricalPrices(String symbol, int days) {
        Map<String, BigDecimal> historicalPrices = new HashMap<>();
        
        try {
            // Calculate the from date based on days
            LocalDate toDate = LocalDate.now();
            LocalDate fromDate = toDate.minusDays(days);
            
            String url = UriComponentsBuilder.fromHttpUrl(FMP_BASE_URL + "/historical-price-full/" + symbol)
                    .queryParam("from", fromDate.format(formatter))
                    .queryParam("to", toDate.format(formatter))
                    .queryParam("apikey", appConfig.getFmpApiKey())
                    .toUriString();
            
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            
            if (response != null && response.has("historical")) {
                JsonNode historical = response.get("historical");
                
                for (JsonNode dayData : historical) {
                    String date = dayData.get("date").asText();
                    BigDecimal closePrice = new BigDecimal(dayData.get("close").asText());
                    historicalPrices.put(date, closePrice);
                }
            } else {
                logger.warn("No historical data returned from FMP API for symbol: {}", symbol);
            }
        } catch (Exception e) {
            logger.error("Error fetching historical prices for {}: {}", symbol, e.getMessage());
        }
        
        return historicalPrices;
    }
}