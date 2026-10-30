import React, { useState } from 'react';
import { Smile, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface FloatingReactionButtonBarProps {
  onSendReaction: (emoji: string) => void;
  className?: string;
}

interface ReactionOption {
  emoji: string;
  label: string;
  color: string;
  toneFrequency: number;
}

const REACTION_OPTIONS: ReactionOption[] = [
  { emoji: '❤️', label: 'Love', color: 'hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400', toneFrequency: 523.25 },
  { emoji: '😂', label: 'Laugh', color: 'hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400', toneFrequency: 659.25 },
  { emoji: '👏', label: 'Clap', color: 'hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400', toneFrequency: 587.33 },
  { emoji: '🔥', label: 'Fire', color: 'hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-400', toneFrequency: 783.99 },
  { emoji: '👍', label: 'Thumbs Up', color: 'hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400', toneFrequency: 440.0 },
  { emoji: '🎉', label: 'Party', color: 'hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-400', toneFrequency: 880.0 },
  { emoji: '😮', label: 'Wow', color: 'hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-400', toneFrequency: 493.88 },
  { emoji: '🚀', label: 'Rocket', color: 'hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400', toneFrequency: 987.77 },
];

export const FloatingReactionButtonBar: React.FC<FloatingReactionButtonBarProps> = ({
  onSendReaction,
  className = '',
}) => {
  const [lastClickedEmoji, setLastClickedEmoji] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Synthesize non-intrusive tactile audio chime for reactions
  const playReactionChime = (frequency: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.2, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);

      setTimeout(() => ctx.close(), 260);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  const handleEmojiClick = (option: ReactionOption) => {
    playReactionChime(option.toneFrequency);
    setLastClickedEmoji(option.emoji);
    setClickCount((prev) => prev + 1);
    onSendReaction(option.emoji);

    // Reset bounce state after short pulse
    setTimeout(() => {
      setLastClickedEmoji((curr) => (curr === option.emoji ? null : curr));
    }, 450);
  };

  if (isMinimized) {
    return (
      <div className={`pointer-events-auto z-30 transition-all ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 hover:border-rose-500/50 rounded-full shadow-2xl backdrop-blur-md text-xs font-semibold text-slate-200 transition-all cursor-pointer group"
          title="Open floating reaction bar"
        >
          <Smile className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Reactions</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-auto z-30 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${className}`}
      role="toolbar"
      aria-label="Floating quick reaction bar"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/95 border border-slate-700/80 p-1.5 sm:p-2 rounded-full shadow-2xl backdrop-blur-xl hover:border-slate-600 transition-all">
        {/* Reaction Bar Header / Icon Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 pl-2 pr-1 text-slate-400 text-xs font-medium select-none">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-300">React:</span>
        </div>

        {/* Reaction Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {REACTION_OPTIONS.map((opt) => {
            const isJustClicked = lastClickedEmoji === opt.emoji;
            return (
              <button
                key={opt.emoji}
                onClick={() => handleEmojiClick(opt)}
                className={`relative group/btn p-2 sm:p-2.5 rounded-full border border-transparent transition-all duration-150 cursor-pointer select-none active:scale-90 ${
                  opt.color
                } ${
                  isJustClicked
                    ? 'scale-130 bg-white/10 border-white/30 ring-2 ring-rose-400/50 shadow-lg'
                    : 'hover:scale-120 hover:shadow-md'
                }`}
                title={`Send ${opt.emoji} (${opt.label}) to video feed`}
                aria-label={`Send ${opt.label} reaction`}
              >
                <span className="text-xl sm:text-2xl leading-none block transform group-hover/btn:-translate-y-0.5 transition-transform">
                  {opt.emoji}
                </span>

                {/* Subtle Click Burst Wave */}
                {isJustClicked && (
                  <span className="absolute inset-0 rounded-full border border-rose-400 animate-ping pointer-events-none opacity-75" />
                )}

                {/* Tooltip on hover */}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-40">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 ml-0.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
          title="Minimize reaction bar"
          aria-label="Minimize reaction bar"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
