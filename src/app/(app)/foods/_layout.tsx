import { Stack } from 'expo-router';

export default function FoodsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B0F14' },
      }}
    />
  );
}
