import { apiClient } from './client';
import type { ApiResponse, Todo, TodoPriority, TodoStatus } from '../types';

export interface CreateTodoParams {
  title: string;
  description?: string;
  priority?: TodoPriority;
  category?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTodoParams {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: string;
  dueDate?: string;
  tags?: string[];
}

export interface TodoQueryParams {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const todoApi = {
  getTodoList: async (params?: TodoQueryParams) => {
    const res = await apiClient.get<ApiResponse<Todo[]>>('/todo', { params });
    return res.data;
  },

  getTodo: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Todo>>(`/todo/${id}`);
    return res.data;
  },

  createTodo: async (params: CreateTodoParams) => {
    const res = await apiClient.post<ApiResponse<Todo>>('/todo', params);
    return res.data;
  },

  updateTodo: async (id: string, params: UpdateTodoParams) => {
    const res = await apiClient.patch<ApiResponse<Todo>>(`/todo/${id}`, params);
    return res.data;
  },

  completeTodo: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Todo>>(`/todo/${id}/complete`);
    return res.data;
  },

  deleteTodo: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/todo/${id}`);
    return res.data;
  },
};

