import React, { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Gauge,
  Info,
  Maximize2,
  Minimize2,
  Radio,
  Server,
  ShieldCheck,
  Signal,
  Wifi,
  X,
} from 'lucide-react';
import { WebRTCStatsData } from '../types/diagnostics';

interface DiagnosticsOverlayProps {
  stats: WebRTCStatsData;
  onClose: () => void;
}

export const DiagnosticsOverlay: React.FC<DiagnosticsOverlayProps> = ({ stats, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'graphs' | 'network'>('overview');
  const [copied, setCopied] = useState(false);

  // Quality badge colors
  const qualityBadge = {
    Excellent: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    Good: {
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      dot: 'bg-cyan-400',
    },
    Fair: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
    },
    Poor: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
    },
  }[stats.qualityScore];

  const handleCopyReport = () => {
    const report = {
      timestamp: new Date(stats.timestamp).toISOString(),
      qualityScore: stats.qualityScore,
      latencyRttMs: stats.rtt,
      jitterMs: stats.jitter,
      packetLossPercent: stats.packetLossPercent,
      packetsLostTotal: stats.packetsLost,
      packetsReceivedTotal: stats.packetsReceived,
      packetsSentTotal: stats.packetsSent,
      bitrateOutKbps: stats.bitrateOut,
      bitrateInKbps: stats.bitrateIn,
      sendResolution: `${stats.sendResolution.width}x${stats.sendResolution.height} @ ${stats.sendFps}fps`,
      recvResolution: `${stats.recvResolution.width}x${stats.recvResolution.height} @ ${stats.recvFps}fps`,
      transport: stats.transportType,
      iceCandidateType: stats.iceCandidateType,
      videoCodec: stats.videoCodec,
      audioCodec: stats.audioCodec,
      peerCount: stats.peerCount,
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format bitrate nicely: kbps or Mbps
  const formatBitrate = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(2)} Mbps`;
    }
    return `${kbps} kbps`;
  };

  // Sparkline generator for SVG
  const renderSparkline = (
    values: number[],
    color: string,
    minVal?: number,
    maxVal?: number,
    height = 36,
    width = 240
  ) => {
    if (!values || values.length < 2) {
      return (
        <div className="h-9 flex items-center justify-center text-[10px] text-slate-500">
          Gathering telemetry...
        </div>
      );
    }
    const min = minVal !== undefined ? minVal : Math.min(...values);
    const max = maxVal !== undefined ? maxVal : Math.max(...values, min + 1);
    const range = max - min || 1;

    const points = values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg
        className="w-full h-9 overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  if (isMinimized) {
    return (
      <div className="fixed top-16 left-4 z-40 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${qualityBadge.dot} animate-pulse`} />
            <span className="font-semibold text-slate-200">RTT: {stats.rtt}ms</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-indigo-400">↑ {formatBitrate(stats.bitrateOut)}</span>
          <span className="text-emerald-400">↓ {formatBitrate(stats.bitrateIn)}</span>
          <span className="text-slate-600">|</span>
          <span
            className={
              stats.packetLossPercent > 1
                ? 'text-rose-400 font-bold'
                : stats.packetLossPercent > 0
                ? 'text-amber-400'
                : 'text-slate-300'
            }
          >
            Loss: {stats.packetLossPercent}%
          </span>
          <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title="Expand Diagnostics"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="WebRTC Connection Diagnostics"
      className="fixed top-16 left-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-slate-950/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>WebRTC Diagnostics</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                LIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Bitrates, packet loss & latency metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyReport}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Copy Diagnostics Report as JSON"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Minimize to HUD Bar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            title="Close Diagnostics"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900/80 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${qualityBadge.dot} animate-pulse`} />
            <span className="text-xs font-semibold text-slate-200">Connection Quality</span>
          </div>
          <span
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${qualityBadge.bg} ${qualityBadge.text} ${qualityBadge.border}`}
          >
            {stats.qualityScore}
          </span>
        </div>

        {/* 3 Core Highlight Badges */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          {/* Latency (RTT) */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Latency RTT</div>
            <div className="text-base font-bold font-mono text-slate-100 flex items-center justify-center gap-0.5">
              <span>{stats.rtt}</span>
              <span className="text-[10px] text-slate-400 font-normal">ms</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">jitter: {stats.jitter}ms</div>
          </div>

          {/* Packet Loss */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Packet Loss</div>
            <div
              className={`text-base font-bold font-mono flex items-center justify-center gap-0.5 ${
                stats.packetLossPercent > 2
                  ? 'text-rose-400'
                  : stats.packetLossPercent > 0.5
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              <span>{stats.packetLossPercent}</span>
              <span className="text-[10px] font-normal">%</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              lost: {stats.packetsLost}
            </div>
          </div>

          {/* Outbound Bitrate */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Uplink</div>
            <div className="text-sm font-bold font-mono text-indigo-400 flex items-center justify-center gap-0.5">
              <span>{formatBitrate(stats.bitrateOut)}</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              ↓ {formatBitrate(stats.bitrateIn)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 bg-slate-900/40 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer border-b-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setActiveTab('graphs')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer border-b-2 ${
            activeTab === 'graphs'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Graphs
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer border-b-2 ${
            activeTab === 'network'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ICE & Codecs
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-3.5 max-h-[380px] overflow-y-auto text-xs">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Bitrates Section */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-slate-300 font-medium mb-2">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase tracking-wider">
                  <Signal className="w-3.5 h-3.5 text-indigo-400" />
                  Bandwidth & Bitrates
                </span>
                <span className="text-[10px] font-mono text-slate-500">1s Sample Window</span>
              </div>

              <div className="space-y-2">
                {/* Outbound */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                      Outbound (Video + Audio)
                    </span>
                    <span className="font-mono font-bold text-indigo-300">{formatBitrate(stats.bitrateOut)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (stats.bitrateOut / 3500) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Inbound */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                      Inbound (Downlink)
                    </span>
                    <span className="font-mono font-bold text-emerald-300">{formatBitrate(stats.bitrateIn)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (stats.bitrateIn / 3500) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Resolution & Framerate */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                Video Feed Quality
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">Send Stream</div>
                  <div className="text-xs font-semibold text-slate-200">
                    {stats.sendResolution.width}x{stats.sendResolution.height}
                  </div>
                  <div className="text-[10px] text-slate-400">{stats.sendFps} FPS</div>
                </div>

                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">Receive Stream</div>
                  <div className="text-xs font-semibold text-slate-200">
                    {stats.recvResolution.width > 0
                      ? `${stats.recvResolution.width}x${stats.recvResolution.height}`
                      : 'Standby'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {stats.recvFps > 0 ? `${stats.recvFps} FPS` : '0 FPS'}
                  </div>
                </div>
              </div>
            </div>

            {/* Packets Counter Details */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div>
                <span>Sent: </span>
                <span className="text-slate-200 font-semibold">{stats.packetsSent.toLocaleString()} pkts</span>
              </div>
              <div>
                <span>Recv: </span>
                <span className="text-slate-200 font-semibold">{stats.packetsReceived.toLocaleString()} pkts</span>
              </div>
              <div>
                <span>Loss: </span>
                <span
                  className={
                    stats.packetsLost > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'
                  }
                >
                  {stats.packetsLost}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'graphs' && (
          <div className="space-y-3">
            {/* RTT Latency Sparkline */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-300">Latency (RTT History)</span>
                <span className="text-xs font-mono font-bold text-amber-400">{stats.rtt} ms</span>
              </div>
              <div className="h-10 w-full bg-slate-950/80 rounded-lg p-1 border border-slate-800/60">
                {renderSparkline(
                  stats.history.map((h) => h.rtt),
                  '#f59e0b',
                  0,
                  Math.max(60, ...stats.history.map((h) => h.rtt))
                )}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>-20s</span>
                <span>Current: {stats.rtt}ms</span>
                <span>Now</span>
              </div>
            </div>

            {/* Bitrate Sparkline */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-300">Throughput Bitrate</span>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-indigo-400">↑ {formatBitrate(stats.bitrateOut)}</span>
                  <span className="text-emerald-400">↓ {formatBitrate(stats.bitrateIn)}</span>
                </div>
              </div>
              <div className="h-10 w-full bg-slate-950/80 rounded-lg p-1 border border-slate-800/60">
                {renderSparkline(
                  stats.history.map((h) => h.bitrateOut),
                  '#818cf8',
                  0,
                  Math.max(3000, ...stats.history.map((h) => h.bitrateOut))
                )}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span className="text-indigo-400/80">■ Uplink bitrate</span>
                <span className="text-slate-500">Target: ~2.0 Mbps</span>
              </div>
            </div>

            {/* Packet Loss Sparkline */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-300">Packet Loss Rate</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    stats.packetLossPercent > 0.5 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {stats.packetLossPercent}%
                </span>
              </div>
              <div className="h-10 w-full bg-slate-950/80 rounded-lg p-1 border border-slate-800/60">
                {renderSparkline(
                  stats.history.map((h) => h.packetLoss),
                  '#f43f5e',
                  0,
                  Math.max(5, ...stats.history.map((h) => h.packetLoss))
                )}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>0.0% threshold (Healthy)</span>
                <span>Buffer Jitter: {stats.jitter}ms</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-2.5">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-indigo-400" /> Transport Protocol
                </span>
                <span className="font-semibold text-slate-200">{stats.transportType}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" /> ICE Candidate Pair
                </span>
                <span className="font-semibold text-slate-200">{stats.iceCandidateType}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> DTLS / SRTP Security
                </span>
                <span className="text-emerald-400 font-semibold">AES_128_GCM (Active)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" /> Video Codec
                </span>
                <span className="font-semibold text-indigo-300">{stats.videoCodec}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" /> Audio Codec
                </span>
                <span className="font-semibold text-emerald-300">{stats.audioCodec}</span>
              </div>
            </div>

            <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Standard WebRTC stats sampled directly from <code className="text-white font-mono">RTCPeerConnection.getStats()</code>. High efficiency adaptive rate control enabled.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Peers connected: {stats.peerCount}</span>
        </span>
        <button
          onClick={handleCopyReport}
          className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          {copied ? '✓ Copied JSON' : 'Export JSON'}
        </button>
      </div>
    </aside>
  );
};
