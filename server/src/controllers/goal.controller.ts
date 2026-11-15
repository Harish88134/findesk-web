// server/src/controllers/goal.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { goalService } from '../services/goal.service';
import { validateGoal } from '../validators/schemas';

export class GoalController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goals = await goalService.getAll(req.user!.userId);
      res.status(200).json({ success: true, count: goals.length, data: goals });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateGoal(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const goal = await goalService.create({
        ...req.body,
        userId: req.user!.userId,
      });

      res.status(201).json({ success: true, message: 'Savings goal created.', data: goal });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await goalService.update(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: 'Savings goal updated.', data: updated });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Goal update failed' });
    }
  }

  async contribute(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const amount = Number(req.body.amount);
      if (isNaN(amount) || amount <= 0) {
        res.status(400).json({ success: false, message: 'Contribution amount must be greater than zero.' });
        return;
      }

      const updated = await goalService.contribute(req.params.id, req.user!.userId, amount);
      res.status(200).json({ success: true, message: 'Contribution added to savings goal.', data: updated });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Contribution failed' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await goalService.delete(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Savings goal deleted.' });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Goal delete failed' });
    }
  }
}

export const goalController = new GoalController();
