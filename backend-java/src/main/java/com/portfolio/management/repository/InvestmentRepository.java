package com.portfolio.management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.portfolio.management.model.Investment;
import com.portfolio.management.model.Portfolio;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByPortfolio(Portfolio portfolio);
    List<Investment> findByPortfolioId(Long portfolioId);
    List<Investment> findByPortfolioIdAndType(Long portfolioId, String type);
    
    @Query("SELECT i.type, SUM(i.shares * i.currentPrice) as value FROM Investment i WHERE i.portfolio.id = ?1 GROUP BY i.type")
    List<Object[]> findAssetAllocationByPortfolioId(Long portfolioId);
}