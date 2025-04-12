package com.portfolio.management.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.portfolio.management.service.MarketDataService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/market")
public class MarketDataController {
    
    @Autowired
    private MarketDataService marketDataService;
    
    @GetMapping("/price/{symbol}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getCurrentPrice(@PathVariable String symbol) {
        BigDecimal price = marketDataService.getCurrentPrice(symbol);
        return ResponseEntity.ok(price);
    }
    
    @GetMapping("/prices")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, BigDecimal>> getPrices(@RequestParam String[] symbols) {
        Map<String, BigDecimal> prices = marketDataService.getCurrentPrices(symbols);
        return ResponseEntity.ok(prices);
    }
    
    @GetMapping("/history/{symbol}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, BigDecimal>> getHistoricalPrices(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "30") int days) {
        
        // Limit days to a reasonable range
        days = Math.min(Math.max(days, 1), 365);
        
        Map<String, BigDecimal> historicalPrices = marketDataService.getHistoricalPrices(symbol, days);
        return ResponseEntity.ok(historicalPrices);
    }
}