// src/types/index.ts
export type UserRole = 'user' | 'admin';

export type ExpenseCategory =
  | 'Food'
  | 'Rent'
  | 'Travel'
  | 'Shopping'
  | 'Medical'
  | 'Education'
  | 'Entertainment'
  | 'Bills'
  | 'Utilities'
  | 'Others';

export type IncomeSource =
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Business'
  | 'Rental'
  | 'Dividends'
  | 'Bonus'
  | 'Gift'
  | 'Other';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  currency: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Income {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  source: IncomeSource;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  _id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  usedAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget?: boolean;
}

export interface SavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  percentage: number;
  isCompleted: boolean;
  remainingAmount: number;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'budget_alert' | 'goal_achieved' | 'monthly_summary' | 'system';
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface TransactionItem {
  _id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  categoryOrSource: string;
  date: string;
  notes?: string;
}

export interface DashboardAnalytics {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  currentBalance: number;
  savingsRate: number;
  monthlyExpenseTrend: { month: string; amount: number }[];
  monthlyIncomeTrend: { month: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  budgetUtilization: Budget[];
  recentTransactions: TransactionItem[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
