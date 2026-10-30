import React, { useState, useEffect, useRef } from 'react';
import { Clock, Shield, Sparkles, ChevronDown, CheckCircle2, Zap } from 'lucide-react';

interface CallDurationTimerProps {
  durationSeconds: number;
  startTime?: number;
  isVip?: boolean;
  className?: string;
  variant?: 'header' | 'dock' | 'badge';
}

export const CallDurationTimer: React.FC<CallDurationTimerProps> = ({
  durationSeconds,
  startTime = Date.now(),
  isVip = false,
  className = '',
  variant = 'header',
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!showPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const formatDetailedText = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const formattedStartTime = new Date(startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Color transition based on session duration:
  // < 30m: emerald green
  // 30m - 60m: sky blue
  // > 60m: amber / warm gold
  const getDurationColor = () => {
    if (durationSeconds > 3600) return 'text-amber-400 border-amber-500/30';
    if (durationSeconds > 1800) return 'text-sky-300 border-sky-500/30';
    return 'text-emerald-400 border-emerald-500/30';
  };

  if (variant === 'dock') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 ${className}`}
        title={`Session Duration: ${formatDetailedText(durationSeconds)}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold tabular-nums tracking-tight">{formatTime(durationSeconds)}</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Primary Interactive Timer Trigger */}
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className={`flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border rounded-xl shadow-xs backdrop-blur-md cursor-pointer transition-all select-none group ${getDurationColor()}`}
        title="Real-time call duration (Click to view session details)"
        aria-label="Real-time call duration tracker"
      >
        {/* Live animated status beacon */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />

        {/* Tabular numerals formatted timer */}
        <div className="flex items-center gap-1">
          <span className="font-mono tabular-nums text-xs font-bold tracking-tight text-white">
            {formatTime(durationSeconds)}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              showPopover ? 'rotate-180 text-white' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Session Length & Metrics Popover */}
      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-72 z-50 bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-slate-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Call Session Length
              </h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="py-3 space-y-2.5 text-xs">
            {/* Real-time Elapsed */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Elapsed Time:</span>
              <span className="font-mono text-sm font-black text-emerald-400 tabular-nums">
                {formatDetailedText(durationSeconds)}
              </span>
            </div>

            {/* Started At */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Session Started:</span>
              <span className="font-mono text-slate-200">{formattedStartTime}</span>
            </div>

            {/* Connection Quality */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Stream Status:</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ultra-HD 1080p
              </span>
            </div>

            {/* Plan Tier Status */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Session Limit:</span>
              {isVip ? (
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Unlimited VIP Call
                </span>
              ) : (
                <span className="text-slate-300 font-medium">Standard Active Call</span>
              )}
            </div>
          </div>

          {/* Quick Close Button */}
          <button
            type="button"
            onClick={() => setShowPopover(false)}
            className="w-full mt-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
};
