import { useState } from 'react';
import { View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/store/auth';
import { t } from '@/i18n/strings';

const MIN_PASSWORD = 8;

export default function ResetPassword() {
  const params = useLocalSearchParams<{ email?: string }>();
  const setRecovery = useAuth((s) => s.setRecovery);

  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const cleanEmail = email.trim();
    const cleanCode = code.trim();
    if (!cleanEmail) {
      setError(t('auth.resetNeedEmail'));
      return;
    }
    if (cleanCode.length < 6) {
      setError(t('auth.resetNeedCode'));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(t('errors.weakPassword'));
      return;
    }
    if (!supabase) {
      setError(t('errors.notConfigured'));
      return;
    }

    setSubmitting(true);
    // Hold off the auth-layout redirect: verifyOtp briefly creates a session
    // before we've set the new password.
    setRecovery(true);

    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: 'recovery',
    });
    if (verifyErr) {
      setRecovery(false);
      setSubmitting(false);
      setError(t('auth.resetCodeInvalid'));
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setRecovery(false);
      setSubmitting(false);
      setError(updateErr.message);
      return;
    }

    // Password set and session is valid — releasing recovery lets the auth
    // layout redirect the now-signed-in user into the app.
    setSubmitting(false);
    setRecovery(false);
  };

  return (
    <Screen scroll>
      <View className="gap-2 mt-8">
        <Text variant="display">{t('auth.resetTitle')}</Text>
        <Text variant="caption">{t('auth.resetSubtitle')}</Text>
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
        />
        <Input
          label={t('auth.resetCode')}
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          inputMode="numeric"
          placeholder={t('auth.resetCodePlaceholder')}
        />
        <Input
          label={t('auth.newPassword')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          placeholder={t('auth.passwordMinPlaceholder')}
          error={error ?? undefined}
        />
        <Button title={t('auth.resetSubmit')} onPress={onSubmit} loading={submitting} />

        <Link href="/(auth)/sign-in" className="mt-4 text-center">
          <Text variant="caption">{t('auth.backToSignIn')}</Text>
        </Link>
      </View>
    </Screen>
  );
}
