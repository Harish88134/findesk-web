// server/src/routes/admin.routes.ts
import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', (req, res, next) => adminController.getPlatformStats(req, res, next));
router.get('/users', (req, res, next) => adminController.getAllUsers(req, res, next));
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next));
router.get('/backup', (req, res, next) => adminController.backupDatabase(req, res, next));
router.post('/restore', (req, res, next) => adminController.restoreDatabase(req, res, next));
router.post('/reset', (req, res, next) => adminController.resetDatabase(req, res, next));

export default router;
