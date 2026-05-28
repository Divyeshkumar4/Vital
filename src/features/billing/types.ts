/**
 * Phase 3.2 — freemium scaffold. Phase 4 wires this to RevenueCat; v1 has a
 * stub purchase flow that flips the row to 'premium' directly so the rest of
 * the app can be built and demoed end-to-end.
 */

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type SubscriptionSource = 'stub' | 'revenuecat' | 'manual';

export interface Subscription {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  currentPeriodEnd: string | null;
}

/** What free vs premium gets. Master prompt § 8.3.3 + autopilot spec. */
export const PREMIUM_PERKS = [
  'cost_month_view',
  'advanced_routines', // PPL split / advanced programming
  'plan_regenerate_unlimited',
  'unlimited_hype_songs',
] as const;

export type PremiumPerk = (typeof PREMIUM_PERKS)[number];

/** Free-tier caps applied across the app — keep in one place. */
export const FREE_LIMITS = {
  /** Distinct exercises that can have a hype song assigned simultaneously. */
  hypeSongs: 3,
  /** Plan regenerations allowed per day. */
  planRegenerationsPerDay: 1,
} as const;
