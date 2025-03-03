import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import store from './src/store';
import Navigation from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import LoadingScreen from './src/components/common/LoadingScreen';

// Initialize stripe with environment-specific publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY || 'pk_test_sample';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });

        // Initialize services and check network connectivity
        await Promise.all([
          // Add any additional initialization tasks here
          new Promise((resolve) => setTimeout(resolve, 500)), // Reduced artificial delay
        ]);
      } catch (e) {
        console.error('Initialization error:', e);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the app. Please check your internet connection and try again.',
          [{ text: 'Retry', onPress: () => prepare() }]
        );
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (isReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.error('Error hiding splash screen:', e);
        // Continue even if hiding splash screen fails
      }
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <ErrorBoundary>
        <LoadingScreen message="Starting ToonMe+" />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <SubscriptionProvider>
            <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
              <SafeAreaProvider onLayout={onLayoutRootView}>
                <StatusBar style="dark" />
                <NavigationContainer
                  onStateChange={(state) => {
                    // Track navigation state changes for analytics
                    if (__DEV__) {
                      console.log('Navigation state:', state);
                    }
                    // Add analytics tracking here
                  }}
                  onError={(error) => {
                    console.error('Navigation error:', error);
                    // Handle navigation errors gracefully
                  }}
                  fallback={<LoadingScreen />}
                  theme={{
                    colors: {
                      primary: '#4CAF50',
                      secondary: '#2196F3',
                      background: '#ffffff',
                      card: '#ffffff',
                      text: '#1a1a1a',
                      border: '#e9ecef',
                      notification: '#ff3b30',
                      success: '#4CAF50',
                      warning: '#FFC107',
                      error: '#FF5252',
                    },
                    dark: false,
                    spacing: {
                      xs: 4,
                      sm: 8,
                      md: 16,
                      lg: 24,
                      xl: 32,
                    },
                  }}
                  linking={{
                    prefixes: ['toonmeplus://'],
                    config: {
                      screens: {
                        Camera: 'camera',
                        Stories: 'stories',
                        Profile: 'profile',
                        Login: 'login',
                        Register: 'register',
                        ForgotPassword: 'forgot-password',
                      },
                    },
                  }}
                >
                  <Navigation />
                </NavigationContainer>
              </SafeAreaProvider>
            </StripeProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}
