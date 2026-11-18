import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Music2,
  Mic,
  Clock,
  Sliders,
  Wifi,
  Bot,
  Volume2,
  Heart,
  Moon,
  LogOut,
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { AuraBeacon } from '../components/hud/AuraBeacon';
import { cn } from '../utils/cn';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, robotState } = useSocket();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/', label: 'Home / Robot Hub', icon: Sparkles, badge: 'Main' },
    { to: '/audio', label: 'Stories & Songs (ပုံပြင်/သီချင်း)', icon: Music2, highlight: true },
    { to: '/conversations', label: 'Kids Voice Chat (စကားပြော)', icon: Mic },
    { to: '/reminders', label: 'Routines & Alarms (သတိပေးသံ)', icon: Clock },
    { to: '/settings', label: 'Robot Sound & Voice (အသံ/မီး)', icon: Sliders },
    { to: '/devices', label: 'Robot Connection (စက်ချိတ်ဆက်မှု)', icon: Wifi },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-white/85 backdrop-blur-xl border-r border-neutral-border selection:bg-primary/20">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-neutral-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-glow-violet">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-tight tracking-tight text-neutral-void flex items-center gap-1.5">
                <span>Kids Robot Hub</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              </h1>
              <p className="text-[11px] text-neutral-slate font-medium">
                Parent Controller
              </p>
            </div>
          </div>
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-rose-400'
            )}
            title={isConnected ? 'Robot Connected' : 'Robot Offline'}
          />
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-glow-violet font-semibold'
                      : 'text-neutral-void/80 hover:text-neutral-void hover:bg-surface-low'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Friendly Robot State Card */}
      <div className="p-4 border-t border-neutral-border/60 bg-surface-low/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-void flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span>Robot State</span>
          </span>
          <AuraBeacon state={robotState} size="sm" showLabel={false} />
        </div>
        <div className="p-3 rounded-2xl bg-white border border-neutral-border flex items-center justify-between text-xs shadow-sm">
          <div className="flex flex-col">
            <span className="font-bold text-neutral-void capitalize">
              {robotState === 'speaking' ? '🗣️ Story Playing' : robotState === 'listening' ? '👂 Listening to Child' : '💤 Ready & Standing by'}
            </span>
            <span className="text-[10px] text-neutral-slate">
              {isConnected ? 'ESP32 Speaker Ready' : 'Turn on Robot'}
            </span>
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
              isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {isConnected ? 'READY' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* User Session & Logout Footer */}
      <div className="p-3 border-t border-neutral-border/60 bg-white/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-neutral-void truncate">
                {user?.name || 'Kid Parent'}
              </span>
              <span className="text-[10px] text-neutral-slate truncate">
                {user?.email || 'Active'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-neutral-border text-neutral-slate hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shrink-0"
            title="Sign out / အကောင့်မှထွက်ရန်"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-semibold text-rose-600">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
