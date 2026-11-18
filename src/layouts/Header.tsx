import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Menu,
  Bell,
  Cpu,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { devicesApi } from '../api/devices.api';
import { notificationsApi } from '../api/notifications.api';
import { AuraBeacon } from '../components/hud/AuraBeacon';
import { TelemetryPill } from '../components/hud/TelemetryPill';
import { cn } from '../utils/cn';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeDeviceId, setActiveDeviceId, robotState, telemetry, activeTranscription } = useSocket();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Load devices for quick selector
  const { data: devicesRes } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesApi.getDevices(),
  });
  const devices = devicesRes?.data || [];

  // Set default active device if none selected
  React.useEffect(() => {
    if (!activeDeviceId && devices.length > 0) {
      setActiveDeviceId(devices[0].id);
    }
  }, [devices, activeDeviceId, setActiveDeviceId]);

  // Load notifications count
  const { data: notifsRes } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
  });
  const unreadCount = notifsRes?.data?.filter((n) => n.status !== 'read').length || 0;

  return (
    <header className="sticky top-0 z-30 h-16 w-full px-4 sm:px-6 bg-white/75 backdrop-blur-xl border-b border-neutral-border flex items-center justify-between">
      {/* Left: Mobile Toggle & Device Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-neutral-void hover:bg-neutral-border/50"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Device Quick Selector Pill */}
        <div className="relative inline-flex items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas-light border border-neutral-border shadow-sm text-xs">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <select
              value={activeDeviceId || ''}
              onChange={(e) => setActiveDeviceId(e.target.value || null)}
              className="bg-transparent font-medium text-neutral-void focus:outline-none cursor-pointer pr-4"
            >
              {devices.length === 0 ? (
                <option value="">No Robot Connected</option>
              ) : (
                devices.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name} ({dev.status})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Live Audio Streaming Transcription Bubble */}
        {activeTranscription && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs text-primary animate-fade-in font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span className="truncate max-w-xs">{activeTranscription.text}</span>
          </div>
        )}
      </div>

      {/* Center / Right: Telemetry & Status HUD */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hardware Telemetry Pill */}
        <TelemetryPill telemetry={telemetry} className="hidden sm:flex" />

        {/* Aura Status Beacon */}
        <AuraBeacon state={robotState} size="sm" showLabel={true} className="hidden md:inline-flex" />

        {/* Notifications Icon with Badge */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-full text-neutral-slate hover:text-neutral-void hover:bg-neutral-border/40 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-semibold text-xs border border-primary/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-neutral-void leading-none">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-neutral-slate font-mono capitalize">
                {user?.role || 'User'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-border text-neutral-slate hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
            title="Sign out / အကောင့်မှထွက်ရန်"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline text-xs font-semibold text-rose-600">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

