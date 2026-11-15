// server/src/routes/notification.routes.ts
import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => notificationController.getAll(req, res, next));
router.patch('/:id/read', (req, res, next) => notificationController.markAsRead(req, res, next));
router.post('/mark-all-read', (req, res, next) => notificationController.markAllRead(req, res, next));

export default router;
