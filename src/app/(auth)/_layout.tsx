import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/store/auth';

export default function AuthLayout() {
  const session = useAuth((s) => s.session);
  if (session) return <Redirect href="/(app)/home" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F14' } }} />;
}
