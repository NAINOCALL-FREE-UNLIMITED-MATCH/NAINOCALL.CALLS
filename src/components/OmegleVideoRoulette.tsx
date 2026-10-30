import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  SkipForward,
  Square,
  MessageSquare,
  Send,
  Sparkles,
  Tag,
  Shield,
  Smile,
  Clock,
  Radio,
  Crown,
} from 'lucide-react';
import { CallDurationTimer } from './CallDurationTimer';

interface OmegleVideoRouletteProps {
  userName: string;
  onExit: () => void;
  isVip?: boolean;
  onOpenSubscription?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'you' | 'stranger' | 'system';
  text: string;
  time: string;
}

export const OmegleVideoRoulette: React.FC<OmegleVideoRouletteProps> = ({
  userName,
  onExit,
  isVip = false,
  onOpenSubscription,
}) => {
  const [isSearching, setIsSearching] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerName, setPartnerName] = useState('Stranger');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [interests, setInterests] = useState<string[]>(['music', 'travel', 'dating']);
  const [newTagInput, setNewTagInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Initialize local camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera fallback in Omegle:', err);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Duration timer
  useEffect(() => {
    let interval: number;
    if (isConnected) {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Connect to stranger simulation or real peer
  useEffect(() => {
    let timeout: number;
    if (isSearching) {
      setIsConnected(false);
      setCallDuration(0);
      setChatMessages([
        {
          id: `sys_${Date.now()}`,
          sender: 'system',
          text: 'Looking for someone who shares your interests...',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Connect after 1.5 seconds
      timeout = window.setTimeout(() => {
        const strangers = [
          'Stranger (Riya from Mumbai)',
          'Stranger (Priya from Bandra)',
          'Stranger (Simran from Delhi)',
          'Stranger (Ananya from Juhu)',
          'Stranger (Kavya from Colaba)',
        ];
        const chosen = strangers[Math.floor(Math.random() * strangers.length)];
        setPartnerName(chosen);
        setIsSearching(false);
        setIsConnected(true);

        setChatMessages((prev) => [
          ...prev,
          {
            id: `sys_conn_${Date.now()}`,
            sender: 'system',
            text: `You're now chatting with ${chosen}. Say hi!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // Stranger says hello
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              sender: 'stranger',
              text: 'Hey! Nice to meet you! How is your day going? ✨',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 1200);
      }, 1600);
    }

    return () => clearTimeout(timeout);
  }, [isSearching]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleNextStranger = () => {
    setIsSearching(true);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `user_msg_${Date.now()}`,
        sender: 'you',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');

    // Stranger replies
    setTimeout(() => {
      const responses = [
        'Haha totally! Same here 🙌',
        'That sounds so cool! Are you into music too?',
        'I love finding fun people on here!',
        'Are you in Mumbai too? Such nice weather today!',
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: `stranger_reply_${Date.now()}`,
          sender: 'stranger',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const handleSendReaction = (emoji: string) => {
    const rx = {
      id: `rx_${Date.now()}`,
      emoji,
      x: 20 + Math.random() * 60,
    };
    setFloatingReactions((prev) => [...prev, rx]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== rx.id));
    }, 2800);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().replace(/^#/, '').toLowerCase();
    if (tag && !interests.includes(tag)) {
      setInterests((prev) => [...prev, tag]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setInterests((prev) => prev.filter((t) => t !== tag));
  };

  const toggleMic = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next));
    }
  };

  const toggleCam = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !next));
    }
  };

  return (
    <div className="h-screen w-screen bg-[#070913] text-slate-100 flex flex-col overflow-hidden pb-18 sm:pb-0">
      {/* Top Header */}
      <header className="h-14 px-4 sm:px-6 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-400 text-lg tracking-wider">OMEGLE</span>
            <span className="text-xs text-slate-500 font-medium">Video Roulette</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono tabular-nums">2,841 online now</span>
          </div>
        </div>

        {/* Top-Right Call Duration Timer & VIP Badge */}
        <div className="flex items-center gap-2">
          {isVip ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-400/30 rounded-lg text-xs font-bold">
              <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="hidden sm:inline">VIP Priority Pairing</span>
            </div>
          ) : (
            onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="Unlock Unlimited Matches & Zero Wait Time via UPI"
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">VIP Pass</span>
                <span className="text-[10px] text-amber-300 font-mono">₹49</span>
              </button>
            )
          )}
          {isConnected && <CallDurationTimer durationSeconds={callDuration} />}
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Back to Discover
          </button>
        </div>
      </header>

      {/* Main Omegle Split Body (Video Stage Left + Live Text Chat Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Video Stage (Stranger + You) */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3 p-3 sm:p-4 overflow-hidden relative">
          {/* Stranger Video Box */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                <p className="text-base font-semibold text-white">Searching for stranger...</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Matching with someone who shares your interest tags.
                </p>
              </div>
            ) : (
              <div className="w-full h-full relative">
                {/* Stranger Video Background using screenshot photo for authentic experience */}
                <div
                  className="w-full h-full bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: 'url(/assets/aistudio/tinder_bg.jpg_d80d7a32.jpeg)',
                    backgroundPosition: '14% 17%',
                    backgroundSize: '240%',
                  }}
                />

                {/* Floating Reactions on Stranger Feed */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
                  {floatingReactions.map((r) => (
                    <div
                      key={r.id}
                      className="absolute bottom-8 text-4xl animate-bounce"
                      style={{ left: `${r.x}%` }}
                    >
                      {r.emoji}
                    </div>
                  ))}
                </div>

                {/* Stranger Status Banner */}
                <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-semibold text-white backdrop-blur-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{partnerName}</span>
                </div>

                {/* Overlay Reactions Trigger Bar */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 p-1 rounded-full backdrop-blur-md">
                  {['👍', '❤️', '😂', '👏', '🎉', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendReaction(emoji)}
                      className="p-1 text-base hover:scale-130 transition-transform cursor-pointer leading-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Local User Video Box */}
          <div className="w-full sm:w-72 lg:w-80 h-48 sm:h-full relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`}
            />

            {isVideoOff && (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                <VideoOff className="w-8 h-8 text-slate-600" />
                <span className="text-xs font-medium">Camera Off</span>
              </div>
            )}

            {/* Label */}
            <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 backdrop-blur-md">
              <span>{userName} (You)</span>
            </div>

            {/* In-box controls */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
              <button
                onClick={toggleMic}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-950/80 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={toggleCam}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isVideoOff ? 'bg-red-500/20 text-red-400' : 'bg-slate-950/80 text-white'
                }`}
                title={isVideoOff ? 'Camera On' : 'Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Omegle Live Text Chat Column */}
        <div className="w-full lg:w-88 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-950/60 flex flex-col shrink-0 h-64 lg:h-full">
          {/* Interest Tags Filter Header */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold mb-2">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>Matching Interests</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-medium"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}

              <form onSubmit={handleAddTag} className="inline-flex">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="+tag"
                  className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:w-20 transition-all"
                />
              </form>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'you'
                    ? 'items-end'
                    : msg.sender === 'system'
                    ? 'items-center text-center'
                    : 'items-start'
                }`}
              >
                {msg.sender === 'system' ? (
                  <div className="px-3 py-1 rounded-md bg-slate-800/60 text-slate-400 text-[11px] font-medium">
                    {msg.text}
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-500 px-1 mb-0.5">
                      {msg.sender === 'you' ? 'You' : partnerName} · {msg.time}
                    </span>
                    <div
                      className={`px-3 py-1.5 rounded-xl max-w-[85%] break-words ${
                        msg.sender === 'you'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-2.5 border-t border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message to stranger..."
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Omegle Control Bar */}
      <div className="h-16 px-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Next Stranger Button (Signature Omegle Button) */}
          <button
            onClick={handleNextStranger}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
            <span>Next Stranger</span>
          </button>

          <button
            onClick={() => setIsSearching(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Stop/Pause"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Anonymous 1-on-1 End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};
