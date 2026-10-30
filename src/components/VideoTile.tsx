import React, { useEffect, useRef, useState } from 'react';
import { MicOff, Hand, Maximize2, PictureInPicture2, Pin, Sparkles, Smile, MapPin } from 'lucide-react';
import { Participant, VirtualBackgroundType, FloatingReaction } from '../types/meeting';
import { WebRTCStatsData } from '../types/diagnostics';
import { NetworkQualityIndicator } from './NetworkQualityIndicator';

interface VideoTileProps {
  participant: Participant;
  isLocal?: boolean;
  isSpeaking?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
  virtualBackground?: VirtualBackgroundType;
  tileReactions?: FloatingReaction[];
  onSendReaction?: (emoji: string) => void;
  networkStats?: WebRTCStatsData;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '👏', '🎉', '🔥'];

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isLocal = false,
  isSpeaking = false,
  isPinned = false,
  onTogglePin,
  virtualBackground = 'none',
  tileReactions = [],
  onSendReaction,
  networkStats,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [latestReaction, setLatestReaction] = useState<FloatingReaction | null>(null);

  // Track latest reaction for animated overlay popup on video feed
  useEffect(() => {
    if (tileReactions.length > 0) {
      const newest = tileReactions[tileReactions.length - 1];
      setLatestReaction(newest);
      const timer = setTimeout(() => {
        setLatestReaction((curr) => (curr?.id === newest.id ? null : curr));
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [tileReactions]);

  // Attach media stream to video element
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  // Picture in picture handler
  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported or rejected:', err);
    }
  };

  // Fullscreen handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Determine virtual background styling
  const getBackgroundFilter = () => {
    if (!isLocal) return '';
    switch (virtualBackground) {
      case 'blur':
        return 'backdrop-blur-md';
      case 'warm_studio':
        return 'sepia(25%) contrast(105%) brightness(102%)';
      case 'cinematic_bw':
        return 'grayscale(100%) contrast(115%)';
      default:
        return '';
    }
  };

  const getVirtualBackgroundImage = () => {
    if (!isLocal) return undefined;
    switch (virtualBackground) {
      case 'loft':
        return '/src/assets/images/bg_modern_loft_1793126797541.jpg';
      case 'office':
        return '/src/assets/images/bg_executive_office_1793126799788.jpg';
      case 'bookshelf':
        return '/src/assets/images/bg_nordic_bookshelf_1793126798876.jpg';
      default:
        return undefined;
    }
  };

  const bgImage = getVirtualBackgroundImage();

  const handleSelectEmoji = (emoji: string) => {
    if (onSendReaction) {
      onSendReaction(emoji);
    }
    setShowReactionPicker(false);
  };

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-xl bg-slate-900 border transition-all duration-200 flex items-center justify-center ${
        isSpeaking
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : isPinned
          ? 'border-indigo-500/70 ring-1 ring-indigo-500/30'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
      style={{
        minHeight: '220px',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Optional Virtual Background Backdrop for Local Camera */}
      {bgImage && (
        <img
          src={bgImage}
          alt="Virtual background"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-70 z-0 pointer-events-none filter blur-[1px]"
        />
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Avoid local echo feedback loop
        className={`w-full h-full object-cover z-10 relative transition-transform ${
          isLocal && !participant.isScreenSharing ? 'scale-x-[-1]' : ''
        } ${participant.isVideoOff ? 'hidden' : 'block'}`}
        style={{
          filter: getBackgroundFilter(),
        }}
      />

      {/* Video Off Fallback Avatar */}
      {participant.isVideoOff && (
        <div className="z-10 flex flex-col items-center justify-center gap-3 select-none">
          {participant.avatarUrl ? (
            <div className="relative">
              <img
                src={participant.avatarUrl}
                alt={participant.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-700 shadow-xl"
              />
              {isSpeaking && (
                <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-700 to-slate-800 text-white font-semibold text-2xl flex items-center justify-center shadow-lg border border-slate-700">
                {participant.name.slice(0, 2).toUpperCase()}
              </div>
              {isSpeaking && (
                <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400 animate-pulse opacity-75" />
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-medium text-slate-200">{participant.name}</p>
            <p className="text-xs text-slate-400">Camera turned off</p>
          </div>
        </div>
      )}

      {/* Hand Raised Banner */}
      {participant.isHandRaised && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 text-slate-950 font-semibold text-xs rounded-md shadow-md backdrop-blur-sm animate-bounce">
          <Hand className="w-3.5 h-3.5" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Virtual Background Active Badge for Local user */}
      {isLocal && virtualBackground !== 'none' && (
        <div className="absolute top-3 right-3 z-20 hidden group-hover:flex items-center gap-1 px-2 py-0.5 bg-slate-950/80 border border-slate-700/80 rounded text-[11px] text-indigo-300 backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>FX Active</span>
        </div>
      )}

      {/* Standout Animated Overlay Popup on Video Feed */}
      {latestReaction && (
        <div
          key={latestReaction.id}
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-30 select-none animate-[reactionPopAndFade_2.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        >
          <div className="flex flex-col items-center gap-1.5 px-5 py-3.5 bg-slate-950/90 border border-white/20 rounded-3xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10 transform-gpu">
            <span className="text-5xl sm:text-6xl filter drop-shadow-xl animate-bounce leading-none select-none">
              {latestReaction.emoji}
            </span>
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 backdrop-blur-sm">
              <span className="text-xs font-bold text-white tracking-wide">
                {isLocal ? 'You' : participant.name}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">reacted</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Emojis Appearing on this specific Video Feed */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-25">
        {tileReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-10 flex flex-col items-center animate-[feedEmojiFloat_2.8s_ease-out_forwards]"
            style={{
              left: `${r.xPercent}%`,
            }}
          >
            <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none transform hover:scale-125 transition-transform">
              {r.emoji}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom User Tag (Adheres to Zero-Pill Unboxed Text rule) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-medium text-slate-200 backdrop-blur-sm">
        <span className="truncate max-w-[130px] font-semibold">{participant.name}</span>
        <span className="text-slate-500 text-[10px]" aria-hidden="true">·</span>
        <span className="text-slate-400 text-[11px]">
          {isLocal ? 'You' : participant.isScreenSharing ? 'Screen Share' : 'Remote'}
        </span>
        {participant.location?.city && participant.location.sharingEnabled !== false && (
          <>
            <span className="text-slate-600 text-[10px]" aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[11px] text-rose-300 font-semibold" title={participant.location.formattedAddress || `${participant.location.city}, ${participant.location.country}`}>
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>{participant.location.city}</span>
              {participant.location.flagEmoji && <span>{participant.location.flagEmoji}</span>}
            </span>
          </>
        )}
        {participant.isAudioMuted && (
          <span className="text-red-400 flex items-center ml-0.5" title="Muted">
            <MicOff className="w-3.5 h-3.5" />
          </span>
        )}
        {networkStats && (
          <>
            <span className="text-slate-600 text-[10px]" aria-hidden="true">·</span>
            <NetworkQualityIndicator stats={networkStats} variant="tile" />
          </>
        )}
      </div>

      {/* Dedicated Video Feed Overlay Reaction Button & Floating Tray */}
      {onSendReaction && (
        <div className="absolute top-3 right-3 z-30 flex items-center">
          {showReactionPicker ? (
            <div className="flex items-center gap-1 bg-slate-950/95 border border-slate-700/80 px-2 py-1.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="p-1 text-lg sm:text-xl hover:scale-130 transition-transform cursor-pointer leading-none"
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => setShowReactionPicker(false)}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-1 font-mono cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowReactionPicker(true)}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white rounded-full text-xs font-medium backdrop-blur-md shadow-lg transition-all duration-150 cursor-pointer"
              title="Send floating emoji reaction on this feed"
            >
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] hidden sm:inline">React</span>
            </button>
          )}
        </div>
      )}

      {/* Hover Floating Action Bar (Pin, PiP, Fullscreen) */}
      <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 p-1 rounded-lg backdrop-blur-sm">
        {onTogglePin && (
          <button
            onClick={onTogglePin}
            title={isPinned ? 'Unpin' : 'Pin Spotlight'}
            className={`p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
              isPinned ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleTogglePiP}
          title="Picture in Picture"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <PictureInPicture2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <style>{`
        @keyframes reactionPopAndFade {
          0% {
            transform: scale(0.2) translateY(24px);
            opacity: 0;
          }
          16% {
            transform: scale(1.15) translateY(-4px);
            opacity: 1;
          }
          28% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          75% {
            transform: scale(1) translateY(-8px);
            opacity: 0.96;
          }
          100% {
            transform: scale(0.85) translateY(-48px);
            opacity: 0;
          }
        }
        @keyframes feedEmojiFloat {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            transform: translateY(-20px) scale(1.25);
            opacity: 1;
          }
          65% {
            transform: translateY(-90px) scale(1.05);
            opacity: 0.95;
          }
          100% {
            transform: translateY(-160px) scale(0.85);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
