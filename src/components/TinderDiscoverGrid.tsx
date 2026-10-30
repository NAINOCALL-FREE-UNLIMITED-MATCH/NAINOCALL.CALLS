import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  SlidersHorizontal,
  Bell,
  User,
  MapPin,
  Heart,
  Video,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
  Sparkles,
  Navigation,
  Loader2,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import { DatingProfile, INITIAL_PROFILES } from '../data/profiles';
import { ProfileCardImage } from './ProfileCardImage';
import { UserLocation } from '../types/meeting';

interface TinderDiscoverGridProps {
  profiles?: DatingProfile[];
  likedIds: string[];
  onToggleLike: (id: string) => void;
  onSelectProfile: (profile: DatingProfile) => void;
  onStartVideoCall: (profile: DatingProfile) => void;
  onOpenFilters: () => void;
  onOpenProfileTab: () => void;
  onOpenDateExplorer?: (location?: string) => void;
  currentCity?: string;
  onSelectCity?: (city: string) => void;
  location?: UserLocation | null;
  permissionState?: UserLocation['permissionState'];
  onRequestLocation?: () => Promise<UserLocation | null>;
  isLocationLoading?: boolean;
  onOpenSignUp?: () => void;
  onOpenPolicy?: () => void;
  isVip?: boolean;
  onOpenSubscription?: () => void;
  callsRemainingToday?: number;
}

const CITIES = ['Mumbai, India', 'Delhi, India', 'Bengaluru, India', 'Goa, India', 'London, UK'];

