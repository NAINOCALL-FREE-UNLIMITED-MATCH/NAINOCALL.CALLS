import React, { useState } from 'react';
import { Video, MessageCircle, Heart, Search, ArrowLeft, Send, Crown, Sparkles, Lock } from 'lucide-react';
import { DatingProfile, INITIAL_PROFILES } from '../data/profiles';
import { ProfileCardImage } from './ProfileCardImage';

interface MatchesViewProps {
  likedIds: string[];
  onStartVideoCall: (profile: DatingProfile) => void;
  activeMode?: 'matches' | 'messages';
  isVip?: boolean;
  chatsRemainingToday?: number;
  canMakeVideoCall?: () => boolean;
  canSendChatMessage?: () => boolean;
  onRecordChatMessage?: () => void;
  onOpenSubscription?: (reason?: 'limit_reached' | 'chat_limit') => void;
}

interface ThreadMessage {
  id: string;
  sender: 'you' | 'them';
  text: string;
  time: string;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  likedIds,
  onStartVideoCall,
  activeMode = 'matches',
  isVip = false,
  chatsRemainingToday = 5,
  canMakeVideoCall,
  canSendChatMessage,
  onRecordChatMessage,
  onOpenSubscription,
}) => {
  const matchedProfiles = INITIAL_PROFILES.filter((p) => likedIds.includes(p.id));
  const [selectedMatch, setSelectedMatch] = useState<DatingProfile | null>(null);
  const [threadMessages, setThreadMessages] = useState<Record<string, ThreadMessage[]>>({
    aarohi: [
      { id: '1', sender: 'them', text: 'Hey there! Loved your profile ✨', time: '12:04 PM' },
      { id: '2', sender: 'you', text: 'Hey Aarohi! Down for a quick video chat?', time: '12:06 PM' },
    ],
    sneha: [
      { id: '1', sender: 'them', text: 'Hello! Are you into lo-fi music and aesthetic chats?', time: '11:30 AM' },
    ],
  });
  const [messageInput, setMessageInput] = useState('');

  const handleCallClick = (profile: DatingProfile) => {
    if (canMakeVideoCall && !canMakeVideoCall()) {
      if (onOpenSubscription) onOpenSubscription('limit_reached');
      return;
    }
    onStartVideoCall(profile);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedMatch) return;

    if (canSendChatMessage && !canSendChatMessage()) {
      if (onOpenSubscription) onOpenSubscription('chat_limit');
      return;
    }

    onRecordChatMessage?.();

    const newMsg: ThreadMessage = {
      id: `m_${Date.now()}`,
      sender: 'you',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreadMessages((prev) => ({
      ...prev,
      [selectedMatch.id]: [...(prev[selectedMatch.id] || []), newMsg],
    }));
    setMessageInput('');

    // Simulated reply
    setTimeout(() => {
      const reply: ThreadMessage = {
        id: `m_rep_${Date.now()}`,
        sender: 'them',
        text: 'Sounds amazing! Let’s hop on a video call whenever you are free! 📹',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setThreadMessages((prev) => ({
        ...prev,
        [selectedMatch.id]: [...(prev[selectedMatch.id] || []), reply],
      }));
    }, 1200);
  };

  // If a specific conversation is opened:
  if (selectedMatch) {
    const messages = threadMessages[selectedMatch.id] || [];
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-20 flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMatch(null)}
              className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
              <ProfileCardImage
                imagePath={selectedMatch.imagePath}
                spritePosition={selectedMatch.spritePosition}
                altName={selectedMatch.name}
                className="w-full h-full"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{selectedMatch.name}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">Online now</p>
            </div>
          </div>

          {/* Direct Video Call Button */}
          <button
            onClick={() => handleCallClick(selectedMatch)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-md shadow-rose-500/25 hover:from-rose-600 hover:to-orange-600 transition-all cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Call</span>
            {isVip && <Crown className="w-3 h-3 text-amber-200 fill-amber-200" />}
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 max-w-lg mx-auto w-full">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'you' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                  m.sender === 'you'
                    ? 'bg-rose-500 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Subscription Quota Status Indicator */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] max-w-lg mx-auto w-full">
          {isVip ? (
            <div className="flex items-center gap-1.5 text-amber-700 font-bold">
              <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>Unlimited VIP Chat Active</span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-slate-500 font-medium">
                Free chats:{' '}
                <strong className="text-slate-800">{chatsRemainingToday} remaining today</strong>
              </span>
              {onOpenSubscription && (
                <button
                  type="button"
                  onClick={() => onOpenSubscription('chat_limit')}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>Unlimited via UPI (₹49)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${selectedMatch.name}...`}
              className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-full transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 pb-24 p-4 sm:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-4">
        {activeMode === 'matches' ? 'Your Matches' : 'Messages'}
      </h1>

      {/* New Matches Row (Avatars) */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          New Matches ({matchedProfiles.length})
        </p>

        {matchedProfiles.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl text-center space-y-2 border border-slate-200/80">
            <Heart className="w-8 h-8 text-rose-300 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">No matches yet</p>
            <p className="text-[11px] text-slate-400">
              Head to Discover or Swipe Deck to like profiles!
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {matchedProfiles.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedMatch(p)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-orange-400">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                    <ProfileCardImage
                      imagePath={p.imagePath}
                      spritePosition={p.spritePosition}
                      altName={p.name}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <span className="text-xs font-semibold text-slate-800">{p.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages List */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Conversations
        </p>
        <div className="space-y-2">
          {matchedProfiles.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedMatch(p)}
              className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                  <ProfileCardImage
                    imagePath={p.imagePath}
                    spritePosition={p.spritePosition}
                    altName={p.name}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{p.name}, {p.age}</h4>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">
                    Tap to open chat or start video call
                  </p>
                </div>
              </div>

              {/* Direct Video Call Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCallClick(p);
                }}
                className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                title={`Call ${p.name}`}
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
