// src/api/auth.api.ts
import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/login',
      credentials
    );
  },

  register: async (data: { name: string; email: string; password: string }) => {
    return apiClient.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/register',
      data
    );
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    return apiClient.post('/auth/reset-password', data);
  },

  getProfile: async () => {
    return apiClient.get<User>('/users/profile');
  },

  updateProfile: async (data: { name?: string; avatar?: string; currency?: string }) => {
    return apiClient.put<User>('/users/profile', data);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiClient.put('/users/change-password', data);
  },

  deleteAccount: async () => {
    return apiClient.delete('/users/account');
  },
};
