import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';

interface DiscoveryFiltersModalProps {
  onClose: () => void;
  onApply: (distance: number, minAge: number, maxAge: number) => void;
}

export const DiscoveryFiltersModal: React.FC<DiscoveryFiltersModalProps> = ({
  onClose,
  onApply,
}) => {
  const [distance, setDistance] = useState(10);
  const [minAge, setMinAge] = useState(20);
  const [maxAge, setMaxAge] = useState(30);
  const [onlineOnly, setOnlineOnly] = useState(true);

  const handleApply = () => {
    onApply(distance, minAge, maxAge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900">Discovery Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Maximum Distance */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Maximum Distance</span>
            <span className="text-rose-500 font-mono">{distance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Age Range</span>
            <span className="text-rose-500 font-mono">{minAge} - {maxAge}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="18"
              max="40"
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <input
              type="range"
              min="20"
              max="50"
              value={maxAge}
              onChange={(e) => setMaxAge(Math.max(minAge, Number(e.target.value)))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Online Now */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-800">Online Profiles Only</p>
            <p className="text-[11px] text-slate-400">Ready for instant video calls</p>
          </div>
          <input
            type="checkbox"
            checked={onlineOnly}
            onChange={(e) => setOnlineOnly(e.target.checked)}
            className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
          />
        </div>

        {/* Apply */}
        <button
          onClick={handleApply}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-102 cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
