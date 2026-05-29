import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/store/auth';

export default function AuthLayout() {
  const session = useAuth((s) => s.session);
  const recovery = useAuth((s) => s.recovery);
  // Don't bounce into the app while a password reset is in flight — the
  // recovery code briefly creates a session before the new password is set.
  if (session && !recovery) return <Redirect href="/(app)/(tabs)/home" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F14' } }} />;
}
