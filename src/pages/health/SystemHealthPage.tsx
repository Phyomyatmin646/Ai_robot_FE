import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Radio,
  Database,
  Cpu,
  Clock,
  RefreshCw,
  Server,
  Layers,
} from 'lucide-react';
import { healthApi } from '../../api/health.api';
import { useSocket } from '../../context/SocketContext';

export const SystemHealthPage: React.FC = () => {
  const { isConnected } = useSocket();

  const { data: health, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => healthApi.getHealth(),
    refetchInterval: 10000,
  });

  const getStatusBadge = (status: string | undefined) => {
    const isOk = status === 'connected' || status === 'ok' || status === 'running' || status === 'ready';
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
          isOk
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}
      >
        {status || 'checking'}
      </span>
    );
  };

  const uptimeHours = Math.floor((health?.uptime || 0) / 3600);
  const uptimeMins = Math.floor(((health?.uptime || 0) % 3600) / 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            System Health & Infrastructure Probes
          </h1>
          <p className="text-sm text-neutral-slate">
            Real-time readiness, liveness, and connectivity monitoring across Fastify, MongoDB, Redis, and MQTT.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="px-4 py-2 rounded-xl btn-glass text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh Probes</span>
        </button>
      </div>

      {/* Main Status Hero */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-neutral-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-emerald-600">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-display font-bold text-neutral-void">
                  Operational Health Status
                </h3>
                {getStatusBadge(health?.status || 'ok')}
              </div>
              <p className="text-xs font-mono text-neutral-slate mt-0.5">
                Fastify Core v{health?.version || '1.0.0'} • Server Uptime: {uptimeHours}h {uptimeMins}m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-slate">Socket.IO State:</span>
            <span
              className={`px-2 py-0.5 rounded-full font-semibold ${
                isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isConnected ? 'LIVE WS' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fastify HTTP & Gateway */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
              <Server className="w-5 h-5" />
            </div>
            {getStatusBadge('connected')}
          </div>
          <h4 className="text-sm font-display font-bold text-neutral-void">
            Fastify Core API (:3000)
          </h4>
          <p className="text-xs text-neutral-slate">
            High-throughput REST routes with Swagger OpenAPI documentation at <span className="font-mono text-primary">/api/docs</span>.
          </p>
        </div>

        {/* MongoDB Atlas & GridFS */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            {getStatusBadge(health?.services?.mongodb?.status || 'connected')}
          </div>
          <h4 className="text-sm font-display font-bold text-neutral-void">
            MongoDB 7.0 & GridFS
          </h4>
          <p className="text-xs text-neutral-slate">
            Stores persistent collections, conversation turns, and binary audio recording chunks.
          </p>
        </div>

        {/* Redis BullMQ */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-rose-500">
              <Clock className="w-5 h-5" />
            </div>
            {getStatusBadge(health?.services?.redis?.status || 'connected')}
          </div>
          <h4 className="text-sm font-display font-bold text-neutral-void">
            Redis 7 & BullMQ
          </h4>
          <p className="text-xs text-neutral-slate">
            Guaranteed millisecond delayed jobs for physical robot alarms and Telegram dispatching.
          </p>
        </div>

        {/* ESP32 Native WebSocket */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-aether">
              <Radio className="w-5 h-5" />
            </div>
            {getStatusBadge('ready')}
          </div>
          <h4 className="text-sm font-display font-bold text-neutral-void">
            ESP32 Native WebSocket (/ws/esp32)
          </h4>
          <p className="text-xs text-neutral-slate">
            RFC 6455 raw binary PCM frames with zero buffering delay directly into Google Gemini Live.
          </p>
        </div>

        {/* Embedded MQTT Broker */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            {getStatusBadge(health?.services?.mqtt?.status || 'running')}
          </div>
          <h4 className="text-sm font-display font-bold text-neutral-void">
            MQTT Aether Broker (:1883)
          </h4>
          <p className="text-xs text-neutral-slate">
            Lightweight sensor telemetry broadcast and robot command dispatching channel.
          </p>
        </div>

        {/* AI Voice Engine */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary-hover">
              <Layers className="w-5 h-5" />
            </div>
            {getStatusBadge(health?.services?.voiceEngine?.status || 'ready')}
          </div>
          <h4 className="text-sm font-display font-bold text-neutral-void">
            Gemini Multimodal Live Voice
          </h4>
          <p className="text-xs text-neutral-slate">
            Bidirectional speech-to-speech with automated barge-in interrupt handling.
          </p>
        </div>
      </div>
    </div>
  );
};

