import { useEffect } from 'react';
import { Redirect, Stack, usePathname, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { useBilling } from '@/store/billing';
import { isProfileComplete } from '@/features/profile/types';

export default function AppLayout() {
  const session = useAuth((s) => s.session);
  const user = useAuth((s) => s.user);
  const { profile, loaded, loading, load } = useProfile();
  const billingLoaded = useBilling((s) => s.loaded);
  const billingLoading = useBilling((s) => s.loading);
  const loadBilling = useBilling((s) => s.load);
  const pathname = usePathname();

  // Load the user's profile + billing tier once we have a session.
  useEffect(() => {
    if (user && !loaded && !loading) {
      load(user.id);
    }
  }, [user, loaded, loading, load]);

  useEffect(() => {
    if (user && !billingLoaded && !billingLoading) {
      loadBilling(user.id);
    }
  }, [user, billingLoaded, billingLoading, loadBilling]);

  // Force users into onboarding until they've filled in the required fields.
  useEffect(() => {
    if (!loaded || !session) return;
    const onOnboarding = pathname.includes('onboarding');
    if (!isProfileComplete(profile) && !onOnboarding) {
      router.replace('/(app)/onboarding');
    }
  }, [loaded, session, profile, pathname]);

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F14' } }} />
  );
}
