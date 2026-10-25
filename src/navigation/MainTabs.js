import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';

import HomeScreen from '../screens/home/HomeScreen';
import CirclesDirectoryScreen from '../screens/circles/CirclesDirectoryScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import ExpertsStack from './ExpertsStack';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused, color }) {
  return (
    <View style={{ width: 44, alignItems: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5, color }}>{emoji}</Text>
    </View>
  );
}

function TabExpertIcon({ focused, color }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: 44, alignItems: 'center' }}>
      <View style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: focused ? colors.verifiedTint : 'transparent',
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: focused ? 1 : 0.65,
      }}
      >
        <Text style={{ color, fontSize: 13, fontWeight: '900', lineHeight: 15 }}>✓</Text>
      </View>
    </View>
  );
}

export default function MainTabs() {
  const { colors } = useTheme();

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
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused, color }) => <TabIcon emoji="🏠" focused={focused} color={color} /> }} />
      <Tab.Screen name="Circles" component={CirclesDirectoryScreen} options={{ title: 'Circles', tabBarIcon: ({ focused, color }) => <TabIcon emoji="◎" focused={focused} color={color} /> }} />
      <Tab.Screen name="Experts" component={ExpertsStack} options={{ title: 'Experts', tabBarIcon: ({ focused, color }) => <TabExpertIcon focused={focused} color={color} /> }} />
      <Tab.Screen name="Profile" component={MyProfileScreen} options={{ tabBarIcon: ({ focused, color }) => <TabIcon emoji="👤" focused={focused} color={color} /> }} />
    </Tab.Navigator>
  );
}
