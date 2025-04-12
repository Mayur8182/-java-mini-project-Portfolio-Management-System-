package com.portfolio.management.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.portfolio.management.model.PerformanceData;
import com.portfolio.management.model.Portfolio;

@Repository
public interface PerformanceDataRepository extends JpaRepository<PerformanceData, Long> {
    List<PerformanceData> findByPortfolio(Portfolio portfolio);
    List<PerformanceData> findByPortfolioId(Long portfolioId);
    List<PerformanceData> findByPortfolioIdAndDateBetweenOrderByDateAsc(Long portfolioId, LocalDateTime startDate, LocalDateTime endDate);
    PerformanceData findTopByPortfolioIdOrderByDateDesc(Long portfolioId);
}