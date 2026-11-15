// server/src/controllers/admin.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { dbStore } from '../repositories/db.store';

export class AdminController {
  async getPlatformStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dbStore.getPlatformStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await dbStore.getAllUsers();
      res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (id === req.user!.userId) {
        res.status(400).json({ success: false, message: 'Admins cannot delete their own active session account.' });
        return;
      }
      const success = await dbStore.deleteUser(id);
      if (!success) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'User account and associated records purged successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async backupDatabase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dump = await dbStore.exportDatabase();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="financehub_database_backup.json"');
      res.status(200).json(dump);
    } catch (error) {
      next(error);
    }
  }

  async restoreDatabase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await dbStore.importDatabase(req.body);
      res.status(200).json({ success: true, message: 'Database state successfully restored.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Restore failed' });
    }
  }

  async resetDatabase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await dbStore.resetDatabase();
      res.status(200).json({ success: true, message: 'Database reset to initial demonstration state.' });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
