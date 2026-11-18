import { apiClient } from './client';
import type { ApiResponse, MCPTool, ToolExecutionLog } from '../types';

export interface ExecuteToolParams {
  toolName: string;
  arguments: Record<string, unknown>;
  conversationId?: string;
}

export const mcpApi = {
  getTools: async () => {
    const res = await apiClient.get<ApiResponse<MCPTool[]>>('/mcp/tools');
    return res.data;
  },

  executeTool: async (params: ExecuteToolParams) => {
    const res = await apiClient.post<ApiResponse<{ result: unknown; executionTimeMs: number }>>('/mcp/execute', params);
    return res.data;
  },

  getLogs: async () => {
    const res = await apiClient.get<ApiResponse<ToolExecutionLog[]>>('/mcp/logs');
    return res.data;
  },
};

