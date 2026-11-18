import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getStoredAccessToken } from '../api/client';
import type { DeviceHeartbeat, DeviceStatus, RobotState } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeDeviceId: string | null;
  setActiveDeviceId: (id: string | null) => void;
  robotState: RobotState;
  telemetry: DeviceHeartbeat | null;
  deviceStatuses: Record<string, DeviceStatus>;
  lastTouch: { deviceId: string; pad: number; pressed: boolean; timestamp: number } | null;
  lastReminder: { reminderId: string; title: string; timestamp: number } | null;
  activeTranscription: { sessionId: string; text: string; isFinal: boolean; speaker: 'user' | 'assistant' } | null;
  dismissReminderAlert: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [telemetry, setTelemetry] = useState<DeviceHeartbeat | null>(null);
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({});
  const [lastTouch, setLastTouch] = useState<{ deviceId: string; pad: number; pressed: boolean; timestamp: number } | null>(null);
  const [lastReminder, setLastReminder] = useState<{ reminderId: string; title: string; timestamp: number } | null>(null);
  const [activeTranscription, setActiveTranscription] = useState<{ sessionId: string; text: string; isFinal: boolean; speaker: 'user' | 'assistant' } | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();

    // If demo preview mode, provide simulated live telemetry
    if (token === 'demo-token') {
      setIsConnected(true);
      setTelemetry({
        deviceId: 'esp32_demo_1',
        timestamp: Date.now(),
        batteryLevel: 92,
        wifiRSSI: -54,
        freeHeap: 184320,
        uptimeSeconds: 7420,
      });

      // Simulate subtle state shift every few seconds for rich UI preview
      const interval = setInterval(() => {
        setTelemetry((prev) =>
          prev
            ? {
                ...prev,
                freeHeap: 184320 + Math.floor(Math.random() * 2048 - 1024),
                uptimeSeconds: prev.uptimeSeconds + 3,
              }
            : null
        );
      }, 3000);

      return () => clearInterval(interval);
    }

    if (!token) return;

    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;

    const socket = io(socketUrl, {
      path: '/socket.io/',
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (activeDeviceId) {
        socket.emit('device:subscribe', activeDeviceId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Robot state (idle, listening, thinking, speaking)
    socket.on('robot:state', (payload: { deviceId: string; state: RobotState; sessionId?: string }) => {
      if (!activeDeviceId || payload.deviceId === activeDeviceId) {
        setRobotState(payload.state);
      }
    });

    // Device telemetry (RSSI, battery, heap, uptime)
    socket.on('device:heartbeat', (payload: DeviceHeartbeat) => {
      if (!activeDeviceId || payload.deviceId === activeDeviceId) {
        setTelemetry(payload);
      }
    });

    // Device online/offline transitions
    socket.on('device:status', (payload: { deviceId: string; status: DeviceStatus }) => {
      setDeviceStatuses((prev) => ({
        ...prev,
        [payload.deviceId]: payload.status,
      }));
    });

    // Capacitive touch sensor
    socket.on('robot:touch', (payload: { deviceId: string; pad: number; pressed: boolean; timestamp: number }) => {
      setLastTouch(payload);
      // Auto clear touch after 3 seconds
      setTimeout(() => {
        setLastTouch((curr) => (curr?.timestamp === payload.timestamp ? null : curr));
      }, 3000);
    });

    // Speech transcription streaming
    socket.on('audio:transcription', (payload: { sessionId: string; text: string; isFinal: boolean; speaker: 'user' | 'assistant' }) => {
      setActiveTranscription(payload);
      if (payload.isFinal) {
        setTimeout(() => setActiveTranscription(null), 4000);
      }
    });

    // Reminder chime alert triggered
    socket.on('reminder:triggered', (payload: { reminderId: string; title: string }) => {
      setLastReminder({ ...payload, timestamp: Date.now() });

      // Play soft web chime using Web Audio API synthesis
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.3); // E6
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        console.warn('Audio chime playback blocked:', e);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // When active device changes, update subscriptions
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && isConnected && activeDeviceId) {
      socket.emit('device:subscribe', activeDeviceId);
      return () => {
        socket.emit('device:unsubscribe', activeDeviceId);
      };
    }
  }, [activeDeviceId, isConnected]);

  const dismissReminderAlert = () => {
    setLastReminder(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        activeDeviceId,
        setActiveDeviceId,
        robotState,
        telemetry,
        deviceStatuses,
        lastTouch,
        lastReminder,
        activeTranscription,
        dismissReminderAlert,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

