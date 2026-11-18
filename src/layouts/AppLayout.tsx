import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ReminderAlertModal } from '../components/hud/ReminderAlertModal';
import { useSocket } from '../context/SocketContext';
import { Hand, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { lastTouch } = useSocket();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-void/30 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Real-Time Modals */}
      <ReminderAlertModal />

      {/* Physical Robot Capacitive Touch Sensor Trigger Toast */}
      {lastTouch && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-floating border border-primary/30 shadow-glow-violet animate-in slide-in-from-bottom duration-200">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Hand className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-void">Robot Head/Chassis Touched</p>
            <p className="text-[10px] font-mono text-neutral-slate">
              Capacitive sensor pad #{lastTouch.pad} {lastTouch.pressed ? 'pressed' : 'released'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

