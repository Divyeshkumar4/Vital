import { Stack } from 'expo-router';

export default function WorkoutStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B0F14' },
      }}
    />
  );
}
