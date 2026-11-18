import { apiClient } from './client';
import type { AnalyticsStats, ApiResponse } from '../types';

export const analyticsApi = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<AnalyticsStats>>('/analytics/stats');
    return res.data;
  },
};

export interface HealthData {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  uptime: number;
  timestamp: string;
  services: {
    mongodb: { status: string };
    redis: { status: string };
    voiceEngine: { status: string; mode?: string };
    mqtt: { status: string; port?: number };
  };
}

export const healthApi = {
  getHealth: async () => {
    // Note: health is on root /health (handled by vite proxy)
    const res = await apiClient.get<HealthData>('/health', {
      baseURL: '', // root
    });
    return res.data;
  },
};

