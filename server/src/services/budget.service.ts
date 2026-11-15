// server/src/services/budget.service.ts
import { dbStore } from '../repositories/db.store';
import { IBudget } from '../interfaces';

export class BudgetService {
  async getAllWithUsage(userId: string) {
    const budgets = await dbStore.getBudgets(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthExpenses = await dbStore.getExpenses(userId, {
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

    return budgets.map((b) => {
      const usedAmount = monthExpenses
        .filter((e) => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);

      const remainingAmount = Math.max(0, b.monthlyLimit - usedAmount);
      const percentageUsed = b.monthlyLimit > 0 ? Math.round((usedAmount / b.monthlyLimit) * 100) : 0;

      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        usedAmount,
        remainingAmount,
        percentageUsed,
        isOverBudget: usedAmount > b.monthlyLimit,
      };
    });
  }

  async getById(id: string, userId: string) {
    const budget = await dbStore.getBudgetById(id, userId);
    if (!budget) {
      throw new Error('Budget not found');
    }
    return budget;
  }

  async create(data: Partial<IBudget>) {
    return await dbStore.createBudget(data);
  }

  async update(id: string, userId: string, updates: Partial<IBudget>) {
    const updated = await dbStore.updateBudget(id, userId, updates);
    if (!updated) {
      throw new Error('Budget not found or unauthorized');
    }
    return updated;
  }

  async delete(id: string, userId: string) {
    const deleted = await dbStore.deleteBudget(id, userId);
    if (!deleted) {
      throw new Error('Budget not found or unauthorized');
    }
    return true;
  }
}

export const budgetService = new BudgetService();
