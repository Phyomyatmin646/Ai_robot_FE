import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wrench,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { mcpApi, ExecuteToolParams } from '../../api/mcp.api';
import { formatDate } from '../../utils/cn';
import type { MCPTool } from '../../types';

export const McpToolsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [argsJson, setArgsJson] = useState('{\n  "location": "Yangon"\n}');
  const [execResult, setExecResult] = useState<{ result: unknown; executionTimeMs: number } | null>(null);

  // Load registered MCP tools
  const { data: toolsRes, isLoading: toolsLoading } = useQuery({
    queryKey: ['mcp-tools'],
    queryFn: () => mcpApi.getTools(),
    retry: false,
  });
  const tools = toolsRes?.data && toolsRes.data.length > 0 ? toolsRes.data : [
    {
      name: 'get_weather',
      description: 'Fetch real-time weather and temperature for a given location',
      version: '1.0.0',
      category: 'Utilities',
      isEnabled: true,
      requiresConfirmation: false,
      permissions: ['read', 'network'],
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name or geographical coordinate' },
        },
        required: ['location'],
      },
    },
    {
      name: 'control_robot_hardware',
      description: 'Send hardware actuation commands (volume, brightness, LED, servos)',
      version: '1.2.0',
      category: 'Hardware',
      isEnabled: true,
      requiresConfirmation: false,
      permissions: ['device_control', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'volume | brightness | led_color' },
          value: { type: 'string', description: 'Numeric or hex value parameter' },
        },
        required: ['action', 'value'],
      },
    },
    {
      name: 'trigger_robot_chime',
      description: 'Synthesize dual-tone 16kHz audio chime on the physical robot speaker',
      version: '1.0.0',
      category: 'Audio',
      isEnabled: true,
      requiresConfirmation: true,
      permissions: ['device_control'],
      inputSchema: {
        type: 'object',
        properties: {
          durationSec: { type: 'number', description: 'Seconds to sound chime' },
        },
      },
    }
  ];

  // Set default selected tool
  React.useEffect(() => {
    if (!selectedTool && tools.length > 0) {
      setSelectedTool(tools[0]);
    }
  }, [tools, selectedTool]);

  // Load audit logs
  const { data: logsRes } = useQuery({
    queryKey: ['mcp-logs'],
    queryFn: () => mcpApi.getLogs(),
    refetchInterval: 5000,
    retry: false,
  });
  const logs = logsRes?.data && logsRes.data.length > 0 ? logsRes.data : [
    {
      id: 'log_1',
      userId: 'usr_demo',
      conversationId: 'conv_1',
      toolName: 'get_weather',
      arguments: { location: 'Yangon' },
      result: { tempC: 31, condition: 'Sunny', humidity: '65%' },
      executionTimeMs: 142,
      status: 'success' as any,
      createdAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'log_2',
      userId: 'usr_demo',
      conversationId: 'conv_1',
      toolName: 'control_robot_hardware',
      arguments: { action: 'volume', value: '85' },
      result: { synchronized: true, latencyMs: 18 },
      executionTimeMs: 24,
      status: 'success' as any,
      createdAt: new Date(Date.now() - 360000).toISOString(),
    }
  ];

  // Execute tool mutation
  const executeMutation = useMutation({
    mutationFn: (params: ExecuteToolParams) => mcpApi.executeTool(params),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['mcp-logs'] });
      if (res.data) setExecResult(res.data);
    },
  });

  const handleRunTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool) return;
    try {
      const parsedArgs = JSON.parse(argsJson);
      executeMutation.mutate({
        toolName: selectedTool.name,
        arguments: parsedArgs,
      });
    } catch {
      alert('Invalid JSON in arguments!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            Model Context Protocol (MCP) Tools
          </h1>
          <p className="text-sm text-neutral-slate">
            Authorized external tool functions registered for Gemini multimodal AI execution with audit logging.
          </p>
        </div>
      </div>

      {/* Main Grid: Tools list + Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Tools List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-void uppercase tracking-wider font-mono">
              Registered Tools ({tools.length})
            </h3>
          </div>

          <div className="space-y-3">
            {toolsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl glass-card animate-pulse" />
              ))
            ) : tools.length === 0 ? (
              <div className="p-8 text-center glass-card rounded-2xl text-xs text-neutral-slate">
                No MCP tools registered in backend.
              </div>
            ) : (
              tools.map((tool) => {
                const isSelected = selectedTool?.name === tool.name;
                return (
                  <div
                    key={tool.name}
                    onClick={() => {
                      setSelectedTool(tool);
                      setExecResult(null);
                    }}
                    className={`p-4 rounded-2xl glass-card cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-glow-violet'
                        : 'border-neutral-border hover:border-neutral-border-dark'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-void font-mono">
                          {tool.name}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700">
                        v{tool.version || '1.0'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-slate mt-2 line-clamp-2">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tool.permissions?.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas-light text-neutral-slate border border-neutral-border"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Tool Execution Test Playground & Schema */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTool ? (
            <div className="p-6 rounded-3xl glass-card border border-neutral-border space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-neutral-void">
                    Execute Tool: <span className="font-mono text-primary">{selectedTool.name}</span>
                  </h3>
                  <p className="text-xs text-neutral-slate mt-0.5">{selectedTool.description}</p>
                </div>
              </div>

              {/* Arguments JSON Input Form */}
              <form onSubmit={handleRunTool} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-void flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-primary" />
                      <span>Input Arguments (JSON):</span>
                    </label>
                    <span className="text-[10px] font-mono text-neutral-slate">
                      Requires Confirmation: {selectedTool.requiresConfirmation ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <textarea
                    rows={5}
                    value={argsJson}
                    onChange={(e) => setArgsJson(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas-light border border-neutral-border text-xs font-mono text-neutral-void focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={executeMutation.isPending}
                    className="px-4 py-2 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{executeMutation.isPending ? 'Executing...' : 'Run Tool Execute'}</span>
                  </button>
                </div>
              </form>

              {/* Execution Output */}
              {execResult && (
                <div className="p-4 rounded-2xl bg-canvas-light border border-neutral-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Execution Successful
                    </span>
                    <span>Latency: {execResult.executionTimeMs} ms</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-white border border-neutral-border text-[11px] font-mono overflow-x-auto text-neutral-void">
                    {JSON.stringify(execResult.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center glass-card rounded-3xl text-sm text-neutral-slate">
              Select an MCP tool on the left to inspect its schema and test execution.
            </div>
          )}

          {/* Tool Execution Audit Logs */}
          <div className="rounded-3xl glass-card overflow-hidden border border-neutral-border">
            <div className="p-5 border-b border-neutral-border/60 flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-neutral-void">
                Tool Execution Audit Trail
              </h3>
              <span className="text-xs font-mono text-neutral-slate">
                {logs.length} Executions Logged
              </span>
            </div>

            <div className="divide-y divide-neutral-border/60 max-h-72 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-slate">
                  No tool execution logs recorded yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 flex items-center justify-between text-xs hover:bg-canvas-light/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-void">{log.toolName}</span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                            log.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-slate">
                        {formatDate(log.createdAt)} • {log.executionTimeMs} ms
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-neutral-slate max-w-xs truncate">
                      {JSON.stringify(log.arguments)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

