import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import BackButton from '../components/common/BackButton';
import ExpertDirectoryScreen from '../screens/experts/ExpertDirectoryScreen';
import ExpertProfileScreen from '../screens/experts/ExpertProfileScreen';

const Stack = createNativeStackNavigator();

export default function ExpertsStack() {
  const { colors } = useTheme();
  const screenOptions = useMemo(() => ({
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
    headerBackTitle: 'Back',
    headerBackVisible: false,
    headerLeft: (props) => <BackButton {...props} tintColor={colors.text} />,
    contentStyle: { backgroundColor: colors.bg },
    animation: 'slide_from_right',
    freezeOnBlur: true,
  }), [colors]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ExpertDirectory"
        component={ExpertDirectoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpertProfile"
        component={ExpertProfileScreen}
        options={({ route }) => ({ title: route.params?.title || 'Expert' })}
      />
    </Stack.Navigator>
  );
}
