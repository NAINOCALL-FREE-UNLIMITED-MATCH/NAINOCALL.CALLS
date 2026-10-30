import React from 'react';
import { Video, ShieldCheck, Zap, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onStartInstantMeeting: () => void;
  onOpenDiagnostics: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onStartInstantMeeting,
  onOpenDiagnostics,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <Video className="w-4 h-4" />
        </div>
        <span className="font-semibold text-slate-100">NAINO CALL</span>
      </a>

      {/* Zone 2: 4-5 concise single-line nav links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
        <a href="#overview" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          Overview
        </a>
        <a href="#features" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          Video Architecture
        </a>
        <a href="#security" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
          P2P Encryption
        </a>
        <button
          onClick={onOpenDiagnostics}
          className="flex items-center gap-1.5 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-slate-400 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Device Pre-Flight</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onStartInstantMeeting}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all duration-150 shadow-sm shadow-indigo-500/20 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Start Instant Meeting
        </button>
      </div>
    </header>
  );
};
