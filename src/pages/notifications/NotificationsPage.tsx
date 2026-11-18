import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  Clock,
  Cpu,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { notificationsApi } from '../../api/notifications.api';
import { NotificationType } from '../../types';
import { formatDate } from '../../utils/cn';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifsRes, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
  });
  const notifications = notifsRes?.data || [];

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.REMINDER:
      case NotificationType.TODO_DUE:
        return <Clock className="w-4 h-4 text-primary" />;
      case NotificationType.DEVICE_ONLINE:
        return <Cpu className="w-4 h-4 text-emerald-500" />;
      case NotificationType.DEVICE_OFFLINE:
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case NotificationType.AI_ALERT:
        return <Sparkles className="w-4 h-4 text-aether" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-slate" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            Notifications & System Alerts
          </h1>
          <p className="text-sm text-neutral-slate">
            Activity stream of reminder chimes, device connectivity, and AI alerts.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="px-4 py-2 rounded-xl btn-glass text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-primary" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List Card */}
      <div className="rounded-3xl glass-card overflow-hidden border border-neutral-border p-6 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-neutral-border/40 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-void">All Caught Up!</h3>
            <p className="text-xs text-neutral-slate max-w-sm mx-auto">
              No unread notifications at the moment.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isRead = notif.status === 'read';
            return (
              <div
                key={notif.id}
                onClick={() => !isRead && markReadMutation.mutate(notif.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  isRead
                    ? 'bg-canvas-light/60 border-neutral-border/60 opacity-80'
                    : 'bg-white border-primary/20 shadow-sm hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-neutral-void">{notif.title}</p>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-slate">{notif.message}</p>
                    <span className="text-[10px] font-mono text-neutral-slate block pt-1">
                      {formatDate(notif.createdAt)} • Via {notif.channel}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-border/40 text-neutral-slate">
                  {notif.type.replace('_', ' ')}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

