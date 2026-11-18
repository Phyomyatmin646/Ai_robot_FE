import { apiClient } from './client';
import type { ApiResponse, RecurrenceType, Reminder } from '../types';

export interface CreateReminderParams {
  title: string;
  description?: string;
  scheduledAt: string;
  timezone?: string;
  recurrence?: RecurrenceType;
  notifyVia?: ('telegram' | 'websocket' | 'device' | 'email')[];
  notifyDeviceId?: string;
}

export const remindersApi = {
  getReminders: async () => {
    const res = await apiClient.get<ApiResponse<Reminder[]>>('/reminders');
    return res.data;
  },

  getReminder: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Reminder>>(`/reminders/${id}`);
    return res.data;
  },

  createReminder: async (params: CreateReminderParams) => {
    const res = await apiClient.post<ApiResponse<Reminder>>('/reminders', params);
    return res.data;
  },

  updateReminder: async (id: string, params: Partial<CreateReminderParams>) => {
    const res = await apiClient.patch<ApiResponse<Reminder>>(`/reminders/${id}`, params);
    return res.data;
  },

  deleteReminder: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/reminders/${id}`);
    return res.data;
  },
};

