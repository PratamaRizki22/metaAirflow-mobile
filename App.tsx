import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModeProvider } from './contexts/ModeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
import { SplashScreen, WelcomeSplash } from './screens/splash';
import { PreferenceScreen } from './screens/preferences';
import { OnboardingScreen } from './screens/onboarding';
import { RootNavigator } from './navigation/RootNavigator';
import { ErrorBoundary, OfflineBanner } from './components/common';
import { useNetwork } from './hooks';

import './global.css';

function AppContent() {
  const { isDark } = useTheme();
  const { hasSeenOnboarding, completeOnboarding } = useOnboarding();
  const { isOffline } = useNetwork();
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPreference, setShowPreference] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show splash screen first (always shows on app open)
  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => {
          setShowSplash(false);
          // Check if user has seen onboarding
          if (!hasSeenOnboarding) {
            setShowWelcome(true);
          }
          // If already seen onboarding, go directly to main app
        }} />
      </>
    );
  }

  // Show welcome splash (only first time)
  if (showWelcome) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <WelcomeSplash onFinish={() => {
          setShowWelcome(false);
          setShowPreference(true);
        }} />
      </>
    );
  }

  // Show preference screen (only first time)
  if (showPreference) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <PreferenceScreen onComplete={() => {
          setShowPreference(false);
          setShowOnboarding(true);
        }} />
      </>
    );
  }

  // Show onboarding (only first time)
  if (showOnboarding) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <OnboardingScreen onComplete={() => {
          completeOnboarding();
          setShowOnboarding(false);
        }} />
      </>
    );
  }

  // Main app with tab navigation
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner isOffline={isOffline} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'VisbyRound-Regular': require('./assets/fonts/Visby-Round/OTF/VisbyRoundCF-Regular.otf'),
    'VisbyRound-Medium': require('./assets/fonts/Visby-Round/OTF/VisbyRoundCF-Medium.otf'),
    'VisbyRound-DemiBold': require('./assets/fonts/Visby-Round/OTF/VisbyRoundCF-DemiBold.otf'),
    'VisbyRound-Bold': require('./assets/fonts/Visby-Round/OTF/VisbyRoundCF-Bold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'}>
        <ThemeProvider>
          <AuthProvider>
            <ModeProvider>
              <OnboardingProvider>
                <NotificationProvider>
                  <FavoritesProvider>
                    <SearchProvider>
                      <AppContent />
                    </SearchProvider>
                  </FavoritesProvider>
                </NotificationProvider>
              </OnboardingProvider>
            </ModeProvider>
          </AuthProvider>
        </ThemeProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}
