// ============================================
// AI Voice Assistant Robot Platform - Types
// Matches @ai-robot/shared-types from Backend
// ============================================

export type RobotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export enum DeviceType {
  ESP32_S3 = 'esp32-s3',
  SIMULATOR = 'simulator',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UPDATING = 'updating',
  ERROR = 'error',
}

export enum ConnectionType {
  WEBSOCKET = 'websocket',
  MQTT = 'mqtt',
  HTTP = 'http',
}

export interface DeviceConfig {
  wifiSSID?: string;
  audioSampleRate: number;
  audioChannels: number;
  audioBitDepth: number;
  audioChunkSize: number;
  audioCodec: string;
  volumeLevel: number;
  brightnessLevel: number;
  ledEnabled: boolean;
  sleepTimeout: number;
  heartbeatInterval: number;
}

export interface DeviceCapabilities {
  hasMicrophone: boolean;
  hasSpeaker: boolean;
  hasDisplay: boolean;
  hasTouchSensor: boolean;
  hasLED: boolean;
  hasVolumeButtons: boolean;
  maxSampleRate: number;
  supportedCodecs: string[];
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  deviceType: DeviceType;
  status: DeviceStatus;
  firmwareVersion: string;
  hardwareVersion: string;
  macAddress: string;
  ipAddress?: string;
  lastSeen?: string;
  isRegistered: boolean;
  config: DeviceConfig;
  capabilities: DeviceCapabilities;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceHeartbeat {
  deviceId: string;
  timestamp: number;
  freeHeap: number;
  uptimeSeconds: number;
  wifiRSSI: number;
  cpuTemp?: number;
  batteryLevel?: number;
}

export interface SensorData {
  deviceId: string;
  timestamp: number;
  temperature?: number;
  humidity?: number;
  lightLevel?: number;
  touchState?: boolean;
  volumeButtonState?: 'up' | 'down' | 'none';
  customData?: Record<string, unknown>;
}

// User & Auth
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  DEVICE = 'device',
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  language?: string;
  timezone?: string;
  telegramChatId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Settings
export interface UserSettings {
  userId: string;
  language: string;
  timezone: string;
  notifications: {
    telegramEnabled: boolean;
    telegramChatId?: string;
    emailEnabled: boolean;
    reminderNotifications: boolean;
    todoNotifications: boolean;
    deviceAlerts: boolean;
    dailySummary: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  ai: {
    fastModel: string;
    thinkingModel: string;
    voiceModel: string;
    personality: string;
    systemPrompt?: string;
    responseLanguage: string;
    ragEnabled: boolean;
    mcpEnabled: boolean;
    thinkingLevel: 'fast' | 'balanced' | 'deep';
    temperature: number;
    maxResponseTokens: number;
  };
}

export interface DeviceSettings {
  deviceId: string;
  userId: string;
  voice: {
    provider: string;
    model: string;
    voiceId: string;
    language: string;
    speed: number;
    volume: number;
    responseMode: 'auto' | 'push_to_talk' | 'wake_word';
    wakeWord?: string;
  };
  sound: {
    masterVolume: number;
    isMuted: boolean;
    outputVolume: number;
    notificationVolume: number;
    feedbackSoundsEnabled: boolean;
  };
  display: {
    brightness: number;
    isOn: boolean;
    sleepTimeoutSeconds: number;
    theme: 'light' | 'dark' | 'auto';
  };
  device: {
    name: string;
    wifiSSID?: string;
    firmwareAutoUpdate: boolean;
    heartbeatIntervalSeconds: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  updatedAt: string;
}

// Conversations & Messages
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool',
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  audioId?: string;
  toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>;
  toolResults?: Array<{ toolCallId: string; name: string; result: unknown; error?: string }>;
  tokens?: number;
  latencyMs?: number;
  model?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  deviceId?: string;
  title: string;
  status: 'active' | 'completed' | 'archived';
  language: string;
  messageCount: number;
  totalTokens: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Audio
export enum AudioFormat {
  PCM_16BIT = 'pcm_16bit',
  PCM_32BIT = 'pcm_32bit',
  WAV = 'wav',
  MP3 = 'mp3',
  OGG = 'ogg',
  OPUS = 'opus',
  WEBM = 'webm',
}

export enum AudioType {
  USER_INPUT = 'user_input',
  AI_RESPONSE = 'ai_response',
  UPLOADED = 'uploaded',
  SYSTEM = 'system',
}

export interface AudioMetadata {
  id: string;
  userId: string;
  deviceId?: string;
  conversationId?: string;
  fileName: string;
  mimeType: string;
  codec: string;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  duration: number;
  fileSize: number;
  audioType: AudioType;
  storageRef: string;
  storageType: string;
  createdAt: string;
  updatedAt: string;
}

// Todo
export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  category?: string;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  createdBy: 'user' | 'ai' | 'system';
  createdAt: string;
  updatedAt: string;
}

// Reminders
export enum ReminderStatus {
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  SNOOZED = 'snoozed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  timezone: string;
  status: ReminderStatus;
  recurrence: RecurrenceType;
  recurrenceRule?: string;
  notifyVia: ('telegram' | 'websocket' | 'device' | 'email')[];
  notifyDeviceId?: string;
  lastTriggeredAt?: string;
  nextTriggerAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Notifications
export enum NotificationType {
  REMINDER = 'reminder',
  TODO_DUE = 'todo_due',
  DEVICE_OFFLINE = 'device_offline',
  DEVICE_ONLINE = 'device_online',
  SYSTEM_ALERT = 'system_alert',
  AI_ALERT = 'ai_alert',
  DAILY_SUMMARY = 'daily_summary',
  CUSTOM = 'custom',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  data?: Record<string, unknown>;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

// Knowledge (RAG)
export interface KnowledgeDocument {
  id: string;
  userId: string;
  title: string;
  sourceType: 'text' | 'pdf' | 'docx' | 'txt' | 'url' | 'markdown';
  sourceUrl?: string;
  originalFileName?: string;
  content?: string;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  chunkCount: number;
  totalTokens: number;
  embeddingModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

// MCP Tools
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  outputSchema?: Record<string, unknown>;
  permissions: string[];
  requiresConfirmation: boolean;
  isEnabled: boolean;
  category: string;
  version: string;
}

export interface ToolExecutionLog {
  id: string;
  userId: string;
  conversationId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
  executionTimeMs: number;
  status: 'success' | 'error' | 'denied' | 'timeout';
  createdAt: string;
}

// Analytics
export interface AnalyticsStats {
  totalDevices: number;
  onlineDevices: number;
  activeConversations: number;
  totalAudioSeconds: number;
  pendingTasks: number;
  dueTodayTasks: number;
  avgAiLatencyMs: number;
  dailyVoiceInteractions: Array<{ date: string; count: number; duration: number }>;
  latencyBreakdown: {
    sttMs: number;
    llmMs: number;
    ttsMs: number;
    networkMs: number;
  };
}

// API standard response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

