import { Stack } from 'expo-router';

export default function LogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B0F14' },
      }}
    />
  );
}
