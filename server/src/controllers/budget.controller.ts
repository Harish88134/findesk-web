// server/src/controllers/budget.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { budgetService } from '../services/budget.service';
import { validateBudget } from '../validators/schemas';

export class BudgetController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgets = await budgetService.getAllWithUsage(req.user!.userId);
      res.status(200).json({ success: true, count: budgets.length, data: budgets });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateBudget(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const budget = await budgetService.create({
        ...req.body,
        userId: req.user!.userId,
      });

      res.status(201).json({ success: true, message: 'Budget limit established.', data: budget });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await budgetService.update(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: 'Budget limit updated.', data: updated });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Budget update failed' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await budgetService.delete(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Budget removed.' });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Budget delete failed' });
    }
  }
}

export const budgetController = new BudgetController();
