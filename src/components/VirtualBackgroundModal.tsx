import React from 'react';
import { X, Sparkles, Check, Image as ImageIcon, Sliders } from 'lucide-react';
import { VirtualBackgroundType } from '../types/meeting';

interface VirtualBackgroundModalProps {
  currentBackground: VirtualBackgroundType;
  onSelectBackground: (type: VirtualBackgroundType) => void;
  onClose: () => void;
}

interface BackgroundOption {
  id: VirtualBackgroundType;
  title: string;
  category: 'Realistic 3D Rooms' | 'Studio Filters';
  thumbnailUrl?: string;
  description: string;
}

const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'none',
    title: 'Natural Camera',
    category: 'Studio Filters',
    description: 'No filters or virtual overlay',
  },
  {
    id: 'blur',
    title: 'Depth Blur',
    category: 'Studio Filters',
    description: 'Soft background defocus',
  },
  {
    id: 'loft',
    title: 'Architectural Loft',
    category: 'Realistic 3D Rooms',
    thumbnailUrl: '/src/assets/images/bg_modern_loft_1793126797541.jpg',
    description: 'Industrial loft with warm ambient lamps',
  },
  {
    id: 'office',
    title: 'Skyline Office',
    category: 'Realistic 3D Rooms',
    thumbnailUrl: '/src/assets/images/bg_executive_office_1793126799788.jpg',
    description: 'Minimalist high-rise view overlooking city',
  },
  {
    id: 'bookshelf',
    title: 'Nordic Study',
    category: 'Realistic 3D Rooms',
    thumbnailUrl: '/src/assets/images/bg_nordic_bookshelf_1793126798876.jpg',
    description: 'Warm oak library shelves and reading desk',
  },
  {
    id: 'warm_studio',
    title: 'Warm Studio Tone',
    category: 'Studio Filters',
    description: 'Warm cinematic portrait grading',
  },
  {
    id: 'cinematic_bw',
    title: 'Monochrome Film',
    category: 'Studio Filters',
    description: 'High-contrast black & white aesthetic',
  },
];

export const VirtualBackgroundModal: React.FC<VirtualBackgroundModalProps> = ({
  currentBackground,
  onSelectBackground,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">Virtual Backgrounds & Effects</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Realistic Rooms */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Studio Environments</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BACKGROUND_OPTIONS.filter((o) => o.category === 'Realistic 3D Rooms').map((opt) => {
                const isSelected = currentBackground === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectBackground(opt.id)}
                    className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-video w-full relative bg-slate-950 overflow-hidden">
                      {opt.thumbnailUrl ? (
                        <img
                          src={opt.thumbnailUrl}
                          alt={opt.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-slate-900/90">
                      <p className="text-xs font-semibold text-slate-200 truncate">{opt.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Studio Filters */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Filters & Focus</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BACKGROUND_OPTIONS.filter((o) => o.category === 'Studio Filters').map((opt) => {
                const isSelected = currentBackground === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectBackground(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/40 text-slate-100'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{opt.title}</p>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Selected effects apply to your local camera stream in real time.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
