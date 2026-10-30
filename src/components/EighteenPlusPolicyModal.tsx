import React from 'react';
import { ShieldAlert, ShieldCheck, Check, X, AlertTriangle, Lock, UserCheck, EyeOff } from 'lucide-react';

interface EighteenPlusPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
  showAgreeButton?: boolean;
}

export const EighteenPlusPolicyModal: React.FC<EighteenPlusPolicyModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  showAgreeButton = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white font-black text-xl shadow-inner">
              18+
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">18+ Safety & Age Policy</h2>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Mandatory
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Adult Video Dating & Community Standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Policy Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Key Rule 1: Age verification */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Strict 18+ Age Restriction</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                NAINO CALL is strictly intended for adults aged 18 and older. We do not permit minors to create profiles, browse matches, or join WebRTC video calls. Any account belonging to an individual under 18 is subject to immediate permanent suspension.
              </p>
            </div>
          </div>

          {/* Key Rule 2: Mutual consent */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Mutual Consent & Zero-Tolerance Harassment</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                All interactions must be consensual. Non-consensual sexual content, uninvited explicit exposure, extortion, harassment, hate speech, or sharing another person's personal contact details without permission will lead to an immediate ban and IP blacklist.
              </p>
            </div>
          </div>

          {/* Key Rule 3: Privacy and recording */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Anti-Recording & Privacy Protections</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Screen recording or distributing another user's live video stream without their explicit, prior consent is illegal in many jurisdictions and strictly forbidden. Video calls utilize encrypted WebRTC peer connections.
              </p>
            </div>
          </div>

          {/* Key Rule 4: Reporting and safety */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Immediate Next & Report Tools</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                During any Omegle roulette or profile call, you have instantaneous controls to disconnect, skip partner, mute audio, or report misconduct.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-1">
            Last Updated: 2026 · NAINO CALL Compliance & Trust Safety Standards
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>

          {showAgreeButton ? (
            <button
              onClick={() => {
                onAgree?.();
                onClose();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>I Confirm I Am 18+ & Agree</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Understood
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
