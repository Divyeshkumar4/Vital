import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { Button } from '@/components/Button';
import { Paywall } from '@/components/Paywall';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { useBilling } from '@/store/billing';
import { getLogsForDateRange } from '@/features/log/queries';
import { isoDaysAgo, type FoodLog } from '@/features/log/types';
import { sumSpendByDate, type DailySpend } from '@/features/cost/types';
import { formatMoney } from '@/lib/locale/region';
import { t } from '@/i18n/strings';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function CostMonth() {
  const user = useAuth((s) => s.user);
  const profile = useProfile((s) => s.profile);
  const isPremium = useBilling((s) => s.isPremium);
  const currency = profile?.currency ?? 'USD';

  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Open the paywall automatically the first time a non-premium user lands here.
  useEffect(() => {
    if (!isPremium) setShowPaywall(true);
  }, [isPremium]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await getLogsForDateRange(user.id, isoDaysAgo(29), isoDaysAgo(0));
      setLogs(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const spend = useMemo(() => sumSpendByDate(logs, currency), [logs, currency]);

  const days: DailySpend[] = useMemo(() => {
    const byDate = new Map(spend.map((s) => [s.date, s]));
    const out: DailySpend[] = [];
    for (let i = 0; i < 30; i++) {
      const iso = isoDaysAgo(i);
      out.push(
        byDate.get(iso) ?? {
          date: iso,
          amount: 0,
          currency,
          loggedEntries: 0,
          pricedEntries: 0,
        },
      );
    }
    return out;
  }, [spend, currency]);

  const monthTotal = days.reduce((s, d) => s + d.amount, 0);
  const pricedDays = days.filter((d) => d.pricedEntries > 0).length;
  const avg = pricedDays > 0 ? monthTotal / pricedDays : 0;

  return (
    <>
      <Screen scroll className="gap-5">
        <View className="flex-row items-start justify-between mt-2">
          <View className="flex-1">
            <Text variant="caption">{t('cost.monthTitle')}</Text>
            <Text variant="h1">{formatMoney(monthTotal, currency)}</Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="px-3 py-2 rounded-md bg-bg-surface border border-border"
          >
            <Text variant="caption">{t('foods.backToSearch')}</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Pill label={t('cost.perDay')} value={formatMoney(avg, currency)} tone="info" />
          <Pill label={t('cost.perMonth')} value={formatMoney(monthTotal, currency)} tone="accent" />
        </View>

        {error ? (
          <Text variant="caption" className="text-danger">
            {error}
          </Text>
        ) : null}

        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator />
          </View>
        ) : monthTotal === 0 ? (
          <Card>
            <Text variant="body">{t('cost.monthEmpty')}</Text>
          </Card>
        ) : (
          days
            .filter((d) => d.loggedEntries > 0)
            .map((d) => (
              <View
                key={d.date}
                className="rounded-xl p-4 border border-border bg-bg-surface flex-row items-center justify-between"
              >
                <View>
                  <Text variant="body">{formatDate(d.date)}</Text>
                  <Text variant="caption" className="text-fg-muted">
                    {d.pricedEntries > 0
                      ? `${d.pricedEntries} of ${d.loggedEntries} entries priced`
                      : `${d.loggedEntries} entries (${t('cost.untracked')})`}
                  </Text>
                </View>
                <Text variant="body">{formatMoney(d.amount, currency)}</Text>
              </View>
            ))
        )}

        {!isPremium ? (
          <Button title={t('paywall.upgrade')} onPress={() => setShowPaywall(true)} />
        ) : null}
      </Screen>
      <Paywall
        visible={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          if (!isPremium) router.back();
        }}
        reason={t('cost.monthAccessGated')}
      />
    </>
  );
}
