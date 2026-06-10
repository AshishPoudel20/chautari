import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from './src/data/store';
import { NetworkProvider } from './src/data/network';
import { ToastProvider } from './src/components/Toast';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DataProvider>
          <NetworkProvider>
            <ToastProvider>
              <ThemedStatusBar />
              <RootNavigator />
            </ToastProvider>
          </NetworkProvider>
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
