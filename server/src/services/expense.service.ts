// server/src/services/expense.service.ts
import { dbStore } from '../repositories/db.store';
import { IExpense } from '../interfaces';

export class ExpenseService {
  async getAll(
    userId: string,
    filter?: { category?: string; search?: string; startDate?: Date; endDate?: Date }
  ) {
    return await dbStore.getExpenses(userId, filter);
  }

  async getById(id: string, userId: string) {
    const exp = await dbStore.getExpenseById(id, userId);
    if (!exp) {
      throw new Error('Expense record not found');
    }
    return exp;
  }

  async create(data: Partial<IExpense>) {
    const expense = await dbStore.createExpense(data);

    // Automatic budget monitoring check
    if (data.userId && data.category) {
      this.checkBudgetLimit(data.userId, data.category).catch(() => {});
    }

    return expense;
  }

  async update(id: string, userId: string, updates: Partial<IExpense>) {
    const updated = await dbStore.updateExpense(id, userId, updates);
    if (!updated) {
      throw new Error('Expense record not found or unauthorized');
    }

    if (updated.category) {
      this.checkBudgetLimit(userId, updated.category).catch(() => {});
    }

    return updated;
  }

  async delete(id: string, userId: string) {
    const deleted = await dbStore.deleteExpense(id, userId);
    if (!deleted) {
      throw new Error('Expense record not found or unauthorized');
    }
    return true;
  }

  private async checkBudgetLimit(userId: string, category: string) {
    const budgets = await dbStore.getBudgets(userId);
    const budget = budgets.find((b) => b.category === category);
    if (!budget) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await dbStore.getExpenses(userId, {
      category,
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const percentage = Math.round((totalSpent / budget.monthlyLimit) * 100);

    if (percentage >= 100) {
      await dbStore.createNotification({
        userId,
        title: `Budget Exceeded: ${category}`,
        message: `You have exceeded your $${budget.monthlyLimit} budget for ${category}. Current spent: $${totalSpent} (${percentage}%).`,
        type: 'budget_alert',
        metadata: { category, totalSpent, limit: budget.monthlyLimit },
      });
    } else if (percentage >= 80) {
      await dbStore.createNotification({
        userId,
        title: `Budget Warning: ${category}`,
        message: `You have used ${percentage}% of your $${budget.monthlyLimit} budget for ${category}. Current spent: $${totalSpent}.`,
        type: 'budget_alert',
        metadata: { category, totalSpent, limit: budget.monthlyLimit },
      });
    }
  }
}

export const expenseService = new ExpenseService();
