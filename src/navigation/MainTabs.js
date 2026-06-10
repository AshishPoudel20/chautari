import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { useSelectors } from '../data/store';
import { CountBadge } from '../components/ui';

import HomeScreen from '../screens/HomeScreen';
import CirclesDirectoryScreen from '../screens/CirclesDirectoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MyProfileScreen from '../screens/MyProfileScreen';

const Tab = createBottomTabNavigator();

// Emoji "icons" keep the prototype dependency-free (no icon font setup needed).
function TabIcon({ emoji, focused, badge }) {
  return (
    <View style={{ width: 44, alignItems: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
      {badge ? (
        <View style={{ position: 'absolute', right: 2, top: -4 }}>
          <CountBadge count={badge} />
        </View>
      ) : null}
    </View>
  );
}

export default function MainTabs() {
  const { colors } = useTheme();
  const { unreadNotifs } = useSelectors();
  const unread = unreadNotifs();

  const screenOptions = useMemo(() => ({
    headerShown: false,
    freezeOnBlur: true,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 6 },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  }), [colors]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="Circles" component={CirclesDirectoryScreen} options={{ title: 'Circles', tabBarIcon: ({ focused }) => <TabIcon emoji="◎" focused={focused} /> }} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} options={{ title: 'Alerts', tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} badge={unread} /> }} />
      <Tab.Screen name="Profile" component={MyProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
