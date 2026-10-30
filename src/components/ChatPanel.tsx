import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  MessageSquare,
  Search,
  Download,
  Pin,
  Copy,
  Check,
  Smile,
  ExternalLink,
  ChevronDown,
  MapPin,
  Navigation,
} from 'lucide-react';
import { ChatMessage, UserLocation } from '../types/meeting';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, locationPin?: UserLocation) => void;
  onSendReaction?: (messageId: string, emoji: string) => void;
  onTogglePin?: (messageId: string) => void;
  onClose: () => void;
  roomId?: string;
  onlineCount?: number;
  userLocation?: UserLocation | null;
  onRequestLocation?: () => Promise<UserLocation | null>;
}

const QUICK_REPLIES = [
  '🗺️ Check date spots on Google Maps!',
  '☕ Subko Coffee in Bandra?',
  '🌅 Sunset walk at Carter Road?',
  '🍷 Dinner & drinks this weekend?',
  '🔊 Audio is crystal clear!',
  '👍 Sounds like a plan!',
];

const REACTION_EMOJIS = ['👍', '❤️', '👏', '😂', '🔥', '🚀'];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onSendReaction,
  onTogglePin,
  onClose,
  roomId = '',
  onlineCount = 1,
  userLocation,
  onRequestLocation,
}) => {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
  const [isLocSharing, setIsLocSharing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleShareLocationPin = async () => {
    setIsLocSharing(true);
    try {
      let loc = userLocation;
      if (!loc && onRequestLocation) {
        loc = await onRequestLocation();
      }
      if (loc) {
        onSendMessage(`📍 Pinned Location: ${loc.formattedAddress || loc.city || 'My Coordinates'}`, loc);
      }
    } finally {
      setIsLocSharing(false);
    }
  };

  // Auto-scroll down on new message unless searching
  useEffect(() => {
    if (!isSearching) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearching]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
    setShowEmojiPickerFor(null);
  };

  const handleQuickReply = (text: string) => {
    onSendMessage(text);
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedMessageId(msg.id);
    setTimeout(() => setCopiedMessageId(null), 1800);
  };

  const handleExportTranscript = () => {
    const header = `NAINO CALL Meeting Chat Transcript\nRoom: ${roomId}\nExported: ${new Date().toLocaleString()}\n----------------------------------------\n\n`;
    const lines = messages.map(
      (m) =>
        `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.senderName}: ${m.text}`
    );
    const content = header + lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chat_Transcript_${roomId}_${Date.now()}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 200);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to parse URLs in messages and make them safe clickable links
  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-300 underline underline-offset-2 hover:text-white transition-colors break-all"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 shrink-0 inline" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Filter messages by search query if active
  const filteredMessages = searchQuery.trim()
    ? messages.filter(
        (m) =>
          m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const pinnedMessage = messages.find((m) => m.isPinned);

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-l border-slate-800/80 w-88 sm:w-96 max-w-full backdrop-blur-xl z-30 shadow-2xl transition-all select-text">
      {/* Sidebar Header */}
      <div className="px-4 py-3.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-sm font-semibold text-slate-100 truncate">Meeting Messages</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Everyone in call</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{onlineCount} connected</span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchQuery('');
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSearching
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Search messages in call"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportTranscript}
            disabled={messages.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Export chat transcript (.txt)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar (Expandable) */}
      {isSearching && (
        <div className="p-2.5 bg-slate-950/40 border-b border-slate-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword or sender..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-[11px] text-slate-400 mt-1.5 px-1 font-mono tabular-nums">
              {filteredMessages.length} match{filteredMessages.length === 1 ? '' : 'es'} found
            </p>
          )}
        </div>
      )}

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="px-3.5 py-2.5 bg-indigo-950/40 border-b border-indigo-800/50 flex items-start justify-between gap-2 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 rotate-45" />
            <div className="truncate">
              <span className="font-semibold text-indigo-300">Pinned: </span>
              <span className="text-slate-300">{pinnedMessage.text}</span>
              <span className="text-slate-500 text-[10px] ml-1">({pinnedMessage.senderName})</span>
            </div>
          </div>
          {onTogglePin && (
            <button
              onClick={() => onTogglePin(pinnedMessage.id)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer shrink-0"
            >
              Unpin
            </button>
          )}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {searchQuery ? 'No matching messages' : 'No messages yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              {searchQuery
                ? 'Try a different keyword or clear search filter.'
                : 'Send notes, agendas, code snippets, or links to everyone during the call.'}
            </p>

            {!searchQuery && (
              <div className="mt-4 flex flex-col gap-1.5 w-full max-w-xs">
                <span className="text-[11px] font-medium text-slate-500">Quick Starters:</span>
                <button
                  onClick={() => onSendMessage('👋 Hello everyone!')}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left transition-colors cursor-pointer"
                >
                  👋 Hello everyone!
                </button>
                <button
                  onClick={() => onSendMessage('Ready for screen share 👍')}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left transition-colors cursor-pointer"
                >
                  Ready for screen share 👍
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`group relative flex flex-col ${
                msg.isLocal ? 'items-end' : 'items-start'
              }`}
            >
              {/* Sender & Timestamp (Zero-Pill Unboxed Text) */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 px-1">
                <span className="font-semibold text-slate-300">{msg.senderName}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-400">
                  {formatTime(msg.timestamp)}
                </span>
                {msg.isPinned && (
                  <span title="Pinned message" className="inline-flex items-center">
                    <Pin className="w-3 h-3 text-indigo-400 rotate-45 ml-0.5" />
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div className="relative max-w-[88%]">
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-sm ${
                    msg.isLocal
                      ? 'bg-indigo-600 text-white rounded-br-xs font-normal'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-bl-xs'
                  }`}
                >
                  {renderMessageContent(msg.text)}

                  {msg.locationPin && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 text-left text-slate-100 shadow-md">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>
                          {msg.locationPin.city ? `${msg.locationPin.city}, ${msg.locationPin.country}` : 'Location Pin'}
                        </span>
                        {msg.locationPin.flagEmoji && <span>{msg.locationPin.flagEmoji}</span>}
                      </div>

                      {msg.locationPin.latitude && msg.locationPin.longitude && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 mb-2">
                          GPS: {msg.locationPin.latitude.toFixed(4)}°, {msg.locationPin.longitude.toFixed(4)}°
                        </p>
                      )}

                      <a
                        href={
                          msg.locationPin.latitude && msg.locationPin.longitude
                            ? `https://www.google.com/maps/search/?api=1&query=${msg.locationPin.latitude},${msg.locationPin.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.locationPin.formattedAddress || msg.locationPin.city || 'Mumbai')}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View on Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Hover Message Actions Toolbar */}
                <div
                  className={`absolute -top-3 ${
                    msg.isLocal ? 'right-0' : 'left-0'
                  } hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shadow-lg backdrop-blur-md z-10`}
                >
                  {/* Emoji Reaction buttons */}
                  {REACTION_EMOJIS.slice(0, 3).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onSendReaction && onSendReaction(msg.id, emoji)}
                      className="p-1 text-xs hover:bg-slate-800 rounded transition-transform hover:scale-125 cursor-pointer"
                      title={`React ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}

                  {/* More emojis popover trigger */}
                  <button
                    onClick={() =>
                      setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)
                    }
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="More reactions"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {/* Pin toggle */}
                  {onTogglePin && (
                    <button
                      onClick={() => onTogglePin(msg.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        msg.isPinned
                          ? 'text-indigo-400 bg-indigo-950/60'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title={msg.isPinned ? 'Unpin message' : 'Pin message'}
                    >
                      <Pin className="w-3.5 h-3.5 rotate-45" />
                    </button>
                  )}

                  {/* Copy message */}
                  <button
                    onClick={() => handleCopyMessage(msg)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Copy text"
                  >
                    {copiedMessageId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Secondary Emoji Picker dropdown if opened */}
                {showEmojiPickerFor === msg.id && (
                  <div className="absolute top-full mt-1 left-0 z-20 bg-slate-900 border border-slate-700 p-1.5 rounded-xl shadow-xl flex items-center gap-1">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onSendReaction && onSendReaction(msg.id, emoji);
                          setShowEmojiPickerFor(null);
                        }}
                        className="text-sm p-1.5 hover:bg-slate-800 rounded-lg hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Reactions summary tags */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-1.5 px-1">
                  {Object.entries(msg.reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => onSendReaction && onSendReaction(msg.id, emoji)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 hover:bg-slate-700/80 transition-colors cursor-pointer"
                    >
                      <span>{emoji}</span>
                      <span className="font-mono tabular-nums text-slate-400 text-[10px]">{count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Strip */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-800/60 bg-slate-950/30 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => handleQuickReply(reply)}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Composer Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareLocationPin}
            disabled={isLocSharing}
            className="p-2.5 bg-slate-800 hover:bg-slate-700/80 text-rose-400 hover:text-rose-300 border border-slate-700/80 rounded-xl transition-colors cursor-pointer"
            title="Share your location pin in chat"
          >
            <MapPin className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or share location..."
            className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
