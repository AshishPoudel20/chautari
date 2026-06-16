import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from './src/data/store';
import { NetworkProvider } from './src/data/network';
import { ToastProvider } from './src/components/Toast';
import DispatchErrorBridge from './src/components/DispatchErrorBridge';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary fallbackTitle="Something went wrong" fallbackMessage="The app hit an unexpected error. Tap Try again to recover.">
        <ThemeProvider>
          <DataProvider>
            <NetworkProvider>
              <ToastProvider>
                <DispatchErrorBridge />
                <ThemedStatusBar />
                <ErrorBoundary
                  fallbackTitle="This screen had a problem"
                  fallbackMessage="Something went wrong on this page. Tap Try again or use the back gesture."
                >
                  <RootNavigator />
                </ErrorBoundary>
              </ToastProvider>
            </NetworkProvider>
          </DataProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
