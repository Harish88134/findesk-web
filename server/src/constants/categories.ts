// server/src/constants/categories.ts
export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Travel',
  'Shopping',
  'Medical',
  'Education',
  'Entertainment',
  'Bills',
  'Utilities',
  'Others',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Rental',
  'Dividends',
  'Bonus',
  'Gift',
  'Other',
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];
