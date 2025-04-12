package com.portfolio.management.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.portfolio.management.dto.InvestmentDto;
import com.portfolio.management.dto.InvestmentWithPerformanceDto;
import com.portfolio.management.model.Investment;
import com.portfolio.management.model.Portfolio;
import com.portfolio.management.security.services.UserDetailsImpl;
import com.portfolio.management.service.InvestmentService;
import com.portfolio.management.service.PortfolioService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class InvestmentController {
    
    @Autowired
    private InvestmentService investmentService;
    
    @Autowired
    private PortfolioService portfolioService;
    
    @GetMapping("/portfolios/{portfolioId}/investments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<InvestmentWithPerformanceDto>> getInvestmentsByPortfolioId(@PathVariable Long portfolioId) {
        UserDetailsImpl userDetails = getCurrentUser();
        
        Portfolio portfolio = portfolioService.getPortfolioById(portfolioId);
        if (portfolio == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!portfolio.getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        List<InvestmentWithPerformanceDto> investments = investmentService.getInvestmentsByPortfolioId(portfolioId);
        return new ResponseEntity<>(investments, HttpStatus.OK);
    }
    
    @GetMapping("/investments/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable Long id) {
        UserDetailsImpl userDetails = getCurrentUser();
        
        Investment investment = investmentService.getInvestmentById(id);
        if (investment == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!investment.getPortfolio().getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return new ResponseEntity<>(investment, HttpStatus.OK);
    }
    
    @PostMapping("/investments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Investment> createInvestment(@Valid @RequestBody InvestmentDto investmentDto) {
        UserDetailsImpl userDetails = getCurrentUser();
        
        Portfolio portfolio = portfolioService.getPortfolioById(investmentDto.getPortfolioId());
        if (portfolio == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!portfolio.getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        Investment investment = investmentService.createInvestment(investmentDto);
        return new ResponseEntity<>(investment, HttpStatus.CREATED);
    }
    
    @PutMapping("/investments/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Investment> updateInvestment(
            @PathVariable Long id, 
            @Valid @RequestBody InvestmentDto investmentDto) {
        
        UserDetailsImpl userDetails = getCurrentUser();
        
        Investment existingInvestment = investmentService.getInvestmentById(id);
        if (existingInvestment == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!existingInvestment.getPortfolio().getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        // Check if portfolio change is allowed (must be owned by same user)
        if (!existingInvestment.getPortfolio().getId().equals(investmentDto.getPortfolioId())) {
            Portfolio targetPortfolio = portfolioService.getPortfolioById(investmentDto.getPortfolioId());
            if (targetPortfolio == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            if (!targetPortfolio.getUser().getId().equals(userDetails.getId()) && 
                !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }
        
        Investment updatedInvestment = investmentService.updateInvestment(id, investmentDto);
        return new ResponseEntity<>(updatedInvestment, HttpStatus.OK);
    }
    
    @DeleteMapping("/investments/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInvestment(@PathVariable Long id) {
        UserDetailsImpl userDetails = getCurrentUser();
        
        Investment investment = investmentService.getInvestmentById(id);
        if (investment == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!investment.getPortfolio().getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        investmentService.deleteInvestment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    private UserDetailsImpl getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }
}