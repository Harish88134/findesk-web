// server/src/app.ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import incomeRoutes from './routes/income.routes';
import expenseRoutes from './routes/expense.routes';
import budgetRoutes from './routes/budget.routes';
import goalRoutes from './routes/goal.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import transactionRoutes from './routes/transaction.routes';
import adminRoutes from './routes/admin.routes';

export const createApp = (): express.Application => {
  const app = express();

  // Basic security and parsing middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cookie parsing middleware
  app.use((req, res, next) => {
    const rawCookies = req.headers.cookie;
    const cookies: Record<string, string> = {};
    if (rawCookies) {
      rawCookies.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        if (parts.length >= 2) {
          cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
        }
      });
    }
    (req as any).cookies = cookies;
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'Personal Finance Management Dashboard API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Route Mounts
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/income', incomeRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/admin', adminRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
