// src/api/admin.api.ts
import { apiClient } from './client';
import { User } from '../types';

export const adminApi = {
  getStats: async () => {
    return apiClient.get<{
      totalUsers: number;
      totalTransactions: number;
      totalVolume: number;
      activeBudgets: number;
      activeGoals: number;
    }>('/admin/stats');
  },

  getAllUsers: async () => {
    return apiClient.get<User[]>('/admin/users');
  },

  deleteUser: async (id: string) => {
    return apiClient.delete(`/admin/users/${id}`);
  },

  backupDatabase: async () => {
    return apiClient.get('/admin/backup');
  },

  restoreDatabase: async (data: any) => {
    return apiClient.post('/admin/restore', data);
  },

  resetDatabase: async () => {
    return apiClient.post('/admin/reset');
  },
};
