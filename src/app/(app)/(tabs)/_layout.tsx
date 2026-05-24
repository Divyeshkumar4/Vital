import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/lib/design/tokens';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.colors.bg.elevated,
          borderTopColor: tokens.colors.border.DEFAULT,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: tokens.colors.accent.DEFAULT,
        tabBarInactiveTintColor: tokens.colors.fg.muted,
        sceneStyle: { backgroundColor: tokens.colors.bg.DEFAULT },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="log" options={{ title: 'Log', tabBarIcon: tabIcon('list-outline') }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: tabIcon('restaurant-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
