// server/src/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Apply auth rate limiter to sensitive authentication paths
router.post('/register', rateLimiter(20, 15 * 60 * 1000), (req, res, next) => authController.register(req, res, next));
router.post('/login', rateLimiter(30, 15 * 60 * 1000), (req, res, next) => authController.login(req, res, next));
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', rateLimiter(10, 15 * 60 * 1000), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', rateLimiter(10, 15 * 60 * 1000), (req, res, next) => authController.resetPassword(req, res, next));

export default router;
