import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Settings, Sparkles, LogIn, ArrowLeft, MapPin, Navigation, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { VirtualBackgroundType, UserLocation } from '../types/meeting';
import { createAudioLevelDetector } from '../services/audioVisualizer';
import { useUserLocation } from '../hooks/useUserLocation';

interface GreenRoomModalProps {
  roomId: string;
  initialName?: string;
  onJoin: (name: string, isAudioMuted: boolean, isVideoOff: boolean, background: VirtualBackgroundType, location?: UserLocation | null) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
  onOpenBackgrounds: () => void;
  currentBackground: VirtualBackgroundType;
}

export const GreenRoomModal: React.FC<GreenRoomModalProps> = ({
  roomId,
  initialName = '',
  onJoin,
  onCancel,
  onOpenSettings,
  onOpenBackgrounds,
  currentBackground,
}) => {
  const [name, setName] = useState(initialName || localStorage.getItem('nainocall_user_name') || localStorage.getItem('zyntricall_user_name') || 'Guest User');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const {
    location,
    permissionState,
    isLoading: isLocLoading,
    requestLocation,
    toggleSharing,
  } = useUserLocation();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let cleanupAudio: (() => void) | null = null;

    async function startPreview() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }

        cleanupAudio = createAudioLevelDetector(s, (level) => {
          setAudioLevel(level);
        });
      } catch (err) {
        console.warn('Could not start preview camera/mic:', err);
      }
    }

    startPreview();

    return () => {
      if (cleanupAudio) cleanupAudio();
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    if (stream) {
      stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    }
  };

  const toggleCam = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = !next));
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Guest';
    localStorage.setItem('nainocall_user_name', finalName);
    onJoin(finalName, isAudioMuted, isVideoOff, currentBackground, location);
  };

  const getBackgroundFilter = () => {
    switch (currentBackground) {
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
    switch (currentBackground) {
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Top back bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        {/* Room Code Display adhering to Zero-Pill Unboxed Text */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Room Code</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-200 font-semibold">{roomId}</span>
        </div>
      </div>

      {/* Main Staging Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Left: Video Preview Window */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg group">
            {bgImage && (
              <img
                src={bgImage}
                alt="Virtual background"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-70 z-0 pointer-events-none filter blur-[1px]"
              />
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover z-10 relative scale-x-[-1] ${
                isVideoOff ? 'hidden' : 'block'
              }`}
              style={{ filter: getBackgroundFilter() }}
            />

            {isVideoOff && (
              <div className="z-10 flex flex-col items-center justify-center gap-2 text-center select-none">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-semibold text-xl flex items-center justify-center border border-slate-700">
                  {name.slice(0, 2).toUpperCase() || 'GU'}
                </div>
                <p className="text-xs text-slate-400">Camera preview turned off</p>
              </div>
            )}

            {/* Quick in-preview toggles */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-md shadow-md">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  isAudioMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleCam}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  isVideoOff
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={onOpenBackgrounds}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  currentBackground !== 'none'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="Virtual Backgrounds & Studio FX"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSettings}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Audio & Video Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Audio input level live check */}
          <div className="flex items-center gap-3 px-1 text-xs text-slate-400">
            <span className="shrink-0 font-medium text-slate-300">Mic Check</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: isAudioMuted ? '0%' : `${Math.min(100, audioLevel * 1.6)}%` }}
              />
            </div>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {isAudioMuted ? 'Muted' : `${audioLevel}%`}
            </span>
          </div>
        </div>

        {/* Right: Join Form */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Ready to join?</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify your audio level, camera framing, and background before connecting to room{' '}
              <span className="font-mono text-slate-200">{roomId}</span>.
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label htmlFor="user-display-name" className="block text-xs font-semibold text-slate-300 mb-2">
                Your Display Name
              </label>
              <input
                id="user-display-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Readiness Summary */}
            <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs space-y-2.5 text-slate-400">
              <div className="flex items-center justify-between">
                <span>Microphone status</span>
                <span className={isAudioMuted ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {isAudioMuted ? 'Muted' : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Camera status</span>
                <span className={isVideoOff ? 'text-red-400 font-medium' : 'text-indigo-400 font-medium'}>
                  {isVideoOff ? 'Off' : 'Active (HD)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Virtual environment</span>
                <span className="text-slate-300 capitalize">{currentBackground.replace('_', ' ')}</span>
              </div>

              {/* Location Permission & Sharing Row */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Location Permission</span>
                  </span>
                  {permissionState === 'granted' && location ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{location.city || 'Granted'} {location.flagEmoji}</span>
                    </span>
                  ) : permissionState === 'denied' ? (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Blocked</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">
                      {permissionState === 'prompt' ? 'Not granted' : 'Unsupported'}
                    </span>
                  )}
                </div>

                {/* Location Action / Status Banner */}
                {permissionState !== 'granted' ? (
                  <div className="mt-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {permissionState === 'denied'
                        ? 'Location is blocked. Enable in browser URL bar to share city.'
                        : 'Allow location to display your city badge to participants.'}
                    </p>
                    {permissionState !== 'denied' && (
                      <button
                        type="button"
                        onClick={() => requestLocation()}
                        disabled={isLocLoading}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg transition-colors cursor-pointer"
                      >
                        {isLocLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Detecting...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3 h-3" />
                            <span>Allow Location</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-slate-300">
                      Share city badge on video
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={location?.sharingEnabled ?? true}
                        onChange={(e) => toggleSharing(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-rose-500" />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Meeting</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
