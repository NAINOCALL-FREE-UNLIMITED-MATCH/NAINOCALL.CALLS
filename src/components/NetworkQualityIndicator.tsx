import React, { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Gauge,
  Sliders,
} from 'lucide-react';
import { WebRTCStatsData } from '../types/diagnostics';

interface NetworkQualityIndicatorProps {
  stats: WebRTCStatsData;
  onOpenFullDiagnostics?: () => void;
  className?: string;
  variant?: 'compact' | 'full' | 'tile';
}

export const NetworkQualityIndicator: React.FC<NetworkQualityIndicatorProps> = ({
  stats,
  onOpenFullDiagnostics,
  className = '',
  variant = 'full',
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!showPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  // Determine active signal bar count (1 to 4)
  const getSignalStrength = () => {
    const isDisconnected =
      stats.connectionState === 'disconnected' || stats.iceConnectionState === 'disconnected';
    if (isDisconnected) return { bars: 0, label: 'Disconnected', color: 'rose' };

    if (stats.packetLossPercent > 5 || stats.rtt > 260) {
      return { bars: 1, label: 'Poor', color: 'rose' };
    }
    if (stats.packetLossPercent > 1.5 || stats.rtt > 130) {
      return { bars: 2, label: 'Fair', color: 'amber' };
    }
    if (stats.packetLossPercent > 0.5 || stats.rtt > 70) {
      return { bars: 3, label: 'Good', color: 'emerald' };
    }
    return { bars: 4, label: 'Excellent', color: 'emerald' };
  };

  const signal = getSignalStrength();

  // Helper colors
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-400',
          barActive: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        };
      case 'amber':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          dot: 'bg-amber-400',
          barActive: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        };
      case 'rose':
      default:
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/30',
          dot: 'bg-rose-400',
          barActive: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse',
        };
    }
  };

  const colors = getColorClasses(signal.color);

  // Render 4 signal bars
  const renderSignalBars = (heightClass = 'h-3') => {
    return (
      <div className={`flex items-end gap-0.5 ${heightClass} px-0.5 select-none`} aria-label={`${signal.bars} of 4 bars signal strength`}>
        {[
          { barIndex: 1, height: 'h-1.5' },
          { barIndex: 2, height: 'h-2' },
          { barIndex: 3, height: 'h-2.5' },
          { barIndex: 4, height: 'h-3.5' },
        ].map((item) => {
          const isActive = signal.bars >= item.barIndex;
          return (
            <span
              key={item.barIndex}
              className={`w-1 rounded-xs transition-all duration-300 ${item.height} ${
                isActive ? colors.barActive : 'bg-slate-700/60'
              }`}
            />
          );
        })}
      </div>
    );
  };

  if (variant === 'tile') {
    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono backdrop-blur-sm ${className}`}
        title={`Latency: ${stats.rtt}ms · Quality: ${signal.label}`}
      >
        {renderSignalBars('h-2.5')}
        <span className={`font-semibold ${colors.text}`}>{stats.rtt}ms</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-xs font-mono transition-all cursor-pointer ${className}`}
        title={`Network Latency: ${stats.rtt}ms (${signal.label})`}
      >
        {renderSignalBars()}
        <span className={`font-bold ${colors.text}`}>{stats.rtt}ms</span>
      </button>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Primary Pill Trigger */}
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none backdrop-blur-md shadow-xs bg-slate-900/90 hover:bg-slate-800/90 ${colors.border}`}
        title="Live Network Latency & Call Quality Indicator (Click for details)"
        aria-label="Network quality indicator"
      >
        {/* Signal Bars Visualizer */}
        {renderSignalBars()}

        {/* Latency RTT & Quality */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className={`font-bold tabular-nums ${colors.text}`}>
            {stats.rtt}ms
          </span>
          <span className="hidden xl:inline text-[11px] text-slate-400 font-sans">
            · {signal.label}
          </span>
        </div>

        {/* Warning Badge if packet loss exists */}
        {stats.packetLossPercent > 0.8 && (
          <span
            className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30"
            title={`${stats.packetLossPercent}% packet loss`}
          >
            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
            <span>{stats.packetLossPercent}% loss</span>
          </span>
        )}

        <ChevronDown
          className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
            showPopover ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Floating Network Health Breakdown Popover */}
      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                <Wifi className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Network & Stream Health
                </h4>
                <p className="text-[10px] text-slate-400">Real-time WebRTC diagnostics</p>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>
              {signal.label}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="py-3 grid grid-cols-2 gap-2 text-xs">
            {/* Ping / RTT */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                <span>Latency (RTT)</span>
                <Activity className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`font-mono text-base font-black tabular-nums ${colors.text}`}>
                  {stats.rtt}
                </span>
                <span className="text-[10px] text-slate-400">ms</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                {stats.rtt < 60 ? 'Optimal for real-time' : stats.rtt < 120 ? 'Normal for video' : 'Noticeable delay'}
              </p>
            </div>

            {/* Packet Loss */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                <span>Packet Loss</span>
                <AlertTriangle className={`w-3 h-3 ${stats.packetLossPercent > 1 ? 'text-rose-400' : 'text-slate-500'}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-mono text-base font-black tabular-nums ${
                    stats.packetLossPercent > 1 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {stats.packetLossPercent.toFixed(1)}%
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">
                {stats.packetLossPercent === 0 ? '0 lost frames' : `${stats.packetsLost} packets dropped`}
              </p>
            </div>

            {/* Jitter */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                <span>Jitter Buffer</span>
                <Radio className="w-3 h-3 text-slate-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-slate-200 tabular-nums">
                  {stats.jitter.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">ms</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">Packet arrival variance</p>
            </div>

            {/* Outbound Bitrate */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                <span>Bitrate Out</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-slate-200 tabular-nums">
                  {(stats.bitrateOut / 1000).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">Mbps</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">HD 1080p WebRTC stream</p>
            </div>
          </div>

          {/* Connection Protocol & Codec Details */}
          <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Transport Protocol:</span>
              <span className="font-mono text-slate-200 font-semibold">{stats.transportType} ({stats.iceCandidateType})</span>
            </div>
            <div className="flex justify-between">
              <span>Video / Audio Codec:</span>
              <span className="font-mono text-slate-200 font-semibold">{stats.videoCodec} / {stats.audioCodec}</span>
            </div>
            <div className="flex justify-between">
              <span>Send Resolution:</span>
              <span className="font-mono text-slate-200 font-semibold">
                {stats.sendResolution.width}x{stats.sendResolution.height} @ {stats.sendFps}fps
              </span>
            </div>
          </div>

          {/* Diagnostic Action Recommendation */}
          <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-slate-300 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              {signal.bars >= 3 ? (
                <span>Your network is performing optimally. Video and audio streams are fully synchronized.</span>
              ) : signal.bars === 2 ? (
                <span>Network latency is elevated. If audio stutters, try disabling virtual background effects or closing bandwidth-heavy apps.</span>
              ) : (
                <span>Unstable connection detected. Consider switching to audio-only or moving closer to your Wi-Fi router.</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            {onOpenFullDiagnostics && (
              <button
                type="button"
                onClick={() => {
                  setShowPopover(false);
                  onOpenFullDiagnostics();
                }}
                className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Open Full HUD</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
