import React, { useEffect, useState } from 'react';
import type { RobotState } from '../../types';
import { cn } from '../../utils/cn';

interface WaveformVisualizerProps {
  state: RobotState;
  height?: number;
  barCount?: number;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  state,
  height = 48,
  barCount = 28,
  className,
}) => {
  const isActive = state === 'speaking' || state === 'listening';
  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(15));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(barCount).fill(12));
      return;
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => {
          if (state === 'speaking') {
            // High energy dynamic peaks
            return Math.floor(Math.random() * 75) + 20;
          } else if (state === 'listening') {
            // Gentle ambient waveform ripples
            return Math.floor(Math.random() * 45) + 15;
          }
          return 12;
        })
      );
    }, 90);

    return () => clearInterval(interval);
  }, [isActive, state, barCount]);

  const barColor = state === 'listening' ? '#53B7E8' : '#7562F6';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-canvas-light/60 border border-neutral-border overflow-hidden',
        className
      )}
      style={{ height: `${height}px` }}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#7562F6 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Dynamic Waveform Bars */}
      <div className="relative flex items-center justify-center gap-1 w-full h-full">
        {bars.map((barHeight, idx) => (
          <span
            key={idx}
            className="w-1 rounded-full transition-all duration-100 ease-out"
            style={{
              height: `${isActive ? barHeight : 10}%`,
              backgroundColor: barColor,
              opacity: isActive ? 0.9 : 0.25,
              boxShadow: isActive ? `0 0 8px ${barColor}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};

