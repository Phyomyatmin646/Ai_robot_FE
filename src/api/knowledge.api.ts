import { apiClient } from './client';
import type { ApiResponse, KnowledgeDocument, SearchResult } from '../types';

export interface CreateKnowledgeParams {
  title: string;
  content: string;
  sourceType?: string;
  sourceUrl?: string;
}

export const knowledgeApi = {
  getDocuments: async () => {
    const res = await apiClient.get<ApiResponse<KnowledgeDocument[]>>('/knowledge');
    return res.data;
  },

  createDocument: async (params: CreateKnowledgeParams) => {
    const res = await apiClient.post<ApiResponse<KnowledgeDocument>>('/knowledge', params);
    return res.data;
  },

  search: async (query: string, limit = 5) => {
    const res = await apiClient.get<ApiResponse<SearchResult[]>>('/knowledge/search', {
      params: { q: query, limit },
    });
    return res.data;
  },

  deleteDocument: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/knowledge/${id}`);
    return res.data;
  },
};

