// server/src/controllers/income.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { incomeService } from '../services/income.service';
import { validateIncome } from '../validators/schemas';

export class IncomeController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { source, startDate, endDate } = req.query;
      const filter: any = {};
      if (source) filter.source = String(source);
      if (startDate) filter.startDate = new Date(String(startDate));
      if (endDate) filter.endDate = new Date(String(endDate));

      const incomes = await incomeService.getAll(req.user!.userId, filter);
      res.status(200).json({ success: true, count: incomes.length, data: incomes });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const income = await incomeService.getById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: income });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Income record not found' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateIncome(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const income = await incomeService.create({
        ...req.body,
        userId: req.user!.userId,
      });

      res.status(201).json({ success: true, message: 'Income recorded successfully.', data: income });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await incomeService.update(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: 'Income record updated.', data: updated });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Update failed' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await incomeService.delete(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Income record deleted.' });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Deletion failed' });
    }
  }
}

export const incomeController = new IncomeController();
