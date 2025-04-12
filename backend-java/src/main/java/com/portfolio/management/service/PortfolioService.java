package com.portfolio.management.service;

import java.util.List;

import com.portfolio.management.dto.PortfolioDto;
import com.portfolio.management.dto.PortfolioSummaryDto;
import com.portfolio.management.model.Portfolio;

public interface PortfolioService {
    
    List<Portfolio> getAllPortfolios();
    
    List<Portfolio> getPortfoliosByUserId(Long userId);
    
    Portfolio getPortfolioById(Long id);
    
    Portfolio createPortfolio(PortfolioDto portfolioDto, Long userId);
    
    Portfolio updatePortfolio(Long id, PortfolioDto portfolioDto);
    
    void deletePortfolio(Long id);
    
    PortfolioSummaryDto getPortfolioSummary(Long portfolioId);
}