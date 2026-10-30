import React, { useState } from 'react';
import { X, Heart, Star, Video, RotateCcw, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { DatingProfile, INITIAL_PROFILES } from '../data/profiles';
import { ProfileCardImage } from './ProfileCardImage';

interface TinderSwipeDeckProps {
  onStartVideoCall: (profile: DatingProfile) => void;
  onMatch: (profile: DatingProfile) => void;
}

export const TinderSwipeDeck: React.FC<TinderSwipeDeckProps> = ({
  onStartVideoCall,
  onMatch,
}) => {
  const [deck, setDeck] = useState<DatingProfile[]>(INITIAL_PROFILES);
  const [history, setHistory] = useState<DatingProfile[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<DatingProfile | null>(null);

  const current = deck[0];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!current) return;
    const removed = deck[0];
    setHistory((prev) => [removed, ...prev]);
    setDeck((prev) => prev.slice(1));

    if (direction === 'right') {
      onMatch(removed);
      setMatchedProfile(removed);
    }
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const restored = history[0];
    setHistory((prev) => prev.slice(1));
    setDeck((prev) => [restored, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 pb-24 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Top Picks</h2>
        <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
          🔥 High Compatibility
        </span>
      </div>

      {current ? (
        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Card */}
          <div className="relative aspect-[3/4.4] w-full rounded-[32px] overflow-hidden bg-slate-200 shadow-2xl select-none group">
            <ProfileCardImage
              imagePath={current.imagePath}
              spritePosition={current.spritePosition}
              altName={current.name}
              className="w-full h-full object-cover"
            />

            {/* Bottom Scrim */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  {current.name}, {current.age}
                </h3>
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{current.distance}</span>
                <span>·</span>
                <span>{current.location}</span>
              </div>
              <p className="text-xs text-white/80 mt-2 line-clamp-2 leading-relaxed">
                {current.bio}
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {/* Rewind */}
            <button
              onClick={handleRewind}
              disabled={history.length === 0}
              className="w-12 h-12 rounded-full bg-white shadow-md text-amber-500 hover:scale-110 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
              title="Rewind"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Dislike / Pass */}
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-white shadow-lg text-rose-500 hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Pass"
            >
              <X className="w-7 h-7 stroke-[2.5]" />
            </button>

            {/* Instant Video Call */}
            <button
              onClick={() => onStartVideoCall(current)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/30 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Direct Video Call"
            >
              <Video className="w-5 h-5" />
            </button>

            {/* Like */}
            <button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full bg-white shadow-lg text-emerald-500 hover:bg-emerald-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Like"
            >
              <Heart className="w-7 h-7 stroke-[2.5] fill-current" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-lg text-center space-y-4">
          <Sparkles className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No More Profiles Left</h3>
          <p className="text-xs text-slate-500">
            You have reviewed all available profiles in this area. Reset to explore again!
          </p>
          <button
            onClick={() => setDeck(INITIAL_PROFILES)}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Reset Deck
          </button>
        </div>
      )}

      {/* Match Alert Modal */}
      {matchedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-gradient-to-b from-rose-500 to-rose-600 text-white p-6 rounded-3xl text-center space-y-4 shadow-2xl">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-black tracking-tight">It&apos;s a Match!</h2>
            <p className="text-xs text-rose-100">
              You and {matchedProfile.name} liked each other!
            </p>

            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-white shadow-xl">
              <ProfileCardImage
                imagePath={matchedProfile.imagePath}
                spritePosition={matchedProfile.spritePosition}
                altName={matchedProfile.name}
                className="w-full h-full"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  const p = matchedProfile;
                  setMatchedProfile(null);
                  onStartVideoCall(p);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-rose-600 font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-102 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Start Video Call Now</span>
              </button>

              <button
                onClick={() => setMatchedProfile(null)}
                className="w-full py-2.5 text-xs text-white/80 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
