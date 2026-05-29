import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { t } from '@/i18n/strings';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async () => {
    setError(null);
    if (!supabase) {
      setError(t('errors.notConfigured'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  };

  const onOAuth = (_provider: 'google' | 'apple') => {
    Alert.alert(t('auth.oauthNotConfiguredTitle'), t('auth.oauthNotConfiguredBody'));
  };

  return (
    <Screen scroll>
      <View className="gap-2 mt-8">
        <Text variant="display">{t('app.name')}</Text>
        <Text variant="caption">{t('auth.welcomeSubtitle')}</Text>
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
          autoComplete="password"
          placeholder="••••••••"
          error={error ?? undefined}
        />
        <Button title={t('auth.signIn')} onPress={onSignIn} loading={loading} />

        <View className="flex-row items-center gap-3 my-2">
          <View className="flex-1 h-px bg-border" />
          <Text variant="caption">{t('auth.or')}</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <Button
          title={t('auth.continueWithGoogle')}
          variant="secondary"
          onPress={() => onOAuth('google')}
        />
        <Button
          title={t('auth.continueWithApple')}
          variant="secondary"
          onPress={() => onOAuth('apple')}
        />

        <Link href="/(auth)/sign-up" className="mt-4 text-center">
          <Text variant="caption">{t('auth.needAccount')}</Text>
        </Link>

        {!isSupabaseConfigured ? (
          <Text variant="caption" className="text-warn mt-4 text-center">
            {t('errors.notConfigured')}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
