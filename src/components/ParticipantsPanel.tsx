import React, { useState } from 'react';
import { Users, X, Mic, MicOff, Video, VideoOff, Hand, Copy, Check, ExternalLink, Bot, MapPin } from 'lucide-react';
import { Participant } from '../types/meeting';

interface ParticipantsPanelProps {
  participants: Participant[];
  localParticipant: Participant;
  roomId: string;
  echoBotActive: boolean;
  onToggleEchoBot: () => void;
  onClose: () => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  localParticipant,
  roomId,
  echoBotActive,
  onToggleEchoBot,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const totalCount = 1 + participants.length;

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSecondTab = () => {
    const inviteUrl = `${window.location.origin}/?room=${roomId}`;
    window.open(inviteUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-l border-slate-800/80 w-80 max-w-full backdrop-blur-md z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Participants <span className="font-mono tabular-nums text-slate-400">({totalCount})</span>
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Share / Invite Section */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>

          <button
            onClick={handleOpenSecondTab}
            title="Open in new window to test peer-to-peer 2-way call"
            className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onToggleEchoBot}
          className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            echoBotActive
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{echoBotActive ? 'Remove Studio Echo Bot' : 'Add Studio Echo Bot (Solo Test)'}</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Local user first */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-medium flex items-center justify-center shrink-0">
              {localParticipant.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">
                {localParticipant.name} <span className="text-slate-400 text-[11px]">(You)</span>
              </p>
              {localParticipant.location?.city && localParticipant.location.sharingEnabled !== false && (
                <p className="text-[10px] text-rose-300 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-rose-400" />
                  <span>{localParticipant.location.city}, {localParticipant.location.country} {localParticipant.location.flagEmoji}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            {localParticipant.isHandRaised && (
              <Hand className="w-3.5 h-3.5 text-amber-400" />
            )}
            {localParticipant.isAudioMuted ? (
              <MicOff className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {localParticipant.isVideoOff ? (
              <VideoOff className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Video className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Remote participants */}
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {p.avatarUrl ? (
                <img
                  src={p.avatarUrl}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center shrink-0">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                {p.location?.city && p.location.sharingEnabled !== false && (
                  <p className="text-[10px] text-rose-300 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-rose-400" />
                    <span>{p.location.city}, {p.location.country} {p.location.flagEmoji}</span>
                  </p>
                )}
                {p.isScreenSharing && (
                  <p className="text-[10px] text-indigo-400">Presenting</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              {p.isHandRaised && (
                <Hand className="w-3.5 h-3.5 text-amber-400" />
              )}
              {p.isAudioMuted ? (
                <MicOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {p.isVideoOff ? (
                <VideoOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Video className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
