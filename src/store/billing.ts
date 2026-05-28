import { create } from 'zustand';
import {
  cancelPremiumStub,
  fetchSubscription,
  purchasePremiumStub,
} from '@/features/billing/queries';
import type { Subscription } from '@/features/billing/types';

interface BillingState {
  subscription: Subscription | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  isPremium: boolean;
  load: (userId: string) => Promise<void>;
  upgrade: (userId: string) => Promise<void>;
  cancel: (userId: string) => Promise<void>;
  clear: () => void;
}

function isPremiumActive(s: Subscription | null): boolean {
  if (!s) return false;
  return s.tier === 'premium' && s.status === 'active';
}

export const useBilling = create<BillingState>((set) => ({
  subscription: null,
  loading: false,
  loaded: false,
  error: null,
  isPremium: false,

  load: async (userId) => {
    set({ loading: true, error: null });
    try {
      const sub = await fetchSubscription(userId);
      set({ subscription: sub, isPremium: isPremiumActive(sub), loaded: true, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : String(e),
        loaded: true,
        loading: false,
      });
    }
  },

  upgrade: async (userId) => {
    set({ loading: true, error: null });
    try {
      const sub = await purchasePremiumStub(userId);
      set({ subscription: sub, isPremium: isPremiumActive(sub), loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
      throw e;
    }
  },

  cancel: async (userId) => {
    set({ loading: true, error: null });
    try {
      const sub = await cancelPremiumStub(userId);
      set({ subscription: sub, isPremium: isPremiumActive(sub), loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
      throw e;
    }
  },

  clear: () => set({ subscription: null, loaded: false, isPremium: false, error: null }),
}));
