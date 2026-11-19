import { apiClient } from './client';
import type { ApiResponse, AudioMetadata } from '../types';

export interface GetAudioParams {
  page?: number;
  limit?: number;
  deviceId?: string;
  audioType?: string;
}

export const audioApi = {
  getAudioList: async (params?: GetAudioParams) => {
    const res = await apiClient.get<ApiResponse<AudioMetadata[]>>('/audio', { params });
    return res.data;
  },

  getAudio: async (id: string) => {
    const res = await apiClient.get<ApiResponse<AudioMetadata>>(`/audio/${id}`);
    return res.data;
  },

  getStreamUrl: (id: string) => {
    return `/api/v1/audio/${id}/stream`;
  },

  playOnDevice: async (id: string, deviceId: string) => {
    const res = await apiClient.post<ApiResponse<{ playing: boolean; sessionId: string }>>(
      `/audio/${id}/play-on-device`,
      { deviceId }
    );
    return res.data;
  },

  stopOnDevice: async (deviceId: string) => {
    const res = await apiClient.post<ApiResponse<{ stopped: boolean }>>('/audio/stop-on-device', {
      deviceId,
    });
    return res.data;
  },

  deleteAudio: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/audio/${id}`);
    return res.data;
  },

  uploadAudio: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse<AudioMetadata>>('/audio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

