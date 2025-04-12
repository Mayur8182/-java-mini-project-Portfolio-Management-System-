package com.portfolio.management.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.portfolio.management.model.PerformanceData;

public interface PerformanceDataService {
    
    /**
     * Get performance data for a portfolio
     * 
     * @param portfolioId Portfolio ID
     * @return List of performance data records
     */
    List<PerformanceData> getPerformanceDataByPortfolioId(Long portfolioId);
    
    /**
     * Get performance data for a portfolio within a date range
     * 
     * @param portfolioId Portfolio ID
     * @param startDate Start date
     * @param endDate End date
     * @return List of performance data records
     */
    List<PerformanceData> getPerformanceDataByPortfolioIdAndDateRange(
            Long portfolioId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Add a new performance data record
     * 
     * @param portfolioId Portfolio ID
     * @param totalValue Total portfolio value
     * @return The created performance data record
     */
    PerformanceData addPerformanceData(Long portfolioId, BigDecimal totalValue);
    
    /**
     * Get the latest performance data record for a portfolio
     * 
     * @param portfolioId Portfolio ID
     * @return The latest performance data record, or null if none exists
     */
    PerformanceData getLatestPerformanceData(Long portfolioId);
    
    /**
     * Calculate and record daily performance for all portfolios
     * This would typically be called by a scheduled task
     */
    void recordDailyPerformanceForAllPortfolios();
}