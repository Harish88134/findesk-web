// server/src/models/Budget.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IBudget } from '../interfaces';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export interface IBudgetDocument extends Omit<IBudget, '_id'>, Document {}

const BudgetSchema = new Schema<IBudgetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category for the budget'],
      enum: EXPENSE_CATEGORIES,
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Please specify a monthly budget limit'],
      min: [1, 'Monthly limit must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

// One budget per category per user
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model<IBudgetDocument>('Budget', BudgetSchema);
