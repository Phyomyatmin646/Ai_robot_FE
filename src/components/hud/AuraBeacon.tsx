import React from 'react';
import type { RobotState } from '../../types';
import { cn } from '../../utils/cn';

interface AuraBeaconProps {
  state: RobotState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const AuraBeacon: React.FC<AuraBeaconProps> = ({
  state,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const configs = {
    idle: {
      color: '#85899A',
      bgRing: 'rgba(133, 137, 154, 0.15)',
      label: 'Standby / Idle',
      badgeClass: 'bg-neutral-slate/10 text-neutral-slate border-neutral-slate/20',
      pulse: false,
    },
    listening: {
      color: '#53B7E8',
      bgRing: 'rgba(83, 183, 232, 0.25)',
      label: 'Listening...',
      badgeClass: 'bg-aether/10 text-aether border-aether/30 shadow-[0_0_12px_rgba(83,183,232,0.3)]',
      pulse: true,
    },
    thinking: {
      color: '#8B7CFF',
      bgRing: 'rgba(139, 124, 255, 0.25)',
      label: 'AI Thinking...',
      badgeClass: 'bg-primary-hover/10 text-primary-hover border-primary-hover/30 shadow-[0_0_12px_rgba(139,124,255,0.3)]',
      pulse: true,
    },
    speaking: {
      color: '#7562F6',
      bgRing: 'rgba(117, 98, 246, 0.3)',
      label: 'Robot Speaking',
      badgeClass: 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_16px_rgba(117,98,246,0.35)]',
      pulse: true,
    },
    error: {
      color: '#BA1A1A',
      bgRing: 'rgba(186, 26, 26, 0.2)',
      label: 'Connection Error',
      badgeClass: 'bg-red-50 text-red-600 border-red-200',
      pulse: false,
    },
  };

  const current = configs[state] || configs.idle;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const coreDotPixelSizes = {
    sm: 8,
    md: 12,
    lg: 20,
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
        {/* Outer Ring 2 (Diffuse Breathing Wave) */}
        {current.pulse && (
          <span
            className="absolute rounded-full animate-ripple opacity-60 pointer-events-none"
            style={{
              width: '180%',
              height: '180%',
              backgroundColor: current.bgRing,
            }}
          />
        )}

        {/* Outer Ring 1 (Concentric Aura) */}
        <span
          className={cn(
            'absolute rounded-full border transition-all duration-500',
            current.pulse && 'animate-pulse-subtle'
          )}
          style={{
            width: '130%',
            height: '130%',
            backgroundColor: current.bgRing,
            borderColor: current.color,
            opacity: 0.85,
          }}
        />

        {/* Center Nucleus Dot */}
        <span
          className="relative rounded-full shadow-sm transition-colors duration-300 z-10"
          style={{
            width: `${coreDotPixelSizes[size]}px`,
            height: `${coreDotPixelSizes[size]}px`,
            backgroundColor: current.color,
            boxShadow: `0 0 10px ${current.color}`,
          }}
        />
      </div>

      {showLabel && (
        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
            current.badgeClass
          )}
        >
          {current.label}
        </span>
      )}
    </div>
  );
};
