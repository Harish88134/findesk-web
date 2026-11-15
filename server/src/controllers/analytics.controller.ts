// server/src/controllers/analytics.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { analyticsService } from '../services/analytics.service';
import { aiService } from '../services/ai.service';

export class AnalyticsController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDashboardAnalytics(req.user!.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMonthly(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      const data = await analyticsService.getMonthlyBreakdown(req.user!.userId, year);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getCategoryBreakdown(req.user!.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getAIInsights(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await aiService.generateFinancialInsights(req.user!.userId);
      res.status(200).json({ success: true, data: insights });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
