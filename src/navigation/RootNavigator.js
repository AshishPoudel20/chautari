import React, { useMemo, useRef } from 'react';
import DigestManager from '../components/DigestManager';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../data/store';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import PhoneEntryScreen from '../screens/PhoneEntryScreen';
import OtpScreen from '../screens/OtpScreen';
import ProfileNameScreen from '../screens/ProfileNameScreen';
import ProfileSuburbScreen from '../screens/ProfileSuburbScreen';
import MainTabs from './MainTabs';
import QuestionDetailScreen from '../screens/QuestionDetailScreen';
import AskComposerScreen from '../screens/AskComposerScreen';
import AnswerComposerScreen from '../screens/AnswerComposerScreen';
import CirclesDirectoryScreen from '../screens/CirclesDirectoryScreen';
import CircleDetailScreen from '../screens/CircleDetailScreen';
import CreateCircleScreen from '../screens/CreateCircleScreen';
import EditCircleScreen from '../screens/EditCircleScreen';
import ExpertDirectoryScreen from '../screens/ExpertDirectoryScreen';
import SearchScreen from '../screens/SearchScreen';
import ExpertProfileScreen from '../screens/ExpertProfileScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import VerifiedApplicationScreen from '../screens/VerifiedApplicationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportScreen from '../screens/ReportScreen';
import HelpScreen from '../screens/HelpScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import AboutScreen from '../screens/AboutScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import ImageViewerScreen from '../screens/ImageViewerScreen';
import MyPostsScreen from '../screens/MyPostsScreen';
import SavedPostsScreen from '../screens/SavedPostsScreen';

const Stack = createNativeStackNavigator();

const modalOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  headerBackTitle: 'Cancel',
};

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const { state } = useData();
  const navRef = useRef(null);
  const [minTimePassed, setMinTimePassed] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const ready = state.booted && minTimePassed;

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: isDark,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [colors, isDark]);

  const headerOptions = useMemo(() => ({
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
    headerBackTitle: 'Back',
    headerBackVisible: true,
    contentStyle: { backgroundColor: colors.bg },
    animation: 'slide_from_right',
    freezeOnBlur: true,
  }), [colors]);

  return (
    <NavigationContainer ref={navRef} theme={navTheme}>
      <DigestManager navigationRef={navRef} />
      <Stack.Navigator screenOptions={headerOptions}>
        {!ready ? (
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false, animation: 'fade' }} />
        ) : !state.currentUserId ? (
          <Stack.Group screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} options={{ headerShown: true, title: '', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: true, title: '', headerBackTitle: 'Back' }} />
            <Stack.Screen name="ProfileName" component={ProfileNameScreen} options={{ headerShown: true, title: 'Your profile', headerBackTitle: 'Back' }} />
            <Stack.Screen name="ProfileSuburb" component={ProfileSuburbScreen} options={{ headerShown: true, title: 'Almost there', headerBackTitle: 'Back' }} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} options={{ title: 'Question' }} />
            <Stack.Screen name="Circles" component={CirclesDirectoryScreen} options={{ title: 'Circles' }} />
            <Stack.Screen name="CircleDetail" component={CircleDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="CreateCircle" component={CreateCircleScreen} options={{ title: 'Create a Circle' }} />
            <Stack.Screen name="EditCircle" component={EditCircleScreen} options={{ title: 'Edit circle' }} />
            <Stack.Screen name="ExpertDirectory" component={ExpertDirectoryScreen} options={{ title: 'Experts' }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
            <Stack.Screen name="ExpertProfile" component={ExpertProfileScreen} options={({ route }) => ({ title: route.params?.title || 'Expert' })} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={({ route }) => ({ title: route.params?.title || 'Profile' })} />
            <Stack.Screen name="VerifiedApplication" component={VerifiedApplicationScreen} options={{ title: 'Become a Verified Expert' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
            <Stack.Screen name="MyPosts" component={MyPostsScreen} options={{ title: 'My Posts' }} />
            <Stack.Screen name="SavedPosts" component={SavedPostsScreen} options={{ title: 'Saved Posts' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help & FAQ' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Chautari' }} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete account' }} />

            <Stack.Group screenOptions={modalOptions}>
              <Stack.Screen name="AskComposer" component={AskComposerScreen} options={{ title: 'Ask a question' }} />
              <Stack.Screen name="AnswerComposer" component={AnswerComposerScreen} options={{ title: 'Your answer' }} />
              <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report' }} />
              <Stack.Screen name="ImageViewer" component={ImageViewerScreen} options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
            </Stack.Group>
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function RootNavigator() {
  return <AppNavigator />;
}
