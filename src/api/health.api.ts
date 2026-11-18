import { apiClient } from './client';

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
    const res = await apiClient.get<HealthData>('/health', {
      baseURL: '', // root endpoint
    });
    return res.data;
  },
};

