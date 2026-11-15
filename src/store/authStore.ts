// src/store/authStore.ts
import { useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  currency: string;
}

const STORAGE_KEY_USER = 'auth_user';
const STORAGE_KEY_TOKEN = 'access_token';

// Simple lightweight state store compatible with React hooks
let globalState: AuthState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEY_TOKEN),
  isLoading: true,
  currency: 'USD',
};

// Try restoring cached user
try {
  const cached = localStorage.getItem(STORAGE_KEY_USER);
  if (cached) {
    const parsed = JSON.parse(cached);
    globalState.user = parsed;
    globalState.currency = parsed.currency || 'USD';
  }
} catch (e) {}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const authActions = {
  setUser: (user: User | null, token?: string) => {
    globalState.user = user;
    if (user) {
      globalState.currency = user.currency || 'USD';
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }

    if (token !== undefined) {
      globalState.token = token;
      if (token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }
    notify();
  },

  setCurrency: (currency: string) => {
    globalState.currency = currency;
    if (globalState.user) {
      globalState.user.currency = currency;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(globalState.user));
    }
    notify();
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    authActions.setUser(null, '');
  },

  loginDemoUser: async () => {
    const res = await authApi.login({
      email: 'alex@finance.dev',
      password: 'Password123!',
    });
    if (res.success && res.data) {
      authActions.setUser(res.data.user, res.data.tokens.accessToken);
      return true;
    }
    return false;
  },

  loginDemoAdmin: async () => {
    const res = await authApi.login({
      email: 'admin@finance.dev',
      password: 'Password123!',
    });
    if (res.success && res.data) {
      authActions.setUser(res.data.user, res.data.tokens.accessToken);
      return true;
    }
    return false;
  },

  initAuth: async () => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) {
      // Auto-login demo user on first visit if completely fresh, so user sees the rich dashboard immediately!
      await authActions.loginDemoUser();
      globalState.isLoading = false;
      notify();
      return;
    }

    try {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        authActions.setUser(res.data);
      } else {
        authActions.setUser(null, '');
      }
    } catch (err) {
      authActions.setUser(null, '');
    } finally {
      globalState.isLoading = false;
      notify();
    }
  },
};

export const useAuth = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    user: globalState.user,
    token: globalState.token,
    currency: globalState.currency,
    isLoading: globalState.isLoading,
    isAuthenticated: !!globalState.user,
    isAdmin: globalState.user?.role === 'admin',
    ...authActions,
  };
};
