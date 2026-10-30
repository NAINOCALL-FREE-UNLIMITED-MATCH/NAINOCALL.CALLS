import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Hand,
  Smile,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  Radio,
  Copy,
  Check,
  Grid,
  Maximize,
  Sparkles,
  ExternalLink,
  Bot,
  Activity,
  MapPin,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebRTCDiagnostics } from '../hooks/useWebRTCDiagnostics';
import { useUserLocation } from '../hooks/useUserLocation';
import { VideoTile } from './VideoTile';
import { ChatPanel } from './ChatPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { FloatingReactionsOverlay } from './FloatingReactionsOverlay';
import { FloatingReactionButtonBar } from './FloatingReactionButtonBar';
import { VirtualBackgroundModal } from './VirtualBackgroundModal';
import { DeviceSettingsModal } from './DeviceSettingsModal';
import { CallDurationTimer } from './CallDurationTimer';
import { DiagnosticsOverlay } from './DiagnosticsOverlay';
import { NetworkQualityIndicator } from './NetworkQualityIndicator';
import { VirtualBackgroundType, UserLocation, Participant } from '../types/meeting';

interface MeetingRoomProps {
  roomId: string;
  userName: string;
  initialAudioMuted: boolean;
  initialVideoOff: boolean;
  initialBackground: VirtualBackgroundType;
  initialLocation?: UserLocation | null;
  onLeave: () => void;
  isVip?: boolean;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  roomId,
  userName,
  initialAudioMuted,
  initialVideoOff,
  initialBackground,
  initialLocation,
  onLeave,
  isVip = false,
}) => {
  const {
    location,
    permissionState: locPermissionState,
    requestLocation,
    toggleSharing: toggleLocSharing,
  } = useUserLocation();

  const currentLocation = location || initialLocation || null;

  const {
    localStream,
    screenStream,
    participants,
    chatMessages,
    reactions,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isHandRaised,
    localAudioLevel,
    isLocalSpeaking,
    localParticipantId,
    isRecording,
    recordingDuration,
    echoBotActive,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    toggleRecording,
    toggleEchoBot,
    sendChatMessage,
    sendChatReaction,
    togglePinChatMessage,
    sendReaction,
    updateLocation,
    switchDevice,
    leaveRoom,
    peerConnectionsRef,
    wsRef,
  } = useWebRTC({
    roomId,
    userName,
    initialAudioMuted,
    initialVideoOff,
    userLocation: currentLocation,
    onLeft: onLeave,
  });

  // Sync location update across WebRTC peers
  useEffect(() => {
    if (updateLocation && currentLocation) {
      updateLocation(currentLocation);
    }
  }, [currentLocation, updateLocation]);

  // Real-time WebRTC diagnostics and network metrics hook
  const webRTCStats = useWebRTCDiagnostics({
    peerConnectionsRef,
    localStream,
    screenStream,
    wsRef,
    echoBotActive,
  });

  // UI Panels state
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants' | null>(null);
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBackgroundsModal, setShowBackgroundsModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState<VirtualBackgroundType>(initialBackground);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [meetingStartTime] = useState<number>(() => Date.now());
  const [copiedLink, setCopiedLink] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dismissedNetworkAlert, setDismissedNetworkAlert] = useState(false);

  // Precision real-time call duration tracker (clock-drift-free across tab backgrounding)
  useEffect(() => {
    const updateDuration = () => {
      setMeetingDuration(Math.max(0, Math.floor((Date.now() - meetingStartTime) / 1000)));
    };
    updateDuration();
    const timer = setInterval(updateDuration, 500);
    return () => clearInterval(timer);
  }, [meetingStartTime]);

  // Sound chime for incoming chat message
  const playMessageChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      setTimeout(() => ctx.close(), 300);
    } catch {
      // quiet fallback
    }
  };

  // Track unread chat messages when chat panel is closed
  useEffect(() => {
    if (chatMessages.length > 0) {
      const latest = chatMessages[chatMessages.length - 1];
      if (!latest.isLocal && activeSidePanel !== 'chat') {
        setUnreadChatCount((prev) => prev + 1);
        playMessageChime();
      }
    }
  }, [chatMessages, activeSidePanel]);

  const handleToggleChat = () => {
    if (activeSidePanel === 'chat') {
      setActiveSidePanel(null);
    } else {
      setActiveSidePanel('chat');
      setUnreadChatCount(0);
    }
  };

  const handleToggleParticipants = () => {
    setActiveSidePanel(activeSidePanel === 'participants' ? null : 'participants');
  };

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenSecondTab = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    window.open(url, '_blank');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeStream = isScreenSharing ? (screenStream || localStream) : localStream;

  const localParticipantObj: Participant = {
    id: localParticipantId,
    name: userName,
    isLocal: true,
    isAudioMuted,
    isVideoOff: isScreenSharing ? false : isVideoOff,
    isScreenSharing,
    isHandRaised,
    stream: activeStream || undefined,
    location: currentLocation || undefined,
  };

  // Determine all participants to render in grid
  const allParticipants = [localParticipantObj, ...participants];

  // Grid layout class based on count and pin state
  const getGridClasses = () => {
    if (pinnedParticipantId) {
      return 'flex flex-col lg:flex-row gap-4 h-full';
    }
    const count = allParticipants.length;
    if (count === 1) return 'grid grid-cols-1 max-w-4xl mx-auto h-full w-full';
    if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full';
    if (count <= 4) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 h-full w-full';
    if (count <= 6) return 'grid grid-cols-2 md:grid-cols-3 gap-3 h-full w-full';
    return 'grid grid-cols-2 md:grid-cols-4 gap-3 h-full w-full';
  };

  const reactionsList = ['👍', '💖', '👏', '🎉', '😂', '🔥', '🚀', '✋'];

  return (
    <div className="h-screen w-screen bg-[#070a12] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Bar (Adheres to clean 1-row layout) */}
      <div className="h-14 px-6 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-4 shrink-0 z-20 backdrop-blur-md">
        {/* Left: Meeting metadata (Zero-Pill Unboxed Text) */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">NAINO CALL</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-indigo-400 font-medium">{roomId}</span>
            {isVip && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>VIP HD</span>
              </span>
            )}
          </div>

          {/* Location Badge / Permission Action */}
          {currentLocation?.city && currentLocation.sharingEnabled !== false ? (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-rose-300 font-semibold"
              title={currentLocation.formattedAddress || `${currentLocation.city}, ${currentLocation.country}`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{currentLocation.city}</span>
              {currentLocation.flagEmoji && <span>{currentLocation.flagEmoji}</span>}
            </div>
          ) : (
            <button
              onClick={() => requestLocation()}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Allow location permission to display city badge on video"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Allow Location</span>
            </button>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono tabular-nums text-[11px]">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>REC {formatDuration(recordingDuration)}</span>
            </div>
          )}
        </div>

        {/* Right: Quick actions & Top-Right Duration Timer */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick invite copy */}
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Copy invite URL to clipboard"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Invite'}</span>
          </button>

          {/* Open second tab test */}
          <button
            onClick={handleOpenSecondTab}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg transition-colors cursor-pointer"
            title="Test real peer connection by opening another tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Test Tab</span>
          </button>

          {/* Echo bot */}
          <button
            onClick={toggleEchoBot}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${
              echoBotActive
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
            }`}
            title="Toggle simulated studio partner for solo test"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{echoBotActive ? 'Bot Active' : 'Echo Partner'}</span>
          </button>

          {/* Quick Chat Toggle */}
          <button
            onClick={handleToggleChat}
            className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSidePanel === 'chat'
                ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle in-call messaging sidebar"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Maximize className="w-4 h-4" />
          </button>

          {/* Real-time Network Latency and Call Quality Indicator with signal bars & ping ms */}
          <NetworkQualityIndicator
            stats={webRTCStats}
            onOpenFullDiagnostics={() => setShowDiagnostics(true)}
          />

          {/* WebRTC Diagnostics & Metrics HUD Toggle Button */}
          <button
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
              showDiagnostics
                ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
            }`}
            title="Toggle Detailed WebRTC Connection Diagnostics & Metrics HUD"
          >
            <Activity className={`w-3.5 h-3.5 ${showDiagnostics ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
            <span>HUD</span>
          </button>

          {/* Dedicated Real-Time Call Duration Timer with Session Details Popover */}
          <CallDurationTimer
            durationSeconds={meetingDuration}
            startTime={meetingStartTime}
            isVip={isVip}
          />
        </div>
      </div>

      {/* Main Workspace Area (Video Matrix + Collapsible Side Panel) */}
      <div className="flex-1 flex overflow-hidden relative p-3 sm:p-4 gap-4">
        {/* Floating Reactions Overlay */}
        <FloatingReactionsOverlay reactions={reactions} />

        {/* Video Canvas Container */}
        <div className="flex-1 flex flex-col justify-center items-center min-h-0 min-w-0 overflow-y-auto relative">
          {/* Active Screen Sharing Presentation Banner */}
          {isScreenSharing && (
            <div className="absolute top-2 z-30 flex items-center gap-2.5 px-4 py-1.5 bg-indigo-950/90 border border-indigo-500/60 rounded-full shadow-xl backdrop-blur-md animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold text-white">Presenting Screen (Screen Capture API)</span>
              <span className="text-indigo-400 text-xs">·</span>
              <button
                onClick={toggleScreenShare}
                className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors cursor-pointer"
                title="Switch back to camera feed"
              >
                Switch to Camera
              </button>
            </div>
          )}

          {/* Real-Time Network Degradation / High Latency Alert Banner */}
          {(webRTCStats.rtt > 220 || webRTCStats.packetLossPercent > 2.5) && !dismissedNetworkAlert && (
            <div className="absolute top-3 z-30 flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/95 border border-amber-500/60 rounded-full shadow-2xl backdrop-blur-md text-amber-200 text-xs animate-in fade-in slide-in-from-top-2 select-none">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span>
                <strong className="text-white">Unstable connection:</strong> Ping {webRTCStats.rtt}ms
                {webRTCStats.packetLossPercent > 0.5 ? ` · ${webRTCStats.packetLossPercent.toFixed(1)}% packet loss` : ''}
              </span>
              <button
                onClick={() => setShowDiagnostics(true)}
                className="ml-1 text-[11px] font-bold text-amber-300 underline hover:text-white cursor-pointer"
              >
                Diagnose
              </button>
              <button
                onClick={() => setDismissedNetworkAlert(true)}
                className="ml-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                title="Dismiss warning"
              >
                ✕
              </button>
            </div>
          )}

          {pinnedParticipantId ? (
            /* Spotlight / Pinned layout */
            <div className="flex flex-col lg:flex-row gap-3 h-full w-full">
              {/* Main Stage */}
              <div className="flex-1 h-full min-h-[300px]">
                {allParticipants
                  .filter((p) => p.id === pinnedParticipantId)
                  .map((p) => (
                    <VideoTile
                      key={p.id}
                      participant={p}
                      isLocal={p.isLocal}
                      isSpeaking={p.isLocal ? isLocalSpeaking : false}
                      isPinned={true}
                      onTogglePin={() => setPinnedParticipantId(null)}
                      virtualBackground={p.isLocal ? virtualBackground : 'none'}
                      tileReactions={reactions.filter((r) => r.senderId === p.id)}
                      onSendReaction={sendReaction}
                      networkStats={webRTCStats}
                    />
                  ))}
              </div>

              {/* Thumbnails Strip */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto w-full lg:w-64 shrink-0 max-h-48 lg:max-h-full">
                {allParticipants
                  .filter((p) => p.id !== pinnedParticipantId)
                  .map((p) => (
                    <div key={p.id} className="w-48 lg:w-full h-32 shrink-0">
                      <VideoTile
                        participant={p}
                        isLocal={p.isLocal}
                        isSpeaking={p.isLocal ? isLocalSpeaking : false}
                        isPinned={false}
                        onTogglePin={() => setPinnedParticipantId(p.id)}
                        virtualBackground={p.isLocal ? virtualBackground : 'none'}
                        tileReactions={reactions.filter((r) => r.senderId === p.id)}
                        onSendReaction={sendReaction}
                        networkStats={webRTCStats}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* Standard Adaptive Matrix Layout */
            <div className={getGridClasses()}>
              {allParticipants.map((p) => (
                <VideoTile
                  key={p.id}
                  participant={p}
                  isLocal={p.isLocal}
                  isSpeaking={p.isLocal ? isLocalSpeaking : false}
                  isPinned={false}
                  onTogglePin={() => setPinnedParticipantId(p.id)}
                  virtualBackground={p.isLocal ? virtualBackground : 'none'}
                  tileReactions={reactions.filter((r) => r.senderId === p.id)}
                  onSendReaction={sendReaction}
                  networkStats={webRTCStats}
                />
              ))}
            </div>
          )}

          {/* Dedicated Floating Reaction Bar */}
          <FloatingReactionButtonBar
            onSendReaction={sendReaction}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          />
        </div>

        {/* Right Collapsible Panel */}
        {activeSidePanel === 'chat' && (
          <ChatPanel
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            onSendReaction={sendChatReaction}
            onTogglePin={togglePinChatMessage}
            onClose={() => setActiveSidePanel(null)}
            roomId={roomId}
            onlineCount={allParticipants.length}
            userLocation={currentLocation}
            onRequestLocation={requestLocation}
          />
        )}

        {activeSidePanel === 'participants' && (
          <ParticipantsPanel
            participants={participants}
            localParticipant={localParticipantObj}
            roomId={roomId}
            echoBotActive={echoBotActive}
            onToggleEchoBot={toggleEchoBot}
            onClose={() => setActiveSidePanel(null)}
          />
        )}
      </div>

      {/* Floating Emoji Picker Popover */}
      {showReactionsPicker && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700/80 p-2 rounded-2xl shadow-2xl flex items-center gap-1.5 backdrop-blur-lg">
          {reactionsList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sendReaction(emoji);
                setShowReactionsPicker(false);
              }}
              className="text-2xl p-2 rounded-xl hover:bg-slate-800 hover:scale-125 transition-all cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Control Dock */}
      <div className="h-20 px-6 border-t border-slate-800/80 bg-slate-950/95 flex items-center justify-between shrink-0 z-30">
        {/* Left Group: Room Info & Details */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
          <button
            onClick={() => setPinnedParticipantId(null)}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset Grid Layout"
          >
            <Grid className="w-4 h-4" />
            <span className="text-xs">Grid</span>
          </button>

          {/* Bottom Dock Call Duration Indicator */}
          <CallDurationTimer
            durationSeconds={meetingDuration}
            startTime={meetingStartTime}
            isVip={isVip}
            variant="dock"
          />
        </div>

        {/* Center Primary Controls Group */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto">
          {/* Microphone */}
          <div className="relative">
            <button
              onClick={toggleAudio}
              className={`p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
                isAudioMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
              }`}
              title={isAudioMuted ? 'Unmute Mic (Ctrl+D)' : 'Mute Mic (Ctrl+D)'}
            >
              {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {isLocalSpeaking && !isAudioMuted && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>

          {/* Camera */}
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
            }`}
            title={isVideoOff ? 'Start Camera (Ctrl+E)' : 'Stop Camera (Ctrl+E)'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
              isScreenSharing
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Virtual Backgrounds */}
          <button
            onClick={() => setShowBackgroundsModal(true)}
            className={`p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
              virtualBackground !== 'none'
                ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Virtual Backgrounds & Effects"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Local Call Recording */}
          <button
            onClick={toggleRecording}
            className={`p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record Meeting (WebM)'}
          >
            <Radio className="w-5 h-5" />
          </button>

          {/* Hand Raise */}
          <button
            onClick={toggleHandRaise}
            className={`p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
              isHandRaised
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Emoji Reactions Picker Toggle */}
          <button
            onClick={() => setShowReactionsPicker(!showReactionsPicker)}
            className={`p-3.5 rounded-2xl transition-all duration-150 cursor-pointer ${
              showReactionsPicker
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Extended Emoji Reactions"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* End / Leave Call */}
          <button
            onClick={leaveRoom}
            className="p-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer ml-2"
            title="Leave Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-semibold">Leave</span>
          </button>
        </div>

        {/* Right Group: Side panels & settings */}
        <div className="flex items-center gap-2">
          {/* Chat Toggle */}
          <button
            onClick={handleToggleChat}
            className={`relative p-3 rounded-xl transition-colors cursor-pointer ${
              activeSidePanel === 'chat'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="In-call chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Participants Toggle */}
          <button
            onClick={handleToggleParticipants}
            className={`relative p-3 rounded-xl transition-colors cursor-pointer ${
              activeSidePanel === 'participants'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Participants"
          >
            <Users className="w-4 h-4" />
            <span className="font-mono tabular-nums text-[11px] ml-1.5 font-medium">
              {allParticipants.length}
            </span>
          </button>

          {/* WebRTC Diagnostics & Stats HUD Toggle */}
          <button
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className={`p-3 rounded-xl transition-colors cursor-pointer ${
              showDiagnostics
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="WebRTC Connection Diagnostics (Bitrates, Packet Loss, Latency RTT)"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time WebRTC Diagnostics Overlay HUD */}
      {showDiagnostics && (
        <DiagnosticsOverlay
          stats={webRTCStats}
          onClose={() => setShowDiagnostics(false)}
        />
      )}

      {/* Modals */}
      {showBackgroundsModal && (
        <VirtualBackgroundModal
          currentBackground={virtualBackground}
          onSelectBackground={(bg) => setVirtualBackground(bg)}
          onClose={() => setShowBackgroundsModal(false)}
        />
      )}

      {showSettingsModal && (
        <DeviceSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSwitchDevice={switchDevice}
          currentAudioLevel={localAudioLevel}
        />
      )}
    </div>
  );
};
