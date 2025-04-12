import { 
  users, portfolios, investments, performanceData, 
  type User, type InsertUser, 
  type Portfolio, type InsertPortfolio, 
  type Investment, type InsertInvestment, 
  type Performance, type InsertPerformance,
  type PortfolioSummary,
  type InvestmentWithPerformance
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Portfolio methods
  getPortfolios(userId: number): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number): Promise<boolean>;

  // Investment methods
  getInvestments(portfolioId: number): Promise<InvestmentWithPerformance[]>;
  getInvestment(id: number): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, investment: Partial<InsertInvestment>): Promise<Investment | undefined>;
  deleteInvestment(id: number): Promise<boolean>;

  // Performance methods
  getPerformanceData(portfolioId: number): Promise<Performance[]>;
  addPerformanceData(performance: InsertPerformance): Promise<Performance>;

  // Dashboard data
  getPortfolioSummary(portfolioId: number): Promise<PortfolioSummary | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolios: Map<number, Portfolio>;
  private investments: Map<number, Investment>;
  private performances: Map<number, Performance>;
  
  private userCurrentId: number;
  private portfolioCurrentId: number;
  private investmentCurrentId: number;
  private performanceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.investments = new Map();
    this.performances = new Map();
    
    this.userCurrentId = 1;
    this.portfolioCurrentId = 1;
    this.investmentCurrentId = 1;
    this.performanceCurrentId = 1;

    // Create a demo user
    this.createUser({ username: "demo", password: "password" });
    
    // Add sample portfolio
    const portfolioId = this.portfolioCurrentId;
    this.createPortfolio({ name: "My Investment Portfolio", userId: 1, riskLevel: "Moderate" });
    
    // Add sample investments
    this.createInvestment({
      portfolioId,
      name: "Apple Inc.",
      symbol: "AAPL",
      type: "Stock",
      shares: 45,
      purchasePrice: 145.86,
      currentPrice: 145.86 * 1.2345, // Simulating some growth
    });
    
    this.createInvestment({
      portfolioId,
      name: "Microsoft Corporation",
      symbol: "MSFT",
      type: "Stock",
      shares: 32,
      purchasePrice: 289.67,
      currentPrice: 289.67 * 1.1823, // Simulating some growth
    });
    
    this.createInvestment({
      portfolioId,
      name: "Vanguard Total Bond Market ETF",
      symbol: "BND",
      type: "Bond",
      shares: 120,
      purchasePrice: 85.34,
      currentPrice: 85.34 * 1.0275, // Simulating small growth (bonds)
    });
    
    this.createInvestment({
      portfolioId,
      name: "Vanguard Total Stock Market Index Fund",
      symbol: "VTSAX",
      type: "Mutual Fund",
      shares: 65,
      purchasePrice: 109.54,
      currentPrice: 109.54 * 1.1467, // Simulating some growth
    });
    
    this.createInvestment({
      portfolioId,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      type: "Stock",
      shares: 8,
      purchasePrice: 3421.57,
      currentPrice: 3421.57 * 1.0532, // Simulating some growth
    });
    
    // Add sample performance data (last 12 months)
    const startValue = 150000;
    const months = 12;
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (months - 1 - i));
      
      // Generate a somewhat realistic growth pattern
      let value: number;
      if (i === 0) {
        value = startValue;
      } else if (i === 1) {
        value = startValue * 0.99; // Small dip
      } else if (i === 2) {
        value = startValue * 1.01; // Recovery
      } else {
        // Progressive growth with some variation
        const previousValue = this.getPerformanceDataArray()[i - 1].totalValue as number;
        const changePercent = (Math.random() * 0.05) - 0.01; // Between -1% and 4%
        value = previousValue * (1 + changePercent);
      }
      
      this.addPerformanceData({
        portfolioId,
        totalValue: Math.round(value * 100) / 100,
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Portfolio methods
  async getPortfolios(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(
      (portfolio) => portfolio.userId === userId,
    );
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.portfolioCurrentId++;
    const createdAt = new Date();
    const portfolio: Portfolio = { ...insertPortfolio, id, createdAt };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, portfolioUpdate: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) return undefined;
    
    const updatedPortfolio: Portfolio = { ...portfolio, ...portfolioUpdate };
    this.portfolios.set(id, updatedPortfolio);
    return updatedPortfolio;
  }

  async deletePortfolio(id: number): Promise<boolean> {
    // Delete associated investments first
    const investmentsToDelete = Array.from(this.investments.values())
      .filter(investment => investment.portfolioId === id);
    
    for (const investment of investmentsToDelete) {
      this.investments.delete(investment.id);
    }
    
    // Delete associated performance data
    const performancesToDelete = Array.from(this.performances.values())
      .filter(perf => perf.portfolioId === id);
    
    for (const perf of performancesToDelete) {
      this.performances.delete(perf.id);
    }
    
    return this.portfolios.delete(id);
  }

  // Investment methods
  async getInvestments(portfolioId: number): Promise<InvestmentWithPerformance[]> {
    const investments = Array.from(this.investments.values())
      .filter(investment => investment.portfolioId === portfolioId);
    
    return investments.map(investment => {
      const currentValue = Number(investment.shares) * Number(investment.currentPrice);
      const purchaseValue = Number(investment.shares) * Number(investment.purchasePrice);
      const totalReturn = currentValue - purchaseValue;
      const totalReturnPercent = (totalReturn / purchaseValue) * 100;
      
      // Simulate daily change (random between -2% and +2%)
      const dailyChangePercent = (Math.random() * 4) - 2;
      const dailyChange = (dailyChangePercent / 100) * currentValue;
      
      return {
        ...investment,
        value: currentValue,
        dailyChange,
        dailyChangePercent,
        totalReturn,
        totalReturnPercent,
      };
    });
  }

  async getInvestment(id: number): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = this.investmentCurrentId++;
    const purchaseDate = new Date();
    const investment: Investment = { ...insertInvestment, id, purchaseDate };
    this.investments.set(id, investment);
    return investment;
  }

  async updateInvestment(id: number, investmentUpdate: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const investment = this.investments.get(id);
    if (!investment) return undefined;
    
    const updatedInvestment: Investment = { ...investment, ...investmentUpdate };
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }

  async deleteInvestment(id: number): Promise<boolean> {
    return this.investments.delete(id);
  }

  // Performance methods
  async getPerformanceData(portfolioId: number): Promise<Performance[]> {
    return Array.from(this.performances.values())
      .filter(perf => perf.portfolioId === portfolioId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getPerformanceDataArray(): Performance[] {
    return Array.from(this.performances.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async addPerformanceData(insertPerformance: InsertPerformance): Promise<Performance> {
    const id = this.performanceCurrentId++;
    const date = new Date();
    const performance: Performance = { ...insertPerformance, id, date };
    this.performances.set(id, performance);
    return performance;
  }

  // Dashboard data
  async getPortfolioSummary(portfolioId: number): Promise<PortfolioSummary | undefined> {
    const portfolio = await this.getPortfolio(portfolioId);
    if (!portfolio) return undefined;
    
    // Get all investments for this portfolio
    const investments = await this.getInvestments(portfolioId);
    
    // Calculate total value
    const totalValue = investments.reduce((sum, inv) => sum + Number(inv.value), 0);
    
    // Get performance history
    const performanceHistory = await this.getPerformanceData(portfolioId);
    
    // Calculate daily change (from most recent performance data)
    const sortedPerformance = [...performanceHistory].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
    
    let dailyChange = 0;
    let dailyChangePercent = 0;
    
    if (sortedPerformance.length >= 2) {
      const latestValue = Number(sortedPerformance[0].totalValue);
      const previousValue = Number(sortedPerformance[1].totalValue);
      dailyChange = latestValue - previousValue;
      dailyChangePercent = (dailyChange / previousValue) * 100;
    }
    
    // Calculate YTD return
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const ytdStartPerformance = performanceHistory.find(p => 
      p.date.getTime() >= startOfYear.getTime()
    );
    
    let ytdReturn = 0;
    let ytdReturnValue = 0;
    
    if (ytdStartPerformance && sortedPerformance.length > 0) {
      const startValue = Number(ytdStartPerformance.totalValue);
      const currentValue = Number(sortedPerformance[0].totalValue);
      ytdReturnValue = currentValue - startValue;
      ytdReturn = (ytdReturnValue / startValue) * 100;
    }
    
    // Calculate asset allocation
    const assetAllocation = this.calculateAssetAllocation(investments);
    
    // Format performance data for charts
    const formattedPerformanceData = performanceHistory.map(p => ({
      date: this.formatDate(p.date),
      value: Number(p.totalValue)
    }));
    
    return {
      id: portfolio.id,
      name: portfolio.name,
      totalValue,
      dailyChange,
      dailyChangePercent,
      ytdReturn,
      ytdReturnValue,
      riskLevel: portfolio.riskLevel,
      performanceData: formattedPerformanceData,
      assetAllocation
    };
  }

  private calculateAssetAllocation(investments: InvestmentWithPerformance[]): { type: string; percentage: number; value: number }[] {
    const totalValue = investments.reduce((sum, inv) => sum + Number(inv.value), 0);
    
    // Group by investment type
    const groupedByType = investments.reduce((acc, inv) => {
      const type = inv.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += Number(inv.value);
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array with percentages
    return Object.entries(groupedByType).map(([type, value]) => ({
      type,
      value,
      percentage: (value / totalValue) * 100
    }));
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
}

export const storage = new MemStorage();
