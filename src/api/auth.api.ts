import { apiClient } from './client';
import type { ApiResponse, AuthTokens, AuthUser } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  language?: string;
  timezone?: string;
}

export interface LoginResponseData {
  user: AuthUser;
  tokens: AuthTokens;
}

export const authApi = {
  login: async (params: LoginParams) => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', params);
    return res.data;
  },

  register: async (params: RegisterParams) => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/register', params);
    return res.data;
  },

  refresh: async (refreshToken: string) => {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    return res.data;
  },

  logout: async (refreshToken: string) => {
    const res = await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/logout', { refreshToken });
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<AuthUser>>('/users/profile');
    return res.data;
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    const res = await apiClient.patch<ApiResponse<AuthUser>>('/users/profile', data);
    return res.data;
  },

  linkTelegram: async (telegramChatId: string) => {
    const res = await apiClient.post<ApiResponse<{ linked: boolean }>>('/users/telegram/link', {
      chatId: telegramChatId,
      telegramChatId,
    });
    return res.data;
  },

  unlinkTelegram: async () => {
    const res = await apiClient.post<ApiResponse<{ unlinked: boolean }>>('/users/telegram/unlink');
    return res.data;
  },
};

