import { pgTable, text, serial, integer, boolean, timestamp, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Portfolio model
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  riskLevel: text("risk_level").notNull(), // Low, Moderate, High
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
  name: true,
  userId: true,
  riskLevel: true,
});

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

// Investment Types
export const INVESTMENT_TYPES = ["Stock", "Bond", "Mutual Fund"] as const;
export type InvestmentType = typeof INVESTMENT_TYPES[number];

// Investment model
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // Stock, Bond, Mutual Fund
  shares: numeric("shares").notNull(),
  purchasePrice: numeric("purchase_price").notNull(),
  currentPrice: numeric("current_price").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

export const insertInvestmentSchema = createInsertSchema(investments).pick({
  portfolioId: true,
  name: true,
  symbol: true,
  type: true,
  shares: true,
  purchasePrice: true,
  currentPrice: true,
});

export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

// Performance data model
export const performanceData = pgTable("performance_data", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  date: timestamp("date").defaultNow(),
  totalValue: numeric("total_value").notNull(),
});

export const insertPerformanceSchema = createInsertSchema(performanceData).pick({
  portfolioId: true,
  totalValue: true,
});

export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type Performance = typeof performanceData.$inferSelect;

// Types for dashboard data
export type PortfolioSummary = {
  id: number;
  name: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  ytdReturn: number;
  ytdReturnValue: number;
  riskLevel: string;
  performanceData: { date: string; value: number }[];
  assetAllocation: { type: string; percentage: number; value: number }[];
};

export type InvestmentWithPerformance = Investment & {
  value: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
};
