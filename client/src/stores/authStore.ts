import { create } from 'zustand';
import type { IUser } from '@mindflow/shared';
import { authApi } from '../api/auth.api';
import { setTokens, clearTokens, loadTokens } from '../api/client';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      loadTokens();
      const stored = localStorage.getItem('accessToken');
      if (!stored) {
        set({ isLoading: false });
        return;
      }
      const { user } = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await authApi.login({ email, password });
      setTokens(res.accessToken, res.refreshToken);
      set({ user: res.user, isAuthenticated: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      set({ error: msg });
      throw err;
    }
  },

  register: async (email, username, password) => {
    set({ error: null });
    try {
      const res = await authApi.register({ email, username, password });
      setTokens(res.accessToken, res.refreshToken);
      set({ user: res.user, isAuthenticated: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      set({ error: msg });
      throw err;
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
