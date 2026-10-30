import React, { useState, useEffect } from 'react';
import {
  Video,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  Sparkles,
  ScreenShare,
  Lock,
  History,
  SlidersHorizontal,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

interface RecentMeeting {
  roomId: string;
  timestamp: number;
}

interface HomeLobbyProps {
  onStartMeeting: (roomId: string) => void;
  onOpenDiagnostics: () => void;
}

export const HomeLobby: React.FC<HomeLobbyProps> = ({
  onStartMeeting,
  onOpenDiagnostics,
}) => {
  const [roomInput, setRoomInput] = useState('');
  const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nainocall_recent_meetings') || localStorage.getItem('zyntricall_recent_meetings');
      if (stored) {
        setRecentMeetings(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  const handleCreateInstant = async () => {
    try {
      const res = await fetch('/api/create-room-code');
      const data = await res.json();
      const code = data.roomCode || `nai-${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 5)}`;
      saveRecentMeeting(code);
      onStartMeeting(code);
    } catch {
      const code = `nai-${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 5)}`;
      saveRecentMeeting(code);
      onStartMeeting(code);
    }
  };

  const handleJoinInput = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) return;
    saveRecentMeeting(clean);
    onStartMeeting(clean);
  };

  const saveRecentMeeting = (code: string) => {
    setRecentMeetings((prev) => {
      const filtered = prev.filter((m) => m.roomId !== code);
      const updated = [{ roomId: code, timestamp: Date.now() }, ...filtered].slice(0, 5);
      localStorage.setItem('nainocall_recent_meetings', JSON.stringify(updated));
      return updated;
    });
  };

  const copyRecentCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Action Bar */}
          <div className="lg:col-span-7 space-y-6">
            {/* Editorial Category Tag (Zero-Pill Discipline) */}
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span>Next-Gen Video Architecture</span>
              <span aria-hidden="true">·</span>
              <span>WebRTC Mesh & Low Latency</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
              Ultra-low latency real-time video meetings in your browser.
            </h1>

            <p className="text-base text-slate-400 max-w-xl leading-relaxed">
              NAINO CALL delivers peer-to-peer 1080p video, crystal-clear opus audio,
              virtual 3D studio environments, and local lossless recording without downloads or plugins.
            </p>

            {/* Action Group */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md">
              <button
                onClick={handleCreateInstant}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 whitespace-nowrap cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Start Instant Meeting</span>
              </button>

              <form onSubmit={handleJoinInput} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="Enter code or link"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!roomInput.trim()}
                  className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                  title="Join Meeting"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Capability Checklist (Unboxed with subtle indicators) */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>End-to-End DTLS-SRTP</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hardware Accelerated 1080p</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No Installation Required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 aspect-[4/3] group">
              <img
                src="/src/assets/images/hero_meeting_collab_1793126800194.jpg"
                alt="Ultra-HD Video Collaboration Session"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Floating Overlay Card inside Hero */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Live Real-Time WebRTC</p>
                    <p className="text-[11px] text-slate-400 font-mono tabular-nums">Sub-50ms peer latency</p>
                  </div>
                </div>

                <button
                  onClick={onOpenDiagnostics}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Test Audio/Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Meetings Strip (If user has meeting history) */}
      {recentMeetings.length > 0 && (
        <section className="px-6 lg:px-12 max-w-7xl mx-auto w-full mb-12">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <History className="w-3.5 h-3.5" />
              <span>Recent Meeting Rooms</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentMeetings.map((m) => (
                <div
                  key={m.roomId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <span className="font-mono tabular-nums text-xs font-semibold text-slate-200">
                      {m.roomId}
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {formatTimestamp(m.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyRecentCode(m.roomId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors cursor-pointer"
                      title="Copy room code"
                    >
                      {copiedCode === m.roomId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onStartMeeting(m.roomId)}
                      className="px-2.5 py-1 text-xs font-medium bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
                    >
                      Rejoin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Architecture Matrix */}
      <section id="features" className="px-6 lg:px-12 py-16 border-t border-slate-800/80 max-w-7xl mx-auto w-full">
        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            Engineering Specifications
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Architected for uncompromised communication
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              01. P2P Direct Mesh
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streams video and audio directly between client devices using WebRTC RTCPeerConnection with STUN ICE negotiation for the lowest possible latency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              02. Studio Environments
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transform messy rooms into modern architectural lofts, high-rise executive offices, or warm Scandinavian libraries with client-side visual backdrops.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <ScreenShare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              03. 60fps Screen Sharing
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Share monitors, app windows, or specific browser tabs seamlessly. Supports dynamic track replacement without renegotiating the peer connection.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              04. Local HD Recording
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lossless on-device recording using browser MediaRecorder API with VP9 video and Opus audio codecs, saving instantly to your computer with zero upload delay.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="px-6 lg:px-12 py-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Cryptographic Security</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Your calls never touch a central media server
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            All audio, video, and screen share frames are encrypted using standard Datagram Transport Layer Security (DTLS) and Secure Real-time Transport Protocol (SRTP). Only participants holding the peer keys can decrypt the stream.
          </p>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleCreateInstant}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Start Secure Video Call
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 px-6 lg:px-12 py-6 bg-slate-950 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">NAINO CALL</span>
          <span aria-hidden="true">·</span>
          <span>Real-time Video Calling Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onOpenDiagnostics} className="hover:text-slate-300 transition-colors cursor-pointer">
            Device Pre-Flight
          </button>
          <a href="#features" className="hover:text-slate-300 transition-colors">
            Architecture
          </a>
          <a href="#security" className="hover:text-slate-300 transition-colors">
            Security
          </a>
        </div>
      </footer>
    </div>
  );
};
