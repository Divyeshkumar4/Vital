import { useState } from 'react';
import { Modal, View } from 'react-native';
import { Screen } from './Screen';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { Pill } from './Pill';
import { useAuth } from '@/store/auth';
import { useBilling } from '@/store/billing';
import { t } from '@/i18n/strings';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Optional reason this paywall was opened (e.g. "Cost analytics is Premium"). */
  reason?: string;
}

/**
 * Reusable paywall sheet. Phase 3.2 stub — purchase flips the row directly.
 * Phase 4 replaces upgrade() with the RevenueCat SDK + webhook flow.
 */
export function Paywall({ visible, onClose, reason }: Props) {
  const user = useAuth((s) => s.user);
  const upgrade = useBilling((s) => s.upgrade);
  const isPremium = useBilling((s) => s.isPremium);
  const loading = useBilling((s) => s.loading);
  const [error, setError] = useState<string | null>(null);

  const onUpgrade = async () => {
    if (!user) return;
    setError(null);
    try {
      await upgrade(user.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <Screen scroll className="gap-5">
        <View className="mt-4 gap-2">
          <Pill label="" value={t('paywall.title')} tone="accent" />
          <Text variant="h1">{t('paywall.title')}</Text>
          <Text variant="caption" className="text-fg-muted">
            {reason ?? t('paywall.subtitle')}
          </Text>
        </View>

        <Card title={t('paywall.perksHeader')}>
          <Text variant="body">
            • {t('paywall.perks')}
          </Text>
        </Card>

        <Text variant="caption" className="text-fg-subtle">
          {t('paywall.stubNotice')}
        </Text>

        {error ? (
          <Text variant="caption" className="text-danger">
            {error}
          </Text>
        ) : null}

        {isPremium ? (
          <>
            <Card>
              <Text variant="h2">{t('paywall.upgradedTitle')}</Text>
              <Text variant="caption" className="text-fg-muted">
                {t('paywall.upgradedSubtitle')}
              </Text>
            </Card>
            <Button title={t('common.continue')} onPress={onClose} />
          </>
        ) : (
          <>
            <Button title={loading ? t('paywall.upgrading') : t('paywall.upgrade')} onPress={onUpgrade} loading={loading} />
            <Button title={t('paywall.notNow')} variant="secondary" onPress={onClose} />
          </>
        )}
      </Screen>
    </Modal>
  );
}
