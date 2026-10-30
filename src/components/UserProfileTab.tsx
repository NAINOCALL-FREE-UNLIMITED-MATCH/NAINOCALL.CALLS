import React, { useState } from 'react';
import { Camera, Settings, ShieldCheck, Video, Heart, Sliders, User, Calendar, MapPin, Sparkles, CheckCircle2, FileText, AlertTriangle, LogOut, Edit3, Crown, Zap, ArrowRight, Check } from 'lucide-react';
import { UserProfile } from '../types/user';
import { UserSubscription, FREE_DAILY_CALLS_LIMIT, FREE_DAILY_CHATS_LIMIT } from '../types/subscription';

interface UserProfileTabProps {
  userProfile: UserProfile | null;
  subscription: UserSubscription;
  onOpenSubscription: () => void;
  onOpenSignUp: () => void;
  onOpenSettings: () => void;
  onStartOmegle: () => void;
  onOpenPolicy: () => void;
  onSignOut: () => void;
}

export const UserProfileTab: React.FC<UserProfileTabProps> = ({
  userProfile,
  subscription,
  onOpenSubscription,
  onOpenSignUp,
  onOpenSettings,
  onStartOmegle,
  onOpenPolicy,
  onSignOut,
}) => {
  const name = userProfile?.name || 'Aishwarya';
  const age = userProfile?.age || 24;
  const city = userProfile?.city || 'Mumbai';
  const country = userProfile?.country || 'India';
  const bio = userProfile?.bio || 'Loves rooftop cafes, sunset walks, and live video conversations.';
  const interests = userProfile?.interests || ['☕ Coffee', '🎵 Music', '✈️ Travel'];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 pb-28 p-4 sm:p-6 max-w-lg mx-auto selection:bg-rose-500 selection:text-white">
      {/* 18+ Verified Member Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4 relative overflow-hidden">
        {/* Top 18+ Compliance Banner */}
        <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 py-1.5 px-4 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>18+ Verified Adult Profile</span>
        </div>

        {/* Avatar */}
        <div className="pt-4">
          <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl font-black text-white">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <button
              onClick={onOpenSignUp}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center border-2 border-slate-100 shadow-md cursor-pointer hover:bg-slate-50 transition-colors"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </div>

        {/* Name & Age */}
        <div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {name}, {age}
            </h2>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200"
              title="Age 18+ verified via Date of Birth"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>18+ Verified</span>
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {city}, {country}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{userProfile?.gender || 'Woman'}</span>
            <span aria-hidden="true">·</span>
            <span>Looking for {userProfile?.lookingFor || 'Everyone'}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center leading-relaxed">
          "{bio}"
        </p>

        {/* Interests */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {interests.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-[11px] font-medium text-rose-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onOpenSignUp}
            className="p-3 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/80 rounded-2xl flex flex-col items-center gap-1 text-rose-700 transition-colors cursor-pointer"
          >
            <Edit3 className="w-5 h-5 text-rose-600" />
            <span className="text-xs font-bold">Edit Profile</span>
          </button>

          <button
            onClick={onStartOmegle}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl flex flex-col items-center gap-1 text-blue-700 transition-colors cursor-pointer"
          >
            <Video className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold">Omegle Roulette</span>
          </button>
        </div>
      </div>

      {/* NAINO CALL VIP Subscription Hub Card */}
      <div className="mt-4 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white rounded-3xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Crown className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                NAINO CALL Subscription
              </h3>
              <p className="text-[11px] text-slate-300">
                {Boolean(subscription.isActive && subscription.planId !== 'free')
                  ? 'Unlimited Video Calls & Chat Active'
                  : 'Free Member Tier'}
              </p>
            </div>
          </div>

          {Boolean(subscription.isActive && subscription.planId !== 'free') ? (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>VIP Active</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              Basic Limit
            </span>
          )}
        </div>

        {/* Quota / Status Details */}
        {Boolean(subscription.isActive && subscription.planId !== 'free') ? (
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-sm space-y-2 mb-3 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Active Plan:</span>
              <span className="font-bold text-amber-300">{subscription.planName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Video Calling:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> 100% Unlimited
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Direct Match Chat:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> 100% Unlimited
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Validity:</span>
              <span className="font-semibold text-white">
                {subscription.expiresAt
                  ? `${Math.max(0, Math.ceil((subscription.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining`
                  : 'Active'}
              </span>
            </div>
            {subscription.transactionId && (
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-white/10">
                <span>Ref: {subscription.transactionId}</span>
                <span className="uppercase">Paid to meetnow777@ybl via {subscription.paymentMethod || 'UPI'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-sm space-y-2 mb-3 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Daily Video Calls:</span>
              <span className="font-bold text-white">
                {Math.max(0, FREE_DAILY_CALLS_LIMIT - subscription.dailyCallsUsed)} / {FREE_DAILY_CALLS_LIMIT} remaining
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Daily Chat Messages:</span>
              <span className="font-bold text-white">
                {Math.max(0, FREE_DAILY_CHATS_LIMIT - subscription.dailyChatsUsed)} / {FREE_DAILY_CHATS_LIMIT} remaining
              </span>
            </div>
            <div className="text-[11px] text-amber-300 flex items-center gap-1 pt-1 border-t border-white/10">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>Upgrade to unlock Unlimited Calls & Chat via UPI starting at ₹49</span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onOpenSubscription}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>
            {Boolean(subscription.isActive && subscription.planId !== 'free')
              ? 'Manage / Extend VIP Pass'
              : 'Upgrade to Unlimited Calls & Chat via UPI'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 18+ Policy & Compliance Section */}
      <div className="mt-4 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
              18+
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Safety & 18+ Adult Policy
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Compliant
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          You are registered as an age-verified adult member. All video dating, Omegle roulette sessions, and peer connections strictly enforce mutual consent, anti-harassment, and zero-tolerance for illicit conduct.
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <button
            onClick={onOpenPolicy}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Read 18+ Safety & Community Policy</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Reset / Sign Out Options */}
      <div className="mt-4 flex items-center justify-between px-2 text-xs">
        <button
          onClick={onOpenPolicy}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Age Policy Terms
        </button>

        <button
          onClick={onSignOut}
          className="text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch / Reset Profile</span>
        </button>
      </div>
    </div>
  );
};
