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

import com.portfolio.management.dto.PortfolioDto;
import com.portfolio.management.dto.PortfolioSummaryDto;
import com.portfolio.management.model.Portfolio;
import com.portfolio.management.security.services.UserDetailsImpl;
import com.portfolio.management.service.PortfolioService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {
    
    @Autowired
    private PortfolioService portfolioService;
    
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Portfolio>> getAllPortfolios() {
        UserDetailsImpl userDetails = getCurrentUser();
        List<Portfolio> portfolios = portfolioService.getPortfoliosByUserId(userDetails.getId());
        return new ResponseEntity<>(portfolios, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Portfolio> getPortfolioById(@PathVariable Long id) {
        UserDetailsImpl userDetails = getCurrentUser();
        Portfolio portfolio = portfolioService.getPortfolioById(id);
        
        if (portfolio == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!portfolio.getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return new ResponseEntity<>(portfolio, HttpStatus.OK);
    }
    
    @GetMapping("/{id}/summary")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PortfolioSummaryDto> getPortfolioSummary(@PathVariable Long id) {
        UserDetailsImpl userDetails = getCurrentUser();
        
        Portfolio portfolio = portfolioService.getPortfolioById(id);
        if (portfolio == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!portfolio.getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        PortfolioSummaryDto summary = portfolioService.getPortfolioSummary(id);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Portfolio> createPortfolio(@Valid @RequestBody PortfolioDto portfolioDto) {
        UserDetailsImpl userDetails = getCurrentUser();
        Portfolio newPortfolio = portfolioService.createPortfolio(portfolioDto, userDetails.getId());
        return new ResponseEntity<>(newPortfolio, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Portfolio> updatePortfolio(
            @PathVariable Long id, 
            @Valid @RequestBody PortfolioDto portfolioDto) {
        
        UserDetailsImpl userDetails = getCurrentUser();
        
        Portfolio portfolio = portfolioService.getPortfolioById(id);
        if (portfolio == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!portfolio.getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        Portfolio updatedPortfolio = portfolioService.updatePortfolio(id, portfolioDto);
        return new ResponseEntity<>(updatedPortfolio, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        UserDetailsImpl userDetails = getCurrentUser();
        
        Portfolio portfolio = portfolioService.getPortfolioById(id);
        if (portfolio == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        if (!portfolio.getUser().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        portfolioService.deletePortfolio(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    private UserDetailsImpl getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }
}