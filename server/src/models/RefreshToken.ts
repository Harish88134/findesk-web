// server/src/models/RefreshToken.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IRefreshToken } from '../interfaces';

export interface IRefreshTokenDocument extends Omit<IRefreshToken, '_id'>, Document {}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto-deletes expired tokens
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema);
