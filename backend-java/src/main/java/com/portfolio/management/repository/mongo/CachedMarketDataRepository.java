package com.portfolio.management.repository.mongo;

import com.portfolio.management.model.mongo.CachedMarketData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CachedMarketDataRepository extends MongoRepository<CachedMarketData, String> {
    
    /**
     * Find cached market data by symbol
     * 
     * @param symbol The stock symbol
     * @return Optional containing the cached market data, or empty if not found
     */
    Optional<CachedMarketData> findBySymbol(String symbol);
    
    /**
     * Find all cached market data updated after the specified time
     * 
     * @param dateTime The cutoff date/time
     * @return List of cached market data updated after the specified time
     */
    List<CachedMarketData> findByLastUpdatedAfter(LocalDateTime dateTime);
    
    /**
     * Find all cached market data for the specified data source
     * 
     * @param dataSource The data source name
     * @return List of cached market data from the specified source
     */
    List<CachedMarketData> findByDataSource(String dataSource);
    
    /**
     * Delete cached market data by symbol
     * 
     * @param symbol The stock symbol
     */
    void deleteBySymbol(String symbol);
    
    /**
     * Delete all cached market data older than the specified time
     * 
     * @param dateTime The cutoff date/time
     */
    void deleteByLastUpdatedBefore(LocalDateTime dateTime);
}