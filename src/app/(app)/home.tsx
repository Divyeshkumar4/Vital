import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { useAuth } from '@/store/auth';
import { t } from '@/i18n/strings';

export default function Home() {
  const { user, signOut, loading } = useAuth();
  return (
    <Screen>
      <View className="gap-2 mt-8">
        <Text variant="display">{t('auth.welcome')}</Text>
        <Text variant="caption">{t('auth.welcomeSubtitle')}</Text>
      </View>
      <View className="gap-2 mt-8">
        <Text variant="caption">{t('auth.signedInAs')}</Text>
        <Text variant="body">{user?.email ?? ''}</Text>
      </View>
      <View className="mt-auto">
        <Button title={t('auth.signOut')} variant="secondary" onPress={signOut} loading={loading} />
      </View>
    </Screen>
  );
}
