package com.portfolio.management.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portfolio.management.dto.InvestmentDto;
import com.portfolio.management.dto.InvestmentWithPerformanceDto;
import com.portfolio.management.model.Investment;
import com.portfolio.management.model.Portfolio;
import com.portfolio.management.repository.InvestmentRepository;
import com.portfolio.management.repository.PortfolioRepository;
import com.portfolio.management.service.InvestmentService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class InvestmentServiceImpl implements InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;
    
    @Autowired
    private PortfolioRepository portfolioRepository;
    
    @Override
    public List<Investment> getAllInvestments() {
        return investmentRepository.findAll();
    }

    @Override
    public List<InvestmentWithPerformanceDto> getInvestmentsByPortfolioId(Long portfolioId) {
        List<Investment> investments = investmentRepository.findByPortfolioId(portfolioId);
        
        return investments.stream()
                .map(this::calculatePerformanceMetrics)
                .collect(Collectors.toList());
    }

    @Override
    public Investment getInvestmentById(Long id) {
        return investmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Investment not found with ID: " + id));
    }

    @Override
    @Transactional
    public Investment createInvestment(InvestmentDto investmentDto) {
        Portfolio portfolio = portfolioRepository.findById(investmentDto.getPortfolioId())
                .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + investmentDto.getPortfolioId()));
        
        Investment investment = new Investment();
        investment.setPortfolio(portfolio);
        investment.setName(investmentDto.getName());
        investment.setSymbol(investmentDto.getSymbol());
        investment.setType(investmentDto.getType());
        investment.setShares(investmentDto.getShares());
        investment.setPurchasePrice(investmentDto.getPurchasePrice());
        investment.setCurrentPrice(investmentDto.getCurrentPrice());
        
        if (investmentDto.getPurchaseDate() != null) {
            investment.setPurchaseDate(investmentDto.getPurchaseDate());
        } else {
            investment.setPurchaseDate(LocalDateTime.now());
        }
        
        return investmentRepository.save(investment);
    }

    @Override
    @Transactional
    public Investment updateInvestment(Long id, InvestmentDto investmentDto) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Investment not found with ID: " + id));
        
        // Update only if portfolio changed
        if (!investment.getPortfolio().getId().equals(investmentDto.getPortfolioId())) {
            Portfolio portfolio = portfolioRepository.findById(investmentDto.getPortfolioId())
                    .orElseThrow(() -> new EntityNotFoundException("Portfolio not found with ID: " + investmentDto.getPortfolioId()));
            investment.setPortfolio(portfolio);
        }
        
        investment.setName(investmentDto.getName());
        investment.setSymbol(investmentDto.getSymbol());
        investment.setType(investmentDto.getType());
        investment.setShares(investmentDto.getShares());
        investment.setPurchasePrice(investmentDto.getPurchasePrice());
        investment.setCurrentPrice(investmentDto.getCurrentPrice());
        
        if (investmentDto.getPurchaseDate() != null) {
            investment.setPurchaseDate(investmentDto.getPurchaseDate());
        }
        
        return investmentRepository.save(investment);
    }

    @Override
    @Transactional
    public void deleteInvestment(Long id) {
        investmentRepository.deleteById(id);
    }
    
    private InvestmentWithPerformanceDto calculatePerformanceMetrics(Investment investment) {
        InvestmentWithPerformanceDto dto = new InvestmentWithPerformanceDto();
        
        // Copy basic fields
        dto.setId(investment.getId());
        dto.setPortfolioId(investment.getPortfolio().getId());
        dto.setName(investment.getName());
        dto.setSymbol(investment.getSymbol());
        dto.setType(investment.getType());
        dto.setShares(investment.getShares());
        dto.setPurchasePrice(investment.getPurchasePrice());
        dto.setCurrentPrice(investment.getCurrentPrice());
        dto.setPurchaseDate(investment.getPurchaseDate());
        
        // Calculate current value
        BigDecimal value = investment.getShares().multiply(investment.getCurrentPrice());
        dto.setValue(value);
        
        // For the purpose of this demo, let's assume daily change is 0-2% of current value
        // In a real app, this would use historical data or external API
        BigDecimal dailyChangePercent = new BigDecimal(Math.random() * 0.02)
                .setScale(4, RoundingMode.HALF_UP);
        
        if (Math.random() > 0.5) {
            dailyChangePercent = dailyChangePercent.negate();
        }
        
        BigDecimal dailyChange = value.multiply(dailyChangePercent);
        dto.setDailyChange(dailyChange);
        dto.setDailyChangePercent(dailyChangePercent.multiply(new BigDecimal("100")));
        
        // Calculate total return
        BigDecimal initialInvestment = investment.getShares().multiply(investment.getPurchasePrice());
        BigDecimal totalReturn = value.subtract(initialInvestment);
        dto.setTotalReturn(totalReturn);
        
        // Calculate total return percent
        if (initialInvestment.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal totalReturnPercent = totalReturn
                    .divide(initialInvestment, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            dto.setTotalReturnPercent(totalReturnPercent);
        } else {
            dto.setTotalReturnPercent(BigDecimal.ZERO);
        }
        
        return dto;
    }
}