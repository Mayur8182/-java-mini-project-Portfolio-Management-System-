package com.portfolio.management.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentWithPerformanceDto {
    private Long id;
    private Long portfolioId;
    private String name;
    private String symbol;
    private String type;
    private BigDecimal shares;
    private BigDecimal purchasePrice;
    private BigDecimal currentPrice;
    private LocalDateTime purchaseDate;
    
    // Performance metrics
    private BigDecimal value;
    private BigDecimal dailyChange;
    private BigDecimal dailyChangePercent;
    private BigDecimal totalReturn;
    private BigDecimal totalReturnPercent;
}