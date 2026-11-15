// server/src/config/db.ts
import mongoose from 'mongoose';
import { ENV } from './env';
import { logger } from '../utils/logger';
import { dbStore } from '../repositories/db.store';

export const connectDatabase = async (): Promise<void> => {
  // Always initialize store seeds first
  await dbStore.init();

  if (ENV.MONGODB_URI) {
    try {
      logger.info('Connecting to MongoDB Atlas...');
      await mongoose.connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('MongoDB Atlas connected successfully.');
    } catch (error) {
      logger.warn('Could not connect to MongoDB Atlas URI. Operating in resilient standalone persistence mode.', error);
    }
  } else {
    logger.info('Running in zero-config local database mode (persisting to server/data/database.json).');
  }
};
