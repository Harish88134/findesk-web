// server/src/controllers/notification.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.userId);
      res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await notificationService.markAsRead(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
