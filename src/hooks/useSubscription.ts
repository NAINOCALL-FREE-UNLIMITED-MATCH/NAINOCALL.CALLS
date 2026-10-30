import { useState, useEffect, useCallback } from 'react';
import {
  UserSubscription,
  SubscriptionPlanId,
  SUBSCRIPTION_PLANS,
  FREE_DAILY_CALLS_LIMIT,
  FREE_DAILY_CHATS_LIMIT,
} from '../types/subscription';

const STORAGE_KEY = 'nainocall_subscription';

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  planId: 'free',
  planName: 'Free Member',
  isActive: false,
  startedAt: null,
  expiresAt: null,
  dailyCallsUsed: 0,
  dailyChatsUsed: 0,
  lastResetDate: getTodayString(),
  unlimitedCalls: false,
  unlimitedChats: false,
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UserSubscription = JSON.parse(stored);
        const today = getTodayString();

        // Check if plan expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          return {
            ...DEFAULT_SUBSCRIPTION,
            dailyCallsUsed: parsed.lastResetDate === today ? parsed.dailyCallsUsed : 0,
            dailyChatsUsed: parsed.lastResetDate === today ? parsed.dailyChatsUsed : 0,
            lastResetDate: today,
          };
        }

        // Reset daily limits if new day
        if (parsed.lastResetDate !== today) {
          return {
            ...parsed,
            dailyCallsUsed: 0,
            dailyChatsUsed: 0,
            lastResetDate: today,
          };
        }

        return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SUBSCRIPTION;
  });

  // Persist whenever subscription changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
    } catch {
      // quiet fallback
    }
  }, [subscription]);

  const isVip = Boolean(
    subscription.isActive &&
      subscription.planId !== 'free' &&
      (!subscription.expiresAt || subscription.expiresAt > Date.now())
  );

  const callsRemainingToday = isVip
    ? Infinity
    : Math.max(0, FREE_DAILY_CALLS_LIMIT - subscription.dailyCallsUsed);

  const chatsRemainingToday = isVip
    ? Infinity
    : Math.max(0, FREE_DAILY_CHATS_LIMIT - subscription.dailyChatsUsed);

  const canMakeVideoCall = useCallback((): boolean => {
    if (isVip) return true;
    return subscription.dailyCallsUsed < FREE_DAILY_CALLS_LIMIT;
  }, [isVip, subscription.dailyCallsUsed]);

  const canSendChatMessage = useCallback((): boolean => {
    if (isVip) return true;
    return subscription.dailyChatsUsed < FREE_DAILY_CHATS_LIMIT;
  }, [isVip, subscription.dailyChatsUsed]);

  const recordVideoCall = useCallback(() => {
    if (isVip) return;
    setSubscription((prev) => ({
      ...prev,
      dailyCallsUsed: prev.dailyCallsUsed + 1,
    }));
  }, [isVip]);

  const recordChatMessage = useCallback(() => {
    if (isVip) return;
    setSubscription((prev) => ({
      ...prev,
      dailyChatsUsed: prev.dailyChatsUsed + 1,
    }));
  }, [isVip]);

  const activateSubscription = useCallback(
    (params: {
      planId: SubscriptionPlanId;
      transactionId: string;
      utrNumber: string;
      paymentMethod: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other_upi' | 'qr';
      amountPaid: number;
    }) => {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === params.planId) || SUBSCRIPTION_PLANS[1];
      const now = Date.now();
      const expires = now + plan.durationDays * 24 * 60 * 60 * 1000;

      const updated: UserSubscription = {
        planId: plan.id,
        planName: plan.name,
        isActive: true,
        startedAt: now,
        expiresAt: expires,
        dailyCallsUsed: 0,
        dailyChatsUsed: 0,
        lastResetDate: getTodayString(),
        unlimitedCalls: true,
        unlimitedChats: true,
        transactionId: params.transactionId,
        utrNumber: params.utrNumber,
        paymentMethod: params.paymentMethod,
        amountPaid: params.amountPaid,
        purchasedAt: now,
      };

      setSubscription(updated);
      return updated;
    },
    []
  );

  const cancelSubscription = useCallback(() => {
    setSubscription(DEFAULT_SUBSCRIPTION);
  }, []);

  return {
    subscription,
    isVip,
    callsRemainingToday,
    chatsRemainingToday,
    canMakeVideoCall,
    canSendChatMessage,
    recordVideoCall,
    recordChatMessage,
    activateSubscription,
    cancelSubscription,
  };
}
