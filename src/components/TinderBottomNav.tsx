import React from 'react';
import { Flame, Star, Heart, MessageSquare, Video, User, MapPin } from 'lucide-react';

export type TinderTab = 'discover' | 'swipe' | 'dates' | 'matches' | 'messages' | 'omegle' | 'profile';

interface TinderBottomNavProps {
  activeTab: TinderTab;
  onTabChange: (tab: TinderTab) => void;
  matchesCount?: number;
  unreadMessagesCount?: number;
}

export const TinderBottomNav: React.FC<TinderBottomNavProps> = ({
  activeTab,
  onTabChange,
  matchesCount = 0,
  unreadMessagesCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2 max-w-lg mx-auto sm:rounded-t-3xl sm:border-x shadow-lg">
      <div className="flex items-center justify-around">
        {/* Tab 1: Flame (Discover) */}
        <button
          onClick={() => onTabChange('discover')}
          className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-transform active:scale-90 cursor-pointer ${
            activeTab === 'discover' ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          title="Discover"
        >
          <Flame className={`w-5 h-5 ${activeTab === 'discover' ? 'fill-current stroke-[2.2]' : 'stroke-[2]'}`} />
        </button>

        {/* Tab 2: Star (Swipe Deck) */}
        <button
          onClick={() => onTabChange('swipe')}
          className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-transform active:scale-90 cursor-pointer ${
            activeTab === 'swipe' ? 'text-amber-500 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          title="Swipe Deck"
        >
          <Star className={`w-5 h-5 ${activeTab === 'swipe' ? 'fill-current stroke-[2.2]' : 'stroke-[2]'}`} />
        </button>

        {/* Tab 3: Date Spots (Google Maps Grounding) */}
        <button
          onClick={() => onTabChange('dates')}
          className={`relative p-2 rounded-xl flex flex-col items-center gap-0.5 transition-transform active:scale-90 cursor-pointer ${
            activeTab === 'dates' ? 'text-rose-600 scale-105 font-bold' : 'text-slate-400 hover:text-rose-500'
          }`}
          title="Google Maps Date Spots"
        >
          <div className="relative">
            <MapPin className={`w-5 h-5 ${activeTab === 'dates' ? 'fill-rose-500 text-white stroke-[1.8]' : 'stroke-[2]'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </button>

        {/* Tab 4: Heart (Matches) */}
        <button
          onClick={() => onTabChange('matches')}
          className={`relative p-2 rounded-xl flex flex-col items-center gap-0.5 transition-transform active:scale-90 cursor-pointer ${
            activeTab === 'matches' ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          title="Matches & Likes"
        >
          <Heart className={`w-5 h-5 ${activeTab === 'matches' ? 'fill-current stroke-[2.2]' : 'stroke-[2]'}`} />
          {matchesCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
              {matchesCount}
            </span>
          )}
        </button>

        {/* Tab 5: Messages */}
        <button
          onClick={() => onTabChange('messages')}
          className={`relative p-2 rounded-xl flex flex-col items-center gap-0.5 transition-transform active:scale-90 cursor-pointer ${
            activeTab === 'messages' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          title="Messages"
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === 'messages' ? 'fill-current stroke-[2.2]' : 'stroke-[2]'}`} />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[8px] font-bold flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Tab 6: Omegle Random Video */}
        <button
          onClick={() => onTabChange('omegle')}
          className={`relative p-2 rounded-xl flex flex-col items-center gap-0.5 transition-transform active:scale-90 cursor-pointer ${
            activeTab === 'omegle' ? 'text-blue-500 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          title="Omegle 1-on-1 Video Roulette"
        >
          <div className="relative">
            <Video className={`w-5 h-5 ${activeTab === 'omegle' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </button>

        {/* Tab 7: Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-transform active:scale-90 cursor-pointer ${
            activeTab === 'profile' ? 'text-slate-900 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          title="My Profile"
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        </button>
      </div>
    </nav>
  );
};
