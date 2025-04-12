package com.portfolio.management.service;

import java.math.BigDecimal;
import java.util.Map;

public interface MarketDataService {
    
    /**
     * Get the current market price for a specific symbol
     * 
     * @param symbol The stock/investment symbol
     * @return The current market price
     */
    BigDecimal getCurrentPrice(String symbol);
    
    /**
     * Get the current market prices for multiple symbols in one call
     * 
     * @param symbols Array of symbols to get prices for
     * @return Map of symbol to current price
     */
    Map<String, BigDecimal> getCurrentPrices(String[] symbols);
    
    /**
     * Get historical prices for a symbol over a specified period
     * 
     * @param symbol The stock/investment symbol
     * @param days Number of days of historical data to retrieve
     * @return Map of date string (YYYY-MM-DD) to historical price
     */
    Map<String, BigDecimal> getHistoricalPrices(String symbol, int days);
}