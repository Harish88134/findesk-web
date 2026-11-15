// server/src/interfaces/index.ts
import { ExpenseCategory, IncomeSource } from '../constants/categories';
import { UserRole } from '../constants/roles';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  currency: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIncome {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  source: IncomeSource;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudget {
  _id: string;
  userId: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavingsGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'budget_alert' | 'goal_achieved' | 'monthly_summary' | 'system';
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshToken {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IDashboardAnalytics {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  currentBalance: number;
  savingsRate: number;
  monthlyExpenseTrend: { month: string; amount: number }[];
  monthlyIncomeTrend: { month: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  budgetUtilization: {
    category: string;
    monthlyLimit: number;
    usedAmount: number;
    remainingAmount: number;
    percentageUsed: number;
  }[];
  recentTransactions: Array<{
    _id: string;
    type: 'income' | 'expense';
    title: string;
    amount: number;
    categoryOrSource: string;
    date: string;
    notes?: string;
  }>;
}
