import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Star,
  Clock,
  Search,
  Sparkles,
  ExternalLink,
  Phone,
  Send,
  Video,
  Share2,
  Check,
  RefreshCw,
  Sliders,
  Eye,
} from 'lucide-react';
import { GroundedPlace, VERIFIED_MUMBAI_DATE_SPOTS } from '../data/mapsRealtimeData';
import { DatingProfile, INITIAL_PROFILES } from '../data/profiles';

interface MapsDateSpotExplorerProps {
  initialLocation?: string;
  initialPartner?: DatingProfile | null;
  onStartVideoCall?: (profile: DatingProfile) => void;
  onSendMessage?: (partnerName: string, placeName: string, mapUrl: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All Date Spots', icon: '✨' },
  { id: 'cafe', label: 'Cozy Cafes & Coffee', icon: '☕' },
  { id: 'romantic', label: 'Romantic Dining', icon: '🍷' },
  { id: 'sunset', label: 'Sunset & Seaside', icon: '🌅' },
  { id: 'cocktail', label: 'Rooftops & Cocktails', icon: '🍸' },
  { id: 'bakery', label: 'Desserts & Bakeries', icon: '🍰' },
];

const LOCATIONS = [
  { id: 'all', label: 'All Mumbai Spots' },
  { id: 'Bandra West', label: 'Bandra West (Aarohi & Zoya)' },
  { id: 'Juhu', label: 'Juhu Beach (Sneha)' },
  { id: 'Colaba', label: 'Colaba & South Mumbai (Tanvi)' },
  { id: 'Worli', label: 'Worli Sea Face (Ishita)' },
  { id: 'Powai', label: 'Powai Lake (Pooja)' },
  { id: 'Andheri', label: 'Andheri & Versova (Meera & Kiara)' },
];

export const MapsDateSpotExplorer: React.FC<MapsDateSpotExplorerProps> = ({
  initialLocation,
  initialPartner,
  onStartVideoCall,
  onSendMessage,
  onClose,
  isModal = false,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>(
    initialLocation || (initialPartner ? initialPartner.location.split(',')[0].trim() : 'Bandra West')
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [places, setPlaces] = useState<GroundedPlace[]>(VERIFIED_MUMBAI_DATE_SPOTS);
  const [selectedPlace, setSelectedPlace] = useState<GroundedPlace | null>(VERIFIED_MUMBAI_DATE_SPOTS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liveSummary, setLiveSummary] = useState<string>(
    'Accessing real-time Google Maps data for curated romantic rendezvous, cafes, and rooftop spots across Mumbai.'
  );
  const [isGeminiGrounded, setIsGeminiGrounded] = useState<boolean>(true);
  const [copiedPlaceId, setCopiedPlaceId] = useState<string | null>(null);

  // Fetch or filter spots when location or query changes
  const fetchGroundedSpots = async (queryText?: string, locText?: string) => {
    setIsLoading(true);
    const q = queryText !== undefined ? queryText : searchQuery;
    const loc = locText !== undefined ? locText : selectedLocation;

    try {
      const res = await fetch('/api/places/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q || activeCategory,
          location: loc,
          partnerName: initialPartner ? initialPartner.name : '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.places && data.places.length > 0) {
          setPlaces(data.places);
          setSelectedPlace(data.places[0]);
        }
        if (data.summary) {
          setLiveSummary(data.summary);
        }
        setIsGeminiGrounded(Boolean(data.isGeminiGrounded));
      }
    } catch (e) {
      console.warn('Using client-side verified spots:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroundedSpots(searchQuery, selectedLocation);
  }, [selectedLocation, activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroundedSpots(searchQuery, selectedLocation);
  };

  const handleSharePlace = (place: GroundedPlace) => {
    const text = `Hey! Found this great date spot on Google Maps: ${place.name} (${place.address}) - ${place.googleMapsUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPlaceId(place.id);
      setTimeout(() => setCopiedPlaceId(null), 2500);
    }
    if (onSendMessage && initialPartner) {
      onSendMessage(initialPartner.name, place.name, place.googleMapsUrl);
    }
  };

  return (
    <div
      className={`bg-[#F8F9FA] text-slate-900 flex flex-col font-sans ${
        isModal
          ? 'fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6'
          : 'min-h-screen pb-24'
      }`}
    >
      <div
        className={`w-full bg-white flex flex-col ${
          isModal
            ? 'max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-200'
            : 'max-w-4xl mx-auto shadow-xs border-x border-slate-200'
        }`}
      >
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <MapPin className="w-5 h-5 fill-white stroke-rose-600 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  Google Maps Date Spot Explorer
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Grounding
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time verified spots, live hours, reviews & directions
                {initialPartner && (
                  <span className="text-rose-600 font-semibold"> · Dating with {initialPartner.name}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchGroundedSpots()}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh live Google Maps info"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        {/* Live Grounding Banner */}
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 px-4 sm:px-6 py-3 border-b border-rose-100/70 flex items-start gap-3">
          <div className="p-1.5 bg-rose-500 rounded-lg text-white shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-rose-900 mr-1.5">
              {isGeminiGrounded ? '⚡ Google Maps Grounded Live AI:' : '🗺️ Google Maps Verified Data:'}
            </span>
            {liveSummary}
          </div>
        </div>

        {/* Search & Location Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            {/* Location Dropdown */}
            <div className="sm:w-56 shrink-0 relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter date spots by neighborhood"
                className="w-full h-11 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.label}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3.5 pointer-events-none" />
              <div className="absolute right-3 top-4 pointer-events-none text-slate-400 text-[10px]">▼</div>
            </div>

            {/* Keyword Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search date spots (e.g. cozy coffee, romantic beach, rooftop drinks)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Search Spots</span>
                </>
              )}
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery(cat.id === 'all' ? '' : cat.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                  activeCategory === cat.id
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Two columns on Desktop (Interactive Visual Map + List) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Interactive Visual Map Preview Banner */}
          <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-slate-200 shadow-inner group">
            {/* Map Background Pattern */}
            <div
              className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 20px)',
              }}
            />

            {/* Simulated Coastline & Roads */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                <path d="M 0,160 Q 120,130 200,90 T 400,60" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <path d="M 50,0 Q 150,80 180,200" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 0,80 L 400,140" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Dynamic Map Pins */}
            <div className="absolute inset-0 flex items-center justify-around px-8">
              {places.slice(0, 5).map((p, idx) => {
                const isSelected = selectedPlace?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlace(p)}
                    className={`group/pin relative flex flex-col items-center transition-transform cursor-pointer ${
                      isSelected ? 'scale-115 z-20' : 'hover:scale-105 opacity-85 z-10'
                    }`}
                  >
                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md mb-1 whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-rose-500 text-white ring-2 ring-white'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-700 group-hover/pin:bg-slate-800'
                      }`}
                    >
                      {p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name}
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                        isSelected
                          ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 animate-bounce'
                          : 'bg-white text-rose-600 ring-2 ring-slate-900'
                      }`}
                    >
                      <MapPin className="w-4 h-4 fill-current" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Overlay Info on Map */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-slate-200">
                  {places.length} Google Maps Places in {selectedLocation}
                </span>
              </div>
              {selectedPlace && (
                <a
                  href={selectedPlace.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
                >
                  <span>Open Full Google Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Place Cards List */}
          <div className="space-y-4">
            {places.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              const isCopied = copiedPlaceId === place.id;

              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className={`p-4 sm:p-5 rounded-2xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-white border-rose-400 shadow-md ring-2 ring-rose-500/10'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Main Place Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {place.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {place.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {place.openStatus}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{place.address}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5 text-slate-600">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{place.rating}</span>
                          <span className="text-slate-400 font-normal">({place.reviewsCount})</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-slate-700">{place.priceLevel}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Best: {place.recommendedTime}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-rose-600 font-semibold">{place.distanceKm} km away</span>
                      </div>
                    </div>

                    {/* Quick Maps Actions */}
                    <div className="flex items-center sm:flex-col gap-2 shrink-0">
                      <a
                        href={place.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 sm:w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5 text-rose-400" />
                        <span>Directions</span>
                      </a>

                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Date Vibe & Highlight Tags */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100/80">
                      <div className="font-bold text-rose-900 flex items-center gap-1 mb-0.5">
                        <span>💡 Date Vibe & Ambience</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{place.vibe}</p>
                    </div>

                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100/80">
                      <div className="font-bold text-amber-900 flex items-center gap-1 mb-0.5">
                        <span>🎯 First Date Tip</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{place.dateTip}</p>
                    </div>
                  </div>

                  {/* Highlights Tags & Action Bar */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {place.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSharePlace(place);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Copy Google Maps invite link"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Link Copied!' : 'Share Spot'}</span>
                      </button>

                      {initialPartner && onStartVideoCall && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartVideoCall(initialPartner);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 hover:from-rose-600 hover:to-rose-700 transition-all cursor-pointer shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Call {initialPartner.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <footer className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Grounded via Google Maps Services & Places Data</span>
          </div>
          <span className="font-medium text-slate-400">NAINO CALL Concierge</span>
        </footer>
      </div>
    </div>
  );
};
