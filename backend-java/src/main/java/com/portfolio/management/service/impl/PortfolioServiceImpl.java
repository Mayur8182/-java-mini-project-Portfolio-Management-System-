package com.portfolio.management.service.impl;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portfolio.management.dto.PortfolioDto;
import com.portfolio.management.dto.PortfolioSummaryDto;
import com.portfolio.management.dto.PortfolioSummaryDto.AssetAllocation;
import com.portfolio.management.dto.PortfolioSummaryDto.PerformanceDataPoint;
import com.portfolio.management.model.Investment;
import com.portfolio.management.model.PerformanceData;
import com.portfolio.management.model.Portfolio;
import com.portfolio.management.model.User;
import com.portfolio.management.repository.InvestmentRepository;
import com.portfolio.management.repository.PerformanceDataRepository;
import com.portfolio.management.repository.PortfolioRepository;
import com.portfolio.management.repository.UserRepository;
import com.portfolio.management.service.PortfolioService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PortfolioServiceImpl implements PortfolioService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    @Autowired
    private PortfolioRepository portfolioRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InvestmentRepository investmentRepository;
    
    @Autowired
    private PerformanceDataRepository performanceDataRepository;
    
    @Override
    public List<Portfolio> getAllPortfolios() {
        return portfolioRepository.findAll();
    }

    @Override
    public List<Portfolio> getPortfoliosByUserId(Long userId) {
        return portfolioRepository.findByUserId(userId);
    }

    @Override
    public Portfolio getPortfolioById(Long id) {
        return portfolioRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Portfolio createPortfolio(PortfolioDto portfolioDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        Portfolio portfolio = new Portfolio();
        portfolio.setName(portfolioDto.getName());
        portfolio.setDescription(portfolioDto.getDescription());
        portfolio.setRiskLevel(portfolioDto.getRiskLevel());
        portfolio.setUser(user);
        portfolio.setCreatedAt(LocalDateTime.now());
        
        return portfolioRepository.save(portfolio);
    }

    @Override
    @Transactional
    public Portfolio updatePortfolio(Long id, PortfolioDto portfolioDto) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + id));
        
        portfolio.setName(portfolioDto.getName());
        portfolio.setDescription(portfolioDto.getDescription());
        portfolio.setRiskLevel(portfolioDto.getRiskLevel());
        
        return portfolioRepository.save(portfolio);
    }

    @Override
    @Transactional
    public void deletePortfolio(Long id) {
        portfolioRepository.deleteById(id);
    }

    @Override
    public PortfolioSummaryDto getPortfolioSummary(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + portfolioId));
        
        // Get all investments for this portfolio
        List<Investment> investments = investmentRepository.findByPortfolioId(portfolioId);
        
        // Get performance history
        List<PerformanceData> performanceHistory = performanceDataRepository.findByPortfolioId(portfolioId);
        
        // Calculate total portfolio value
        BigDecimal totalValue = calculateTotalValue(investments);
        
        // Calculate daily change
        BigDecimal dailyChange = new BigDecimal("0.00");
        BigDecimal dailyChangePercent = new BigDecimal("0.00");
        
        // Get latest performance data for daily change calculation
        Optional<PerformanceData> latestPerformance = performanceHistory.stream()
                .max((a, b) -> a.getDate().compareTo(b.getDate()));
        
        if (latestPerformance.isPresent() && performanceHistory.size() > 1) {
            // Get the second latest data point to calculate daily change
            Optional<PerformanceData> previousPerformance = performanceHistory.stream()
                    .filter(p -> p.getDate().isBefore(latestPerformance.get().getDate()))
                    .max((a, b) -> a.getDate().compareTo(b.getDate()));
            
            if (previousPerformance.isPresent()) {
                dailyChange = latestPerformance.get().getTotalValue().subtract(previousPerformance.get().getTotalValue());
                
                if (previousPerformance.get().getTotalValue().compareTo(BigDecimal.ZERO) > 0) {
                    dailyChangePercent = dailyChange
                            .divide(previousPerformance.get().getTotalValue(), 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));
                }
            }
        }
        
        // Calculate YTD return (simplified for demo purposes)
        BigDecimal ytdReturn = new BigDecimal("0.00");
        BigDecimal ytdReturnValue = new BigDecimal("0.00");
        
        // Get the first performance data point of the year (simplified)
        Optional<PerformanceData> firstOfYear = performanceHistory.stream()
                .filter(p -> p.getDate().getYear() == LocalDateTime.now().getYear())
                .min((a, b) -> a.getDate().compareTo(b.getDate()));
        
        if (firstOfYear.isPresent() && !performanceHistory.isEmpty()) {
            ytdReturnValue = totalValue.subtract(firstOfYear.get().getTotalValue());
            
            if (firstOfYear.get().getTotalValue().compareTo(BigDecimal.ZERO) > 0) {
                ytdReturn = ytdReturnValue
                        .divide(firstOfYear.get().getTotalValue(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
            }
        }
        
        // Format performance data for the chart
        List<PerformanceDataPoint> performanceData = performanceHistory.stream()
                .map(p -> new PerformanceDataPoint(
                        p.getDate().format(DATE_FORMATTER),
                        p.getTotalValue()
                ))
                .collect(Collectors.toList());
        
        // Calculate asset allocation
        List<AssetAllocation> assetAllocation = calculateAssetAllocation(investments, totalValue);
        
        // Build the summary DTO
        return PortfolioSummaryDto.builder()
                .id(portfolio.getId())
                .name(portfolio.getName())
                .totalValue(totalValue)
                .dailyChange(dailyChange)
                .dailyChangePercent(dailyChangePercent)
                .ytdReturn(ytdReturn)
                .ytdReturnValue(ytdReturnValue)
                .riskLevel(portfolio.getRiskLevel())
                .performanceData(performanceData)
                .assetAllocation(assetAllocation)
                .build();
    }
    
    private BigDecimal calculateTotalValue(List<Investment> investments) {
        return investments.stream()
                .map(i -> i.getCurrentPrice().multiply(i.getShares()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private List<AssetAllocation> calculateAssetAllocation(List<Investment> investments, BigDecimal totalValue) {
        Map<String, BigDecimal> typeValueMap = new HashMap<>();
        
        // Sum up values by investment type
        for (Investment inv : investments) {
            BigDecimal investmentValue = inv.getCurrentPrice().multiply(inv.getShares());
            typeValueMap.merge(inv.getType(), investmentValue, BigDecimal::add);
        }
        
        List<AssetAllocation> result = new ArrayList<>();
        
        // Calculate percentages and build result list
        for (Map.Entry<String, BigDecimal> entry : typeValueMap.entrySet()) {
            BigDecimal percentage = BigDecimal.ZERO;
            
            if (totalValue.compareTo(BigDecimal.ZERO) > 0) {
                percentage = entry.getValue()
                        .divide(totalValue, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"))
                        .setScale(2, RoundingMode.HALF_UP);
            }
            
            AssetAllocation allocation = new AssetAllocation(
                    entry.getKey(),
                    percentage,
                    entry.getValue());
            
            result.add(allocation);
        }
        
        return result;
    }
}