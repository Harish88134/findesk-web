// server/src/validators/schemas.ts
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '../constants/categories';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateRegister = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateIncome = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  }

  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!data.source || !INCOME_SOURCES.includes(data.source)) {
    errors.source = `Source must be one of: ${INCOME_SOURCES.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateExpense = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  }

  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!data.category || !EXPENSE_CATEGORIES.includes(data.category)) {
    errors.category = `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateBudget = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.category || !EXPENSE_CATEGORIES.includes(data.category)) {
    errors.category = `Valid category required: ${EXPENSE_CATEGORIES.join(', ')}`;
  }

  const monthlyLimit = Number(data.monthlyLimit);
  if (isNaN(monthlyLimit) || monthlyLimit <= 0) {
    errors.monthlyLimit = 'Monthly limit must be greater than zero';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateGoal = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'Goal name is required';
  }

  const targetAmount = Number(data.targetAmount);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    errors.targetAmount = 'Target amount must be a positive number';
  }

  if (data.currentAmount !== undefined) {
    const current = Number(data.currentAmount);
    if (isNaN(current) || current < 0) {
      errors.currentAmount = 'Current amount cannot be negative';
    }
  }

  if (!data.targetDate || isNaN(new Date(data.targetDate).getTime())) {
    errors.targetDate = 'A valid target date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
