package com.portfolio.management.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Data
@Entity
@Table(name = "investments")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
public class Investment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @NotBlank
    private String name;

    @NotBlank
    private String symbol;

    @NotBlank
    private String type; // Stock, Bond, Mutual Fund

    @NotNull
    @Positive
    private BigDecimal shares;

    @NotNull
    @Positive
    @Column(name = "purchase_price")
    private BigDecimal purchasePrice;

    @NotNull
    @Positive
    @Column(name = "current_price")
    private BigDecimal currentPrice;

    @CreatedDate
    @Column(name = "purchase_date", nullable = false, updatable = false)
    private LocalDateTime purchaseDate;
    
    @Transient
    public BigDecimal getValue() {
        return shares.multiply(currentPrice);
    }
    
    @Transient
    public BigDecimal getDailyChange() {
        // This would need to be populated from external data or calculation
        return BigDecimal.ZERO;
    }
    
    @Transient
    public BigDecimal getDailyChangePercent() {
        // This would need to be populated from external data or calculation
        return BigDecimal.ZERO;
    }
    
    @Transient
    public BigDecimal getTotalReturn() {
        return getValue().subtract(shares.multiply(purchasePrice));
    }
    
    @Transient
    public BigDecimal getTotalReturnPercent() {
        BigDecimal initialInvestment = shares.multiply(purchasePrice);
        if (initialInvestment.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return getTotalReturn().multiply(new BigDecimal("100")).divide(initialInvestment, 2, BigDecimal.ROUND_HALF_UP);
    }
}