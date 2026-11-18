import React from 'react';
import { Bell, CheckCircle2, Volume2, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const ReminderAlertModal: React.FC = () => {
  const { lastReminder, dismissReminderAlert } = useSocket();

  if (!lastReminder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-void/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl glass-floating border-2 border-primary/40 shadow-glow-violet animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={dismissReminderAlert}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-slate hover:text-neutral-void hover:bg-neutral-border/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Alarm Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-bounce">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-wider font-semibold">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Robot Alarm Triggered!</span>
            </div>
            <h3 className="text-xl font-display font-bold text-neutral-void">Scheduled Reminder</h3>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 rounded-2xl bg-canvas-light/80 border border-neutral-border mb-6">
          <p className="text-base font-semibold text-neutral-void">{lastReminder.title}</p>
          <p className="text-xs text-neutral-slate mt-1">
            Physical robot speaker chime and NeoPixel alert dispatched via WebSocket.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={dismissReminderAlert}
            className="w-full py-2.5 px-4 rounded-xl btn-primary flex items-center justify-center gap-2 font-medium text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Acknowledge & Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
};

