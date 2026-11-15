// server/src/services/notification.service.ts
import { dbStore } from '../repositories/db.store';

export class NotificationService {
  async getUserNotifications(userId: string) {
    return await dbStore.getNotifications(userId);
  }

  async markAsRead(id: string, userId: string) {
    return await dbStore.markNotificationAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    await dbStore.markAllNotificationsRead(userId);
    return true;
  }
}

export const notificationService = new NotificationService();
