import { apiClient } from './client';
import type { ApiResponse, Conversation, Message } from '../types';

export interface CreateConversationParams {
  title?: string;
  deviceId?: string;
  language?: string;
}

export interface SendMessageParams {
  content: string;
  role?: string;
}

export const conversationsApi = {
  getConversations: async () => {
    const res = await apiClient.get<ApiResponse<Conversation[]>>('/conversations');
    return res.data;
  },

  getConversation: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return res.data;
  },

  createConversation: async (params: CreateConversationParams) => {
    const res = await apiClient.post<ApiResponse<Conversation>>('/conversations', params);
    return res.data;
  },

  getMessages: async (conversationId: string) => {
    const res = await apiClient.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`);
    return res.data;
  },

  sendMessage: async (conversationId: string, params: SendMessageParams) => {
    const res = await apiClient.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, params);
    return res.data;
  },

  deleteConversation: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/conversations/${id}`);
    return res.data;
  },
};

