// server/src/controllers/user.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { userService } from '../services/user.service';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.getProfile(req.user!.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, avatar, currency } = req.body;
      const updated = await userService.updateProfile(req.user!.userId, { name, avatar, currency });
      res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'Valid current password and new password (min 6 chars) required.' });
        return;
      }
      await userService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Password update failed' });
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteAccount(req.user!.userId);
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, message: 'Account and associated records deleted permanently.' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
