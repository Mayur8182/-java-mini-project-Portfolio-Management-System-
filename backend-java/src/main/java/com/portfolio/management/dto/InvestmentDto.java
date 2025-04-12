package com.portfolio.management.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentDto {
    
    @NotNull(message = "Portfolio ID is required")
    private Long portfolioId;
    
    @NotBlank(message = "Investment name is required")
    private String name;
    
    @NotBlank(message = "Symbol is required")
    private String symbol;
    
    @NotBlank(message = "Investment type is required")
    private String type;
    
    @NotNull(message = "Shares amount is required")
    @Positive(message = "Shares must be a positive number")
    private BigDecimal shares;
    
    @NotNull(message = "Purchase price is required")
    @Positive(message = "Purchase price must be a positive number")
    private BigDecimal purchasePrice;
    
    @NotNull(message = "Current price is required")
    @Positive(message = "Current price must be a positive number")
    private BigDecimal currentPrice;
    
    private LocalDateTime purchaseDate;
}