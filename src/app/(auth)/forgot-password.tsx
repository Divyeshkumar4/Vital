import { useState } from 'react';
import { View } from 'react-native';
import { Link, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase/client';
import { t } from '@/i18n/strings';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSend = async () => {
    setError(null);
    const clean = email.trim();
    if (!clean) {
      setError(t('auth.resetNeedEmail'));
      return;
    }
    if (!supabase) {
      setError(t('errors.notConfigured'));
      return;
    }
    setLoading(true);
    // Sends the recovery email. With the Supabase recovery template set to show
    // {{ .Token }}, the user receives a 6-digit code we verify on the next screen.
    const { error: sendErr } = await supabase.auth.resetPasswordForEmail(clean);
    setLoading(false);
    if (sendErr) {
      setError(sendErr.message);
      return;
    }
    router.push({ pathname: '/(auth)/reset-password', params: { email: clean } });
  };

  return (
    <Screen scroll>
      <View className="gap-2 mt-8">
        <Text variant="display">{t('auth.forgotTitle')}</Text>
        <Text variant="caption">{t('auth.forgotSubtitle')}</Text>
      </View>

      <View className="gap-4 mt-8">
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={error ?? undefined}
        />
        <Button title={t('auth.sendCode')} onPress={onSend} loading={loading} />

        <Link href="/(auth)/sign-in" className="mt-4 text-center">
          <Text variant="caption">{t('auth.backToSignIn')}</Text>
        </Link>
      </View>
    </Screen>
  );
}