export const TinderDiscoverGrid: React.FC<TinderDiscoverGridProps> = ({
  profiles = INITIAL_PROFILES,
  likedIds,
  onToggleLike,
  onSelectProfile,
  onStartVideoCall,
  onOpenFilters,
  onOpenProfileTab,
  onOpenDateExplorer,
  currentCity = 'Mumbai, India',
  onSelectCity,
  location,
  permissionState = 'prompt',
  onRequestLocation,
  isLocationLoading = false,
  onOpenSignUp,
  onOpenPolicy,
  isVip = false,
  onOpenSubscription,
  callsRemainingToday,
}) => {
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const loopScrollRef = useRef<HTMLDivElement>(null);
  const isHoveringLoop = useRef(false);

  // Auto-scrolling infinite loop effect for the top "Online Now" girls stories bar
  useEffect(() => {
    const el = loopScrollRef.current;
    if (!el) return;

    let animId: number;
    let step = 0.75; // smooth scrolling speed

    const loopStep = () => {
      if (el && !isHoveringLoop.current && isAutoScrolling) {
        el.scrollLeft += step;
        // If we reached half of duplicated list, reset cleanly
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(loopStep);
    };

    animId = requestAnimationFrame(loopStep);
    return () => cancelAnimationFrame(animId);
  }, [isAutoScrolling]);

  const scrollLoop = (direction: 'left' | 'right') => {
    if (!loopScrollRef.current) return;
    const offset = direction === 'left' ? -240 : 240;
    loopScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Duplicate profiles to create seamless infinite loop effect
  const loopProfiles = [...profiles, ...profiles];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 pb-28 selection:bg-rose-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#F5F5F7]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-200/70 shadow-xs">
        {/* Left: Flame logo + App Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                NAINO CALL
              </h1>
              {onOpenPolicy && (
                <button
                  onClick={onOpenPolicy}
                  className="px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                  title="18+ Adult Policy & Community Guidelines"
                >
                  <ShieldCheck className="w-3 h-3 text-rose-500" />
                  <span>18+ Policy</span>
                </button>
              )}
            </div>
            <span className="text-[10px] font-semibold text-rose-500 tracking-wide uppercase">
              18+ Live Video Dating & Meetups
            </span>
          </div>
        </div>

        {/* Right: Controls (Filters, Bell, Profile, Sign Up, VIP) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-slate-700">
          {/* VIP Upgrade / Active Button */}
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer transform active:scale-95 ${
                isVip
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow-amber-500/20 ring-1 ring-amber-300/40'
                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-rose-500/20'
              }`}
              title={
                isVip
                  ? 'NAINO CALL VIP Active - Unlimited Calls & Chat'
                  : 'Upgrade to Unlimited Video Calls & Chat via UPI'
              }
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">{isVip ? 'VIP Active' : 'VIP Pass'}</span>
              <span className="sm:hidden">{isVip ? 'VIP' : 'Pass'}</span>
              {!isVip && (
                <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono font-bold leading-tight">
                  ₹49
                </span>
              )}
            </button>
          )}

          {onOpenSignUp && (
            <button
              onClick={onOpenSignUp}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
              title="User Sign Up / Edit Profile"
            >
              <User className="w-3.5 h-3.5" />
              <span>18+ Sign Up</span>
            </button>
          )}

          <button
            onClick={onOpenFilters}
            className="p-2 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer text-slate-700 hover:text-rose-500"
            title="Discovery Filters"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            onClick={() => alert('No new notifications right now!')}
            className="relative p-2 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer text-slate-700 hover:text-rose-500"
            title="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#F5F5F7]" />
          </button>

          <button
            onClick={onOpenProfileTab}
            className="p-2 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer text-slate-700 hover:text-rose-500"
            title="Your Profile"
          >
            <User className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* Front of App: Online Girls Loop Bar */}
      <section className="pt-3 pb-2 border-b border-slate-200/60 bg-white/70 backdrop-blur-xs">
        {/* Loop Section Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Online Now
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              {profiles.length} Active
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">· Tap to Video Call</span>
          </div>

          {/* Loop controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className="text-[11px] font-medium text-slate-500 hover:text-rose-600 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer mr-1"
              title="Toggle auto loop animation"
            >
              {isAutoScrolling ? 'Pause Loop' : 'Play Loop'}
            </button>
            <button
              onClick={() => scrollLoop('left')}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollLoop('right')}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Continuous Looping Carousel of all 9 Girls */}
        <div
          ref={loopScrollRef}
          onMouseEnter={() => {
            isHoveringLoop.current = true;
          }}
          onMouseLeave={() => {
            isHoveringLoop.current = false;
          }}
          onTouchStart={() => {
            isHoveringLoop.current = true;
          }}
          onTouchEnd={() => {
            isHoveringLoop.current = false;
          }}
          className="flex items-center gap-3.5 overflow-x-auto scrollbar-none px-4 sm:px-6 py-1 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loopProfiles.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              onClick={() => onSelectProfile(p)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              {/* Outer Glowing Story Ring */}
              <div className="relative">
                <div className="w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-full p-[2.5px] bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 group-hover:scale-105 transition-transform duration-300 shadow-sm group-hover:shadow-rose-500/30">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-200 relative">
                    <ProfileCardImage
                      imagePath={p.imagePath}
                      spritePosition={p.spritePosition}
                      altName={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Live Online Badge on Avatar */}
                <div className="absolute -bottom-1 -right-0.5 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold shadow-sm border border-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>LIVE</span>
                </div>

                {/* Instant Video Call Hover Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartVideoCall(p);
                  }}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white backdrop-blur-xs cursor-pointer"
                  title={`Call ${p.name}`}
                >
                  <Video className="w-5 h-5 text-rose-400 animate-bounce" />
                </button>
              </div>

              {/* Name & Online Label */}
              <div className="text-center w-20 truncate">
                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                  {p.name}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">Online</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subheader: Profile Count & Location Selector */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500">
        <div className="relative">
          <button
            onClick={() => setCityMenuOpen(!cityMenuOpen)}
            className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <span>{profiles.length} Verified Profiles</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-800 font-semibold">{currentCity}</span>
            {location?.flagEmoji && <span>{location.flagEmoji}</span>}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* City dropdown */}
          {cityMenuOpen && onSelectCity && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {onRequestLocation && (
                <button
                  onClick={async () => {
                    const loc = await onRequestLocation();
                    if (loc?.city) {
                      onSelectCity(`${loc.city}, ${loc.country || 'India'}`);
                    }
                    setCityMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100/70 flex items-center gap-2 border-b border-rose-100 transition-colors cursor-pointer"
                >
                  {isLocationLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span>Detect My Location (GPS)</span>
                </button>
              )}
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onSelectCity(c);
                    setCityMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    currentCity === c ? 'text-rose-500 bg-rose-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {permissionState === 'granted' && location?.city ? (
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Location Enabled: {location.city}</span>
            </div>
          ) : (
            onRequestLocation && (
              <button
                onClick={() => onRequestLocation()}
                disabled={isLocationLoading}
                className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold text-[11px] bg-rose-50 hover:bg-rose-100/70 px-2.5 py-1 rounded-full border border-rose-200 transition-colors cursor-pointer"
                title="Grant location permission to find nearest matches"
              >
                {isLocationLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                <span>{permissionState === 'denied' ? 'Location Blocked' : 'Allow Location'}</span>
              </button>
            )
          )}

          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="hidden sm:inline">Real-time Video Service Ready</span>
            <span className="sm:hidden">Live Ready</span>
          </div>
        </div>
      </div>

      {/* Google Maps Real-Time Grounding Date Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
        <div
          onClick={() => onOpenDateExplorer?.(currentCity.split(',')[0])}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-rose-600 rounded-2xl p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-all group border border-emerald-400/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <MapPin className="w-5 h-5 fill-white stroke-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight">Google Maps Real-Time Date Concierge</span>
                <span className="bg-white/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Live Grounding
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Real-time open hours, reviews & navigation for romantic spots near you
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white text-emerald-800 font-bold text-xs px-3.5 py-1.5 rounded-xl group-hover:scale-105 transition-transform shadow-xs shrink-0">
            <span>Explore Spots</span>
            <span>➔</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid of All 9 Profile Cards */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {profiles.map((profile) => {
            const isLiked = likedIds.includes(profile.id);
            return (
              <div
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="group relative aspect-[3/4.2] rounded-[28px] overflow-hidden bg-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer select-none border border-slate-100/50"
              >
                {/* Profile Portrait (Direct uploaded file path) */}
                <ProfileCardImage
                  imagePath={profile.imagePath}
                  spritePosition={profile.spritePosition}
                  altName={profile.name}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />

                {/* Top Overlay: Online Status Badge & Direct Video Call button */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                  {/* Glowing Online Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/55 backdrop-blur-md rounded-full text-white text-[11px] font-semibold border border-white/20 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/40" />
                    <span className="text-emerald-300 font-bold">Online</span>
                  </div>

                  {/* 1-Tap Video Call Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartVideoCall(profile);
                    }}
                    className="pointer-events-auto flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-full backdrop-blur-md shadow-lg shadow-rose-600/30 transition-transform active:scale-95 hover:scale-105 cursor-pointer"
                    title={`Instant Video Call with ${profile.name}`}
                  >
                    <Video className="w-3 h-3 fill-current" />
                    <span>Call</span>
                  </button>
                </div>

                {/* Dark Gradient Overlay at Bottom */}
                <div className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-3.5 sm:px-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10">
                  {/* Name, Age & Verified Shield */}
                  <div className="flex items-center gap-1.5 drop-shadow-xs">
                    <h3 className="text-white text-base sm:text-lg font-bold tracking-tight">
                      {profile.name}, {profile.age}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  </div>

                  {/* Distance & Location */}
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-white/90 font-medium mt-0.5 drop-shadow-xs">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{profile.distance}</span>
                    <span className="text-white/40">·</span>
                    <span className="truncate text-white/80">{profile.location.split(',')[0]}</span>
                  </div>

                  {/* Occupation/Bio Highlight */}
                  <p className="text-[10px] sm:text-[11px] text-white/75 truncate mt-1">
                    {profile.occupation}
                  </p>
                </div>

                {/* Floating White Circular Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(profile.id);
                  }}
                  className={`absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer ${
                    isLiked
                      ? 'text-rose-500 shadow-rose-500/30 ring-2 ring-rose-500/40'
                      : 'text-slate-400 hover:text-rose-500'
                  }`}
                  title={isLiked ? 'Liked' : 'Like profile'}
                >
                  <Heart
                    className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all ${
                      isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'stroke-[2.2]'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
