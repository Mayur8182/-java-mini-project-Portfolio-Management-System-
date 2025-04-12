package com.portfolio.management.config;

import com.portfolio.management.model.mongo.CachedMarketData;
import com.portfolio.management.model.mongo.CachedNewsArticle;
import com.portfolio.management.repository.mongo.CachedMarketDataRepository;
import com.portfolio.management.repository.mongo.CachedNewsArticleRepository;
import com.portfolio.management.service.PerformanceDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;

/**
 * Configuration for scheduled tasks
 */
@Configuration
@EnableScheduling
public class ScheduledTasksConfig {
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTasksConfig.class);
    
    @Autowired
    private CachedMarketDataRepository marketDataRepository;
    
    @Autowired
    private CachedNewsArticleRepository newsArticleRepository;
    
    @Autowired
    private PerformanceDataService performanceDataService;
    
    /**
     * Record daily performance for all portfolios
     * Runs once per day at 12:00 AM
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void recordDailyPerformance() {
        logger.info("Running scheduled task: Record daily performance");
        try {
            performanceDataService.recordDailyPerformanceForAllPortfolios();
            logger.info("Daily performance recording completed successfully");
        } catch (Exception e) {
            logger.error("Error recording daily performance: {}", e.getMessage());
        }
    }
    
    /**
     * Clear old market data cache
     * Runs once per day at 1:00 AM
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void clearOldMarketDataCache() {
        logger.info("Running scheduled task: Clear old market data cache");
        try {
            // Delete market data older than 7 days
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
            marketDataRepository.deleteByLastUpdatedBefore(cutoffDate);
            logger.info("Old market data cache cleared successfully");
        } catch (Exception e) {
            logger.error("Error clearing old market data cache: {}", e.getMessage());
        }
    }
    
    /**
     * Clear old news article cache
     * Runs once per day at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void clearOldNewsCache() {
        logger.info("Running scheduled task: Clear old news cache");
        try {
            // Delete news articles older than 3 days
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(3);
            newsArticleRepository.deleteByCachedAtBefore(cutoffDate);
            logger.info("Old news cache cleared successfully");
        } catch (Exception e) {
            logger.error("Error clearing old news cache: {}", e.getMessage());
        }
    }
}