// server/src/models/Expense.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IExpense } from '../interfaces';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export interface IExpenseDocument extends Omit<IExpense, '_id'>, Document {}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an expense amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Please specify an expense category'],
      enum: EXPENSE_CATEGORIES,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Please specify the expense date'],
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user category breakdown & time-series analysis
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });
ExpenseSchema.index({ userId: 1, category: 1, date: -1 });

export const Expense = mongoose.models.Expense || mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
