// server/src/routes/analytics.routes.ts
import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', (req, res, next) => analyticsController.getDashboard(req, res, next));
router.get('/monthly', (req, res, next) => analyticsController.getMonthly(req, res, next));
router.get('/category', (req, res, next) => analyticsController.getCategory(req, res, next));
router.get('/ai-insights', (req, res, next) => analyticsController.getAIInsights(req, res, next));

export default router;
