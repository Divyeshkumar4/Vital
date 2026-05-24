import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/store/auth';

export default function Index() {
  const { initialized, session } = useAuth();

  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={session ? '/(app)/(tabs)/home' : '/(auth)/sign-in'} />;
}
