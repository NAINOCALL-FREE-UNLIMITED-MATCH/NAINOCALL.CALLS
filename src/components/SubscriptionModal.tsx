import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Video,
  MessageCircle,
  Clock,
  ArrowRight,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import {
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  UserSubscription,
  FREE_DAILY_CALLS_LIMIT,
  FREE_DAILY_CHATS_LIMIT,
} from '../types/subscription';
import { UpiPaymentModal } from './UpiPaymentModal';

interface SubscriptionModalProps {
  subscription: UserSubscription;
  userName: string;
  onActivatePlan: (details: {
    planId: SubscriptionPlan['id'];
    transactionId: string;
    utrNumber: string;
    paymentMethod: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi' | 'qr';
    amountPaid: number;
  }) => void;
  onClose: () => void;
  initialSelectedPlanId?: SubscriptionPlan['id'];
  reason?: 'limit_reached' | 'chat_limit' | 'manual';
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  subscription,
  userName,
  onActivatePlan,
  onClose,
  initialSelectedPlanId = 'gold_weekly',
  reason = 'manual',
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan['id']>(initialSelectedPlanId);
  const [showCheckout, setShowCheckout] = useState(false);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handleCheckoutSuccess = (details: {
    planId: SubscriptionPlan['id'];
    transactionId: string;
    utrNumber: string;
    paymentMethod: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi' | 'qr';
    amountPaid: number;
  }) => {
    onActivatePlan(details);
    setShowCheckout(false);
  };

  const isVip = Boolean(
    subscription.isActive &&
      subscription.planId !== 'free' &&
      (!subscription.expiresAt || subscription.expiresAt > Date.now())
  );

  const daysRemaining = subscription.expiresAt
    ? Math.max(0, Math.ceil((subscription.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white p-6 overflow-hidden">
            {/* Background glowing glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Crown className="w-4 h-4 fill-amber-400" />
              </span>
              <span className="text-xs font-black tracking-widest uppercase text-amber-400">
                NAINO CALL VIP PASS
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Unlimited Match Video Calls & Chat
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md leading-relaxed">
              {reason === 'limit_reached'
                ? "You've hit the daily free call limit. Upgrade to VIP to enjoy unlimited video dates without interruptions!"
                : reason === 'chat_limit'
                ? "You've hit the daily free message limit. Upgrade to VIP to chat with all your matches seamlessly!"
                : 'Connect with verified profiles 24/7. No waiting, no call cuts, ultra-HD 1080p peer-to-peer streams.'}
            </p>

            {/* Active Subscription Status Banner if already VIP */}
            {isVip && (
              <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-emerald-400/40 flex items-center justify-between text-xs backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white">{subscription.planName}</span> is currently{' '}
                    <span className="text-emerald-400 font-bold uppercase">Active</span>
                  </div>
                </div>
                <span className="font-semibold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {daysRemaining} days left
                </span>
              </div>
            )}
          </div>

          {/* Plan Cards Grid */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/40 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div
                        className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${
                          plan.isPopular
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-slate-900'
                        }`}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="text-2xl mb-1">{plan.icon}</div>
                      <h3 className="text-sm font-black text-slate-900">{plan.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{plan.durationLabel}</p>

                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900">₹{plan.priceINR}</span>
                        <span className="text-xs line-through text-slate-400">
                          ₹{plan.originalPriceINR}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-rose-600">
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Plan Details & Feature Checklist */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Included with {selectedPlan.name}
                  </h4>
                  <p className="text-xs text-slate-700 font-medium">{selectedPlan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    UPI Instant Access
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {selectedPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison with Free Tier */}
            <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
              <span>
                Free tier: {FREE_DAILY_CALLS_LIMIT} calls/day, {FREE_DAILY_CHATS_LIMIT} chats/day
              </span>
              <span className="font-bold text-rose-600">VIP: 100% Unlimited</span>
            </div>
          </div>

          {/* Modal Footer with UPI CTA */}
          <div className="p-5 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Payment partner brand icons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-1.5 opacity-90">
                  <span className="text-xs font-black px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                    GPay
                  </span>
                  <span className="text-xs font-black px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                    PhonePe
                  </span>
                  <span className="text-xs font-black px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200">
                    Paytm
                  </span>
                  <span className="text-xs font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                    UPI
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  @ meetnow777@ybl
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Pay ₹{selectedPlan.priceINR} via UPI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* UPI Payment Gateway Drawer/Modal */}
      {showCheckout && (
        <UpiPaymentModal
          plan={selectedPlan}
          userName={userName}
          onSuccess={handleCheckoutSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};
