import React from 'react';
import { Battery, BatteryCharging, Cpu, Signal, Clock } from 'lucide-react';
import type { DeviceHeartbeat } from '../../types';
import { cn } from '../../utils/cn';

interface TelemetryPillProps {
  telemetry: DeviceHeartbeat | null;
  className?: string;
}

export const TelemetryPill: React.FC<TelemetryPillProps> = ({ telemetry, className }) => {
  if (!telemetry) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-neutral-slate font-mono', className)}>
        <span className="w-2 h-2 rounded-full bg-neutral-slate/40 animate-pulse" />
        <span>Awaiting ESP32 Heartbeat...</span>
      </div>
    );
  }

  const { batteryLevel = 85, wifiRSSI = -55, freeHeap = 184320, uptimeSeconds = 3600 } = telemetry;

  // Format uptime
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const uptimeStr = `${hours}h ${minutes}m`;

  // Format Free Heap in KB
  const heapKb = Math.round(freeHeap / 1024);

  // RSSI quality
  const getWifiQuality = (rssi: number) => {
    if (rssi >= -60) return { label: `${rssi} dBm`, color: 'text-emerald-600' };
    if (rssi >= -75) return { label: `${rssi} dBm`, color: 'text-amber-500' };
    return { label: `${rssi} dBm`, color: 'text-rose-500' };
  };

  const wifiInfo = getWifiQuality(wifiRSSI);

  return (
    <div className={cn('flex flex-wrap items-center gap-2 font-mono text-xs', className)}>
      {/* Battery */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-neutral-border shadow-sm">
        {batteryLevel > 90 ? (
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Battery className={cn('w-3.5 h-3.5', batteryLevel < 20 ? 'text-rose-500' : 'text-emerald-500')} />
        )}
        <span className="font-medium text-neutral-void">{batteryLevel}%</span>
      </div>

      {/* Wi-Fi RSSI */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-neutral-border shadow-sm">
        <Signal className={cn('w-3.5 h-3.5', wifiInfo.color)} />
        <span className="text-neutral-void">{wifiInfo.label}</span>
      </div>

      {/* Free Heap RAM */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-neutral-border shadow-sm hidden sm:flex">
        <Cpu className="w-3.5 h-3.5 text-primary" />
        <span className="text-neutral-void">{heapKb} KB Heap</span>
      </div>

      {/* Uptime */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-neutral-border shadow-sm hidden md:flex">
        <Clock className="w-3.5 h-3.5 text-neutral-slate" />
        <span className="text-neutral-void">{uptimeStr}</span>
      </div>
    </div>
  );
};

