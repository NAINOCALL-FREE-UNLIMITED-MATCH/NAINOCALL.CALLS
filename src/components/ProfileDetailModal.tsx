import React from 'react';
import { X, MapPin, Video, MessageCircle, Heart, ShieldCheck, Sparkles, Crown } from 'lucide-react';
import { DatingProfile } from '../data/profiles';
import { ProfileCardImage } from './ProfileCardImage';

interface ProfileDetailModalProps {
  profile: DatingProfile;
  isLiked: boolean;
  onClose: () => void;
  onLikeToggle: (id: string) => void;
  onStartVideoCall: (profile: DatingProfile) => void;
  onSendMessage: (profile: DatingProfile) => void;
  onPlanDate?: (profile: DatingProfile) => void;
  isVip?: boolean;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  isLiked,
  onClose,
  onLikeToggle,
  onStartVideoCall,
  onSendMessage,
  onPlanDate,
  isVip = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Photo Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
          <ProfileCardImage
            imagePath={profile.imagePath}
            spritePosition={profile.spritePosition}
            altName={profile.name}
            className="w-full h-full"
          />

          {/* Top action buttons */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bottom scrim with Name and Age */}
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {profile.name}, {profile.age}
              </h2>
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{profile.distance}</span>
              <span>·</span>
              <span>{profile.location}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{profile.occupation}</p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{profile.bio}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Passions & Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.passions.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Quick status */}
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-700">Online now for video chat</span>
            </div>
            <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> High Match
            </span>
          </div>

          {/* Google Maps Date Spot Trigger */}
          {onPlanDate && (
            <button
              onClick={() => onPlanDate(profile)}
              className="w-full p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-rose-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-left hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Plan Date near {profile.location.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Google Maps Real-Time Grounding & Live Hours
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white/90 border border-emerald-200 px-3 py-1.5 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
                Explore Spots ➔
              </span>
            </button>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
          {/* Like button */}
          <button
            onClick={() => onLikeToggle(profile.id)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25'
                : 'bg-white text-slate-600 hover:text-rose-500 border-slate-200 hover:border-rose-200 shadow-xs'
            }`}
            title={isLiked ? 'Liked' : 'Like'}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Chat message button */}
          <button
            onClick={() => onSendMessage(profile)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-2xl transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </button>

          {/* Video call button */}
          <button
            onClick={() => onStartVideoCall(profile)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold text-xs rounded-2xl shadow-md shadow-rose-500/30 transition-all cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>{isVip ? 'VIP Call' : 'Video Call'}</span>
            {isVip && <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />}
          </button>
        </div>
      </div>
    </div>
  );
};
