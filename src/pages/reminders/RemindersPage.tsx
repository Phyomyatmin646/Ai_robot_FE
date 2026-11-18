import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Plus,
  Trash2,
  Volume2,
  Send,
  Radio,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { remindersApi, CreateReminderParams } from '../../api/reminders.api';
import { RecurrenceType } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { formatDate } from '../../utils/cn';

export const RemindersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeDeviceId } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<CreateReminderParams>({
    title: '',
    description: '',
    scheduledAt: '',
    timezone: 'Asia/Yangon',
    recurrence: RecurrenceType.NONE,
    notifyVia: ['websocket', 'device', 'telegram'],
    notifyDeviceId: activeDeviceId || undefined,
  });

  const { data: remindersRes, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersApi.getReminders(),
  });
  const reminders = remindersRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (params: CreateReminderParams) =>
      remindersApi.createReminder({
        ...params,
        notifyDeviceId: activeDeviceId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setIsModalOpen(false);
      setForm({
        title: '',
        description: '',
        scheduledAt: '',
        timezone: 'Asia/Yangon',
        recurrence: RecurrenceType.NONE,
        notifyVia: ['websocket', 'device', 'telegram'],
        notifyDeviceId: activeDeviceId || undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remindersApi.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const toggleChannel = (channel: 'telegram' | 'websocket' | 'device' | 'email') => {
    const list = form.notifyVia || [];
    if (list.includes(channel)) {
      setForm({ ...form, notifyVia: list.filter((c) => c !== channel) });
    } else {
      setForm({ ...form, notifyVia: [...list, channel] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            Reminders & Physical Alarms
          </h1>
          <p className="text-sm text-neutral-slate">
            Precision scheduler backed by Redis BullMQ. Rings dual-tone chime and flashes NeoPixel on the physical robot.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Scheduled Alarm</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl glass-card animate-pulse" />
          ))
        ) : reminders.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl glass-card border border-neutral-border space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-void">No Active Reminders</h3>
            <p className="text-xs text-neutral-slate max-w-sm mx-auto">
              Schedule alarms with Asia/Yangon timezone to trigger audio chimes on your ESP32 companion.
            </p>
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-display font-bold text-neutral-void">
                    {rem.title}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                      rem.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-border/50 text-neutral-slate'
                    }`}
                  >
                    {rem.status}
                  </span>
                </div>

                {rem.description && (
                  <p className="text-xs text-neutral-slate">{rem.description}</p>
                )}

                <div className="pt-2 text-xs font-mono space-y-1 text-neutral-slate">
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(rem.scheduledAt)}</span>
                  </div>
                  <div className="text-[11px] text-neutral-slate">
                    Timezone: {rem.timezone || 'Asia/Yangon'} • Repeat: {rem.recurrence}
                  </div>
                </div>
              </div>

              {/* Channels & Delete */}
              <div className="pt-4 border-t border-neutral-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {rem.notifyVia?.includes('device') && (
                    <span
                      className="p-1.5 rounded-lg bg-surface-container text-primary"
                      title="Physical Robot Speaker Chime"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {rem.notifyVia?.includes('telegram') && (
                    <span
                      className="p-1.5 rounded-lg bg-surface-container text-cyan-600"
                      title="Telegram Bot Alert"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {rem.notifyVia?.includes('websocket') && (
                    <span
                      className="p-1.5 rounded-lg bg-surface-container text-emerald-600"
                      title="Browser Socket.IO Pop-up"
                    >
                      <Radio className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm('Cancel and delete this reminder?')) {
                      deleteMutation.mutate(rem.id);
                    }
                  }}
                  className="p-1.5 rounded-lg btn-glass text-neutral-slate hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-void/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-floating border border-neutral-border shadow-floating space-y-4">
            <h3 className="text-lg font-display font-bold text-neutral-void">
              Schedule Physical Robot Alarm
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(form);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Alarm Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                  placeholder="e.g. Daily Standup Sync"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Alarm Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-void mb-1">
                    Recurrence
                  </label>
                  <select
                    value={form.recurrence}
                    onChange={(e) =>
                      setForm({ ...form, recurrence: e.target.value as RecurrenceType })
                    }
                    className="w-full px-3 py-2 rounded-xl input-glass text-xs"
                  >
                    <option value={RecurrenceType.NONE}>Once (No repeat)</option>
                    <option value={RecurrenceType.DAILY}>Daily</option>
                    <option value={RecurrenceType.WEEKLY}>Weekly</option>
                    <option value={RecurrenceType.MONTHLY}>Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-void mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={form.timezone}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-canvas-light border border-neutral-border text-xs font-mono text-neutral-slate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-2">
                  Alert Channels
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'device', label: 'Robot Speaker & LED', icon: Volume2 },
                    { id: 'telegram', label: 'Telegram Bot', icon: Send },
                    { id: 'websocket', label: 'Browser Popup', icon: Radio },
                  ].map((ch) => {
                    const isChecked = form.notifyVia?.includes(ch.id as any);
                    const Icon = ch.icon;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                          isChecked
                            ? 'bg-primary/10 border-primary text-primary font-semibold'
                            : 'border-neutral-border text-neutral-slate hover:bg-neutral-border/30'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl btn-glass text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl btn-primary text-sm font-semibold"
                >
                  {createMutation.isPending ? 'Scheduling...' : 'Set Alarm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

