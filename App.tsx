import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModeProvider } from './contexts/ModeContext';
import { SplashScreen, WelcomeSplash } from './screens/splash';
import { PreferenceScreen } from './screens/preferences';
import { OnboardingScreen } from './screens/onboarding';
import { RootNavigator } from './navigation/RootNavigator';

import './global.css';

function AppContent() {
  const { isDark } = useTheme();
  const { hasSeenOnboarding, completeOnboarding } = useOnboarding();
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
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ModeProvider>
          <OnboardingProvider>
            <AppContent />
          </OnboardingProvider>
        </ModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
