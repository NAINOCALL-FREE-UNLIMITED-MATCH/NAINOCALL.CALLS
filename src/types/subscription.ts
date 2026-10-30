export type SubscriptionPlanId = 'free' | 'daily_pass' | 'gold_weekly' | 'platinum_monthly';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  badge?: string;
  priceINR: number;
  originalPriceINR: number;
  durationDays: number;
  durationLabel: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  accentColor: string;
  gradient: string;
  icon: string;
}

export interface UserSubscription {
  planId: SubscriptionPlanId;
  planName: string;
  isActive: boolean;
  startedAt: number | null;
  expiresAt: number | null;
  dailyCallsUsed: number;
  dailyChatsUsed: number;
  lastResetDate: string; // YYYY-MM-DD
  unlimitedCalls: boolean;
  unlimitedChats: boolean;
  transactionId?: string;
  utrNumber?: string;
  paymentMethod?: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi' | 'qr';
  amountPaid?: number;
  purchasedAt?: number;
}

export const FREE_DAILY_CALLS_LIMIT = 2;
export const FREE_DAILY_CHATS_LIMIT = 5;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'daily_pass',
    name: 'VIP Daily Pass',
    badge: 'Quick Trial',
    priceINR: 49,
    originalPriceINR: 99,
    durationDays: 1,
    durationLabel: '24 Hours',
    description: 'Instant 24-hour pass for weekend video dates and unlimited conversations.',
    features: [
      'Unlimited Match Video Calls for 24h',
      'Unlimited Direct In-App Chat',
      'No Call Time Limits (Talk All Night)',
      'Direct Peer-to-Peer 1080p HD Video',
      'Floating Reaction Emojis Unlocked',
    ],
    accentColor: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    icon: '⚡',
  },
  {
    id: 'gold_weekly',
    name: 'Gold Weekly VIP',
    badge: 'Most Popular',
    priceINR: 199,
    originalPriceINR: 399,
    durationDays: 7,
    durationLabel: '7 Days',
    description: 'Our most loved package for regular dating, omegle roulette, and private video rooms.',
    features: [
      'Unlimited Match Video Calls (All 7 Days)',
      'Unlimited Chats & Instant Photo Previews',
      'Omegle Video Roulette Unlimited Instant Skip',
      'Golden VIP Crown on Your Profile & Video',
      'Google Maps Live Date Spot Concierge Access',
      'Priority Matching Algorithm in Discover',
    ],
    isPopular: true,
    accentColor: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    icon: '👑',
  },
  {
    id: 'platinum_monthly',
    name: 'Platinum VIP Elite',
    badge: 'Best Value · 60% OFF',
    priceINR: 499,
    originalPriceINR: 999,
    durationDays: 30,
    durationLabel: '30 Days',
    description: 'The ultimate all-inclusive pass for serious daters. Full VIP perks with zero limits.',
    features: [
      'Unlimited Video Calls 24/7 (30 Days)',
      'Unlimited Direct Messages & Priority Delivery',
      'Unlimited Omegle Roulette Matches & Filters',
      'All 3D Studio & Virtual Backgrounds Unlocked',
      'Full Lossless WebRTC Recording Access',
      'Elite Platinum Badge & Verified Checkmark',
      'Dedicated Priority Customer Support',
    ],
    accentColor: 'indigo',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    icon: '💎',
  },
];
