// src/api/finance.api.ts
import { apiClient } from './client';
import {
  Income,
  Expense,
  Budget,
  SavingsGoal,
  DashboardAnalytics,
  NotificationItem,
  TransactionItem,
  PaginationMeta,
} from '../types';

export interface AIInsightData {
  summary: string;
  healthScore: number;
  keyObservations: string[];
  actionableRecommendations: string[];
  projectedSavings: string;
  generatedBy: 'gemini-ai' | 'intelligent-engine';
}

export const financeApi = {
  // --- Analytics ---
  getDashboardAnalytics: async () => {
    return apiClient.get<DashboardAnalytics>('/analytics/dashboard');
  },

  getMonthlyAnalytics: async (year?: number) => {
    return apiClient.get<Array<{ month: string; income: number; expense: number; netCashFlow: number }>>(
      '/analytics/monthly',
      { year }
    );
  },

  getCategoryAnalytics: async () => {
    return apiClient.get<Array<{ category: string; count: number; totalAmount: number; percentage: number }>>(
      '/analytics/category'
    );
  },

  getAIInsights: async () => {
    return apiClient.get<AIInsightData>('/analytics/ai-insights');
  },

  // --- Incomes ---
  getIncomes: async (params?: { source?: string; startDate?: string; endDate?: string }) => {
    return apiClient.get<Income[]>('/income', params);
  },

  createIncome: async (data: Partial<Income>) => {
    return apiClient.post<Income>('/income', data);
  },

  updateIncome: async (id: string, data: Partial<Income>) => {
    return apiClient.put<Income>(`/income/${id}`, data);
  },

  deleteIncome: async (id: string) => {
    return apiClient.delete(`/income/${id}`);
  },

  // --- Expenses ---
  getExpenses: async (params?: { category?: string; search?: string; startDate?: string; endDate?: string }) => {
    return apiClient.get<Expense[]>('/expenses', params);
  },

  createExpense: async (data: Partial<Expense>) => {
    return apiClient.post<Expense>('/expenses', data);
  },

  updateExpense: async (id: string, data: Partial<Expense>) => {
    return apiClient.put<Expense>(`/expenses/${id}`, data);
  },

  deleteExpense: async (id: string) => {
    return apiClient.delete(`/expenses/${id}`);
  },

  // --- Budgets ---
  getBudgets: async () => {
    return apiClient.get<Budget[]>('/budgets');
  },

  createBudget: async (data: Partial<Budget>) => {
    return apiClient.post<Budget>('/budgets', data);
  },

  updateBudget: async (id: string, data: Partial<Budget>) => {
    return apiClient.put<Budget>(`/budgets/${id}`, data);
  },

  deleteBudget: async (id: string) => {
    return apiClient.delete(`/budgets/${id}`);
  },

  // --- Savings Goals ---
  getGoals: async () => {
    return apiClient.get<SavingsGoal[]>('/goals');
  },

  createGoal: async (data: Partial<SavingsGoal>) => {
    return apiClient.post<SavingsGoal>('/goals', data);
  },

  updateGoal: async (id: string, data: Partial<SavingsGoal>) => {
    return apiClient.put<SavingsGoal>(`/goals/${id}`, data);
  },

  contributeToGoal: async (id: string, amount: number) => {
    return apiClient.post<SavingsGoal>(`/goals/${id}/contribute`, { amount });
  },

  deleteGoal: async (id: string) => {
    return apiClient.delete(`/goals/${id}`);
  },

  // --- Unified Transactions ---
  getTransactions: async (params?: {
    type?: string;
    categoryOrSource?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    return apiClient.get<TransactionItem[]>('/transactions', params);
  },

  importCsv: async (csvData: string) => {
    return apiClient.post<{ count: number }>('/transactions/import/csv', { csvData });
  },

  // --- Notifications ---
  getNotifications: async () => {
    return apiClient.get<NotificationItem[]>('/notifications');
  },

  markNotificationRead: async (id: string) => {
    return apiClient.patch<NotificationItem>(`/notifications/${id}/read`);
  },

  markAllNotificationsRead: async () => {
    return apiClient.post('/notifications/mark-all-read');
  },
};
