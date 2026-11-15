// server/src/models/SavingsGoal.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ISavingsGoal } from '../interfaces';

export interface ISavingsGoalDocument extends Omit<ISavingsGoal, '_id'>, Document {}

const SavingsGoalSchema = new Schema<ISavingsGoalDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a savings goal name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide a target amount'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      required: [true, 'Current amount is required'],
      min: [0, 'Current amount cannot be negative'],
      default: 0,
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
  },
  {
    timestamps: true,
  }
);

SavingsGoalSchema.index({ userId: 1, targetDate: 1 });

export const SavingsGoal =
  mongoose.models.SavingsGoal ||
  mongoose.model<ISavingsGoalDocument>('SavingsGoal', SavingsGoalSchema);
