import { supabase } from '@/lib/supabase/client';
import type { Subscription } from './types';

interface SubRow {
  user_id: string;
  tier: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  source: 'stub' | 'revenuecat' | 'manual';
  current_period_end: string | null;
}

function rowToSub(r: SubRow): Subscription {
  return {
    userId: r.user_id,
    tier: r.tier,
    status: r.status,
    source: r.source,
    currentPeriodEnd: r.current_period_end,
  };
}

/** Returns the user's subscription. Missing row = free tier (and we create one). */
export async function fetchSubscription(userId: string): Promise<Subscription> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return rowToSub(data as SubRow);
  // Lazy-create the free row so the rest of the app can rely on it existing.
  const { data: created, error: insertError } = await supabase
    .from('subscriptions')
    .insert({ user_id: userId, tier: 'free', status: 'active', source: 'stub' })
    .select('*')
    .single();
  if (insertError) throw insertError;
  return rowToSub(created as SubRow);
}

/**
 * Phase 3 stub: flips the row to premium directly. Phase 4 deletes this and
 * routes the upgrade through the RevenueCat SDK + webhook flow.
 */
export async function purchasePremiumStub(userId: string): Promise<Subscription> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const oneYear = new Date();
  oneYear.setFullYear(oneYear.getFullYear() + 1);
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        tier: 'premium',
        status: 'active',
        source: 'stub',
        current_period_end: oneYear.toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return rowToSub(data as SubRow);
}

/** Phase 3 stub: revert to free tier (used by Settings > Cancel Premium). */
export async function cancelPremiumStub(userId: string): Promise<Subscription> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        tier: 'free',
        status: 'cancelled',
        source: 'stub',
        current_period_end: null,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return rowToSub(data as SubRow);
}
