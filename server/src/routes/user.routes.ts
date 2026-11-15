// server/src/routes/user.routes.ts
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', (req, res, next) => userController.updateProfile(req, res, next));
router.put('/change-password', (req, res, next) => userController.changePassword(req, res, next));
router.delete('/account', (req, res, next) => userController.deleteAccount(req, res, next));

export default router;
