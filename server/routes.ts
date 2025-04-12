import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from './models/user';
import { authMiddleware } from './middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPortfolioSchema, 
  insertInvestmentSchema,
  insertPerformanceSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard data
  app.get("/api/portfolios/:id/summary", async (req, res) => {
    try {

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        username,
        email,
        password: hashedPassword
      });

      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      const summary = await storage.getPortfolioSummary(portfolioId);
      if (!summary) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      res.json(summary);
    } catch (error) {
      console.error("Error fetching portfolio summary:", error);
      res.status(500).json({ message: "Failed to fetch portfolio summary" });
    }
  });

  // Get all portfolios
  app.get("/api/portfolios", async (req, res) => {
    try {
      // Demo user id = 1
      const userId = 1;
      const portfolios = await storage.getPortfolios(userId);
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  // Get single portfolio
  app.get("/api/portfolios/:id", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Create portfolio
  app.post("/api/portfolios", async (req, res) => {
    try {
      // Validate request body
      const result = insertPortfolioSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid portfolio data", errors: result.error.errors });
      }

      const portfolio = await storage.createPortfolio(result.data);
      res.status(201).json(portfolio);
    } catch (error) {
      console.error("Error creating portfolio:", error);
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  // Update portfolio
  app.patch("/api/portfolios/:id", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      // Validate request body
      const result = insertPortfolioSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid portfolio data", errors: result.error.errors });
      }

      const portfolio = await storage.updatePortfolio(portfolioId, result.data);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      res.json(portfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });

  // Delete portfolio
  app.delete("/api/portfolios/:id", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      const success = await storage.deletePortfolio(portfolioId);
      if (!success) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      res.status(500).json({ message: "Failed to delete portfolio" });
    }
  });

  // Get all investments for a portfolio
  app.get("/api/portfolios/:id/investments", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      const investments = await storage.getInvestments(portfolioId);
      res.json(investments);
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Get single investment
  app.get("/api/investments/:id", async (req, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      if (isNaN(investmentId)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      const investment = await storage.getInvestment(investmentId);
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }

      res.json(investment);
    } catch (error) {
      console.error("Error fetching investment:", error);
      res.status(500).json({ message: "Failed to fetch investment" });
    }
  });

  // Create investment
  app.post("/api/investments", authMiddleware, async (req, res) => {
    try {
      const result = insertInvestmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid investment data", 
          errors: result.error.errors 
        });
      }

      const investment = await storage.createInvestment(result.data);
      res.status(201).json(investment);
    } catch (error) {
      console.error('Investment creation error:', error);
      res.status(500).json({ 
        message: 'Failed to create investment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update investment
  app.patch("/api/investments/:id", async (req, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      if (isNaN(investmentId)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      // Validate request body
      const result = insertInvestmentSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid investment data", errors: result.error.errors });
      }

      const investment = await storage.updateInvestment(investmentId, result.data);
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }

      res.json(investment);
    } catch (error) {
      console.error("Error updating investment:", error);
      res.status(500).json({ message: "Failed to update investment" });
    }
  });

  // Delete investment
  app.delete("/api/investments/:id", async (req, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      if (isNaN(investmentId)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      const success = await storage.deleteInvestment(investmentId);
      if (!success) {
        return res.status(404).json({ message: "Investment not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting investment:", error);
      res.status(500).json({ message: "Failed to delete investment" });
    }
  });

  // Get performance data for a portfolio
  app.get("/api/portfolios/:id/performance", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      const performanceData = await storage.getPerformanceData(portfolioId);
      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  // Add performance data point
  app.post("/api/portfolios/:id/performance", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      // Validate request body
      const requestData = { ...req.body, portfolioId };
      const result = insertPerformanceSchema.safeParse(requestData);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid performance data", errors: result.error.errors });
      }

      const performance = await storage.addPerformanceData(result.data);
      res.status(201).json(performance);
    } catch (error) {
      console.error("Error adding performance data:", error);
      res.status(500).json({ message: "Failed to add performance data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}