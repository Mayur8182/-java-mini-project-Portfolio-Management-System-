package com.portfolio.management.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSummaryDto {
    private Long id;
    private String name;
    private BigDecimal totalValue;
    private BigDecimal dailyChange;
    private BigDecimal dailyChangePercent;
    private BigDecimal ytdReturn;
    private BigDecimal ytdReturnValue;
    private String riskLevel;
    private List<PerformanceDataPoint> performanceData;
    private List<AssetAllocation> assetAllocation;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceDataPoint {
        private String date;
        private BigDecimal value;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssetAllocation {
        private String type;
        private BigDecimal percentage;
        private BigDecimal value;
    }
}