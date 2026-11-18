import { apiClient } from './client';
import type { ApiResponse, Notification } from '../types';

export const notificationsApi = {
  getNotifications: async () => {
    const res = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.post<ApiResponse<{ count: number }>>('/notifications/read-all');
    return res.data;
  },
};

