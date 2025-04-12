package com.portfolio.management.service;

import java.util.List;

import com.portfolio.management.dto.InvestmentDto;
import com.portfolio.management.dto.InvestmentWithPerformanceDto;
import com.portfolio.management.model.Investment;

public interface InvestmentService {
    
    List<Investment> getAllInvestments();
    
    List<InvestmentWithPerformanceDto> getInvestmentsByPortfolioId(Long portfolioId);
    
    Investment getInvestmentById(Long id);
    
    Investment createInvestment(InvestmentDto investmentDto);
    
    Investment updateInvestment(Long id, InvestmentDto investmentDto);
    
    void deleteInvestment(Long id);
}