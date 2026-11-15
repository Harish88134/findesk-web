// server/src/controllers/expense.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { expenseService } from '../services/expense.service';
import { validateExpense } from '../validators/schemas';

export class ExpenseController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search, startDate, endDate } = req.query;
      const filter: any = {};
      if (category) filter.category = String(category);
      if (search) filter.search = String(search);
      if (startDate) filter.startDate = new Date(String(startDate));
      if (endDate) filter.endDate = new Date(String(endDate));

      const expenses = await expenseService.getAll(req.user!.userId, filter);
      res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await expenseService.getById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: expense });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Expense record not found' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateExpense(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const expense = await expenseService.create({
        ...req.body,
        userId: req.user!.userId,
      });

      res.status(201).json({ success: true, message: 'Expense logged successfully.', data: expense });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await expenseService.update(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: 'Expense record updated.', data: updated });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Update failed' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await expenseService.delete(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Expense record deleted.' });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message || 'Deletion failed' });
    }
  }
}

export const expenseController = new ExpenseController();
