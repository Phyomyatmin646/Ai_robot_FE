import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Cpu,
  Volume2,
  Sun,
  Lightbulb,
  Radio,
  Hand,
  Check,
  Save,
  Bot,
  Sparkles,
} from 'lucide-react';
import { devicesApi } from '../../api/devices.api';
import { settingsApi } from '../../api/settings.api';
import { useSocket } from '../../context/SocketContext';
import { AuraBeacon } from '../../components/hud/AuraBeacon';
import { TelemetryPill } from '../../components/hud/TelemetryPill';
import type { DeviceSettings } from '../../types';

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { telemetry, robotState, lastTouch } = useSocket();

  // Load device info
  const { data: devRes } = useQuery({
    queryKey: ['device', id],
    queryFn: () => devicesApi.getDevice(id!),
    enabled: Boolean(id),
  });
  const device = devRes?.data;

  // Load device settings
  const { data: settingsRes, isLoading: settingsLoading } = useQuery({
    queryKey: ['device-settings', id],
    queryFn: () => settingsApi.getDeviceSettings(id!),
    enabled: Boolean(id),
  });

  // Local settings state
  const [volume, setVolume] = useState<number>(80);
  const [brightness, setBrightness] = useState<number>(75);
  const [ledEnabled, setLedEnabled] = useState<boolean>(true);
  const [voiceId, setVoiceId] = useState<string>('Puck');
  const [language, setLanguage] = useState<string>('my');
  const [responseMode, setResponseMode] = useState<'auto' | 'push_to_talk' | 'wake_word'>('auto');

  useEffect(() => {
    if (settingsRes?.data) {
      const s = settingsRes.data;
      if (s.sound?.masterVolume !== undefined) setVolume(s.sound.masterVolume);
      if (s.display?.brightness !== undefined) setBrightness(s.display.brightness);
      if (s.voice?.voiceId) setVoiceId(s.voice.voiceId);
      if (s.voice?.language) setLanguage(s.voice.language);
      if (s.voice?.responseMode) setResponseMode(s.voice.responseMode);
    }
  }, [settingsRes]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: Partial<DeviceSettings>) =>
      settingsApi.updateDeviceSettings(id!, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-settings', id] });
    },
  });

  const handleSave = () => {
    if (!id) return;
    updateMutation.mutate({
      sound: {
        masterVolume: volume,
        isMuted: volume === 0,
        outputVolume: volume,
        notificationVolume: volume,
        feedbackSoundsEnabled: true,
      },
      display: {
        brightness,
        isOn: brightness > 0,
        sleepTimeoutSeconds: 300,
        theme: 'dark',
      },
      voice: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-live',
        voiceId,
        language,
        speed: 1.0,
        volume,
        responseMode,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/devices"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-slate hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Device Hub</span>
        </Link>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-4 py-2 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2"
        >
          {updateMutation.isPending ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : updateMutation.isSuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{updateMutation.isPending ? 'Syncing...' : 'Sync to Robot'}</span>
        </button>
      </div>

      {/* Device Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-void">
                  {device?.name || 'ESP32 Voice Companion'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {device?.status || 'online'}
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-slate mt-1">
                MAC: {device?.macAddress} • Firmware v{device?.firmwareVersion} • Model: {device?.hardwareVersion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AuraBeacon state={robotState} size="md" showLabel={true} />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-border/60">
          <TelemetryPill telemetry={telemetry} />
        </div>
      </div>

      {/* Hardware Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Audio & Display Controls */}
        <div className="space-y-6">
          {/* Sound & Speaker Control */}
          <div className="p-6 rounded-3xl glass-card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-neutral-void">
                  I2S MAX98357A Sound Settings
                </h3>
                <p className="text-xs text-neutral-slate">
                  Hardware master gain and robot speaker volume
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-slate">Master Output Volume:</span>
                <span className="font-bold text-neutral-void">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-neutral-border rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Display & NeoPixel Brightness */}
          <div className="p-6 rounded-3xl glass-card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-neutral-void">
                  Display & Visual Aura
                </h3>
                <p className="text-xs text-neutral-slate">
                  ST7789 IPS LCD & WS2812B NeoPixel aura ring
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-slate">Brightness Level:</span>
                <span className="font-bold text-neutral-void">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-neutral-border rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-border/60">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-neutral-void">
                  WS2812B NeoPixel Status Breathing
                </span>
              </div>
              <input
                type="checkbox"
                checked={ledEnabled}
                onChange={(e) => setLedEnabled(e.target.checked)}
                className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Voice Persona & Touch Sensor Tester */}
        <div className="space-y-6">
          {/* Gemini Live Voice Persona */}
          <div className="p-6 rounded-3xl glass-card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-aether">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-neutral-void">
                  Gemini Voice Persona & Language
                </h3>
                <p className="text-xs text-neutral-slate">
                  Synthesized speech model and conversational trigger
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Synthesizer Voice
                </label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs"
                >
                  <option value="Puck">Puck (Natural & Energetic)</option>
                  <option value="Charon">Charon (Deep & Calming)</option>
                  <option value="Aoede">Aoede (Warm & Humanistic)</option>
                  <option value="Fenrir">Fenrir (Crisp & Technical)</option>
                  <option value="Kore">Kore (Gentle & Balanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Default Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs"
                >
                  <option value="my">Myanmar (မြန်မာဘာသာ)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-void mb-1">
                Voice Response Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'auto', label: 'Continuous Auto' },
                  { id: 'push_to_talk', label: 'Push to Talk' },
                  { id: 'wake_word', label: 'Wake Word' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setResponseMode(mode.id as typeof responseMode)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      responseMode === mode.id
                        ? 'bg-primary/10 border-primary text-primary font-semibold'
                        : 'border-neutral-border text-neutral-slate hover:bg-neutral-border/30'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Capacitive Touch Sensor Diagnostic */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <Hand className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-neutral-void">
                  Capacitive Touch Diagnostic
                </h3>
                <p className="text-xs text-neutral-slate">
                  Touch sensor test pads on physical robot body
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[1, 2, 3].map((padNum) => {
                const isTouched = lastTouch?.pad === padNum && lastTouch?.pressed;
                return (
                  <div
                    key={padNum}
                    className={`p-4 rounded-2xl border text-center transition-all duration-200 ${
                      isTouched
                        ? 'bg-primary text-white border-primary shadow-glow-violet scale-105'
                        : 'bg-canvas-light border-neutral-border text-neutral-void'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase text-neutral-slate">PAD #{padNum}</span>
                    <p className="text-sm font-bold mt-1">
                      {isTouched ? 'ACTIVE' : 'READY'}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] font-mono text-neutral-slate text-center">
              Touch the physical robot head or chassis to view real-time capacitive feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

