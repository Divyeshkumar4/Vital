import { useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase/client';
import { t } from '@/i18n/strings';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onSignUp = async () => {
    setError(null);
    setMessage(null);
    if (!supabase) {
      setError(t('errors.notConfigured'));
      return;
    }
    if (password.length < 8) {
      setError(t('errors.weakPassword'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else setMessage(t('auth.checkEmail'));
  };

  return (
    <Screen scroll>
      <View className="gap-2 mt-8">
        <Text variant="h1">{t('auth.signUp')}</Text>
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
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          placeholder="At least 8 characters"
          error={error ?? undefined}
        />
        {message ? (
          <Text variant="caption" className="text-accent">
            {message}
          </Text>
        ) : null}
        <Button title={t('auth.signUp')} onPress={onSignUp} loading={loading} />

        <Link href="/(auth)/sign-in" className="mt-4 text-center">
          <Text variant="caption">{t('auth.haveAccount')}</Text>
        </Link>
      </View>
    </Screen>
  );
}
