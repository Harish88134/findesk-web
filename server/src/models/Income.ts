// server/src/models/Income.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IIncome } from '../interfaces';
import { INCOME_SOURCES } from '../constants/categories';

export interface IIncomeDocument extends Omit<IIncome, '_id'>, Document {}

const IncomeSchema = new Schema<IIncomeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an income title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an income amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    source: {
      type: String,
      required: [true, 'Please specify an income source'],
      enum: INCOME_SOURCES,
      default: 'Salary',
    },
    date: {
      type: Date,
      required: [true, 'Please specify the income date'],
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

// Compound indexes for fast user date range queries
IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, source: 1 });

export const Income = mongoose.models.Income || mongoose.model<IIncomeDocument>('Income', IncomeSchema);
