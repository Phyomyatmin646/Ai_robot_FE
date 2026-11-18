import { apiClient } from './client';
import type { ApiResponse, DeviceSettings, UserSettings } from '../types';

export const settingsApi = {
  getUserSettings: async () => {
    const res = await apiClient.get<ApiResponse<UserSettings>>('/settings/user');
    return res.data;
  },

  updateUserSettings: async (settings: Partial<UserSettings>) => {
    const res = await apiClient.patch<ApiResponse<UserSettings>>('/settings/user', settings);
    return res.data;
  },

  getDeviceSettings: async (deviceId: string) => {
    const res = await apiClient.get<ApiResponse<DeviceSettings>>(`/settings/device/${deviceId}`);
    return res.data;
  },

  updateDeviceSettings: async (deviceId: string, settings: Partial<DeviceSettings>) => {
    const res = await apiClient.patch<ApiResponse<DeviceSettings>>(`/settings/device/${deviceId}`, settings);
    return res.data;
  },
};

