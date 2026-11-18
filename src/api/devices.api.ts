import { apiClient } from './client';
import type { ApiResponse, Device, DeviceConfig, DeviceHeartbeat } from '../types';

export interface RegisterDeviceParams {
  name: string;
  deviceType: string;
  macAddress: string;
  firmwareVersion: string;
  hardwareVersion: string;
}

export interface RegisterDeviceResponse {
  device: Device;
  apiKey: string;
}

export const devicesApi = {
  getDevices: async () => {
    const res = await apiClient.get<ApiResponse<Device[]>>('/devices');
    return res.data;
  },

  getDevice: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Device>>(`/devices/${id}`);
    return res.data;
  },

  registerDevice: async (params: RegisterDeviceParams) => {
    const res = await apiClient.post<ApiResponse<RegisterDeviceResponse>>('/devices/register', params);
    return res.data;
  },

  updateConfig: async (id: string, config: Partial<DeviceConfig>) => {
    const res = await apiClient.patch<ApiResponse<Device>>(`/devices/${id}/config`, config);
    return res.data;
  },

  deleteDevice: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/devices/${id}`);
    return res.data;
  },

  getTelemetry: async (id: string) => {
    const res = await apiClient.get<ApiResponse<DeviceHeartbeat>>(`/devices/${id}/telemetry`);
    return res.data;
  },
};

