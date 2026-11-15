// server/src/services/analytics.service.ts
import { dbStore } from '../repositories/db.store';
import { IDashboardAnalytics } from '../interfaces';

export class AnalyticsService {
  async getDashboardAnalytics(userId: string): Promise<IDashboardAnalytics> {
    const incomes = await dbStore.getIncomes(userId);
    const expenses = await dbStore.getExpenses(userId);
    const budgets = await dbStore.getBudgets(userId);
    const goals = await dbStore.getGoals(userId);

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSavings = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
    const currentBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // Monthly trends (Last 6 calendar months)
    const monthsMap: Record<string, { income: number; expense: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      monthsMap[key] = { income: 0, expense: 0 };
    }

    incomes.forEach((inc) => {
      const d = new Date(inc.date);
      const key = d.toLocaleString('default', { month: 'short' });
      if (monthsMap[key]) {
        monthsMap[key].income += inc.amount;
      }
    });

    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      const key = d.toLocaleString('default', { month: 'short' });
      if (monthsMap[key]) {
        monthsMap[key].expense += exp.amount;
      }
    });

    const monthlyExpenseTrend = Object.keys(monthsMap).map((m) => ({
      month: m,
      amount: monthsMap[m].expense,
    }));

    const monthlyIncomeTrend = Object.keys(monthsMap).map((m) => ({
      month: m,
      amount: monthsMap[m].income,
    }));

    // Category Breakdown
    const catMap: Record<string, number> = {};
    expenses.forEach((exp) => {
      catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
    });

    const categoryBreakdown = Object.keys(catMap)
      .map((cat) => ({
        category: cat,
        amount: catMap[cat],
        percentage: totalExpense > 0 ? Math.round((catMap[cat] / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Current Month Budget Utilization
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = expenses.filter((e) => new Date(e.date) >= startOfMonth);

    const budgetUtilization = budgets.map((b) => {
      const usedAmount = monthExpenses
        .filter((e) => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);

      const remainingAmount = Math.max(0, b.monthlyLimit - usedAmount);
      const percentageUsed = b.monthlyLimit > 0 ? Math.round((usedAmount / b.monthlyLimit) * 100) : 0;

      return {
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        usedAmount,
        remainingAmount,
        percentageUsed,
      };
    });

    // Recent Transactions (merged and sorted)
    const incTx = incomes.map((i) => ({
      _id: i._id,
      type: 'income' as const,
      title: i.title,
      amount: i.amount,
      categoryOrSource: i.source,
      date: new Date(i.date).toISOString(),
      notes: i.notes,
    }));

    const expTx = expenses.map((e) => ({
      _id: e._id,
      type: 'expense' as const,
      title: e.title,
      amount: e.amount,
      categoryOrSource: e.category,
      date: new Date(e.date).toISOString(),
      notes: e.notes,
    }));

    const recentTransactions = [...incTx, ...expTx]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return {
      totalIncome,
      totalExpense,
      totalSavings,
      currentBalance,
      savingsRate,
      monthlyExpenseTrend,
      monthlyIncomeTrend,
      categoryBreakdown,
      budgetUtilization,
      recentTransactions,
    };
  }

  async getMonthlyBreakdown(userId: string, year = new Date().getFullYear()) {
    const incomes = await dbStore.getIncomes(userId);
    const expenses = await dbStore.getExpenses(userId);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((name, index) => {
      const incTotal = incomes
        .filter((i) => {
          const d = new Date(i.date);
          return d.getFullYear() === year && d.getMonth() === index;
        })
        .reduce((sum, i) => sum + i.amount, 0);

      const expTotal = expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === index;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month: name,
        income: incTotal,
        expense: expTotal,
        netCashFlow: incTotal - expTotal,
      };
    });
  }

  async getCategoryBreakdown(userId: string) {
    const expenses = await dbStore.getExpenses(userId);
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const catMap: Record<string, { count: number; amount: number }> = {};

    expenses.forEach((e) => {
      if (!catMap[e.category]) catMap[e.category] = { count: 0, amount: 0 };
      catMap[e.category].count += 1;
      catMap[e.category].amount += e.amount;
    });

    return Object.entries(catMap)
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        totalAmount: stats.amount,
        percentage: total > 0 ? Math.round((stats.amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }
}

export const analyticsService = new AnalyticsService();
