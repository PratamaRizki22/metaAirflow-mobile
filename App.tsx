import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { SplashScreen } from './screens/SplashScreen';
import { WelcomeSplash } from './screens/WelcomeSplash';
import { PreferenceScreen } from './screens/PreferenceScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { MainTabNavigator } from './navigation/MainTabNavigator';

import './global.css';

function AppContent() {
  const { isDark } = useTheme();
  const { hasSeenOnboarding, completeOnboarding } = useOnboarding();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(!hasSeenOnboarding);
  const [showPreference, setShowPreference] = useState(false);

  // Always show splash screen first
  if (showSplash) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  // Show welcome splash first
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

  // Show preference screen (theme + language)
  if (showPreference) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <PreferenceScreen onComplete={() => {
          setShowPreference(false);
        }} />
      </>
    );
  }

  // Show onboarding if user hasn't seen it yet
  if (!hasSeenOnboarding) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <OnboardingScreen onComplete={() => {
          completeOnboarding();
        }} />
      </>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <RegisterScreen
            onRegisterSuccess={() => setIsAuthenticated(true)}
            onNavigateToLogin={() => setShowRegister(false)}
          />
        </>
      );
    }

    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoginScreen
          onLoginSuccess={() => setIsAuthenticated(true)}
          onNavigateToRegister={() => setShowRegister(true)}
        />
      </>
    );
  }

  // Main app with tab navigation
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <MainTabNavigator />
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
      <OnboardingProvider>
        <AppContent />
      </OnboardingProvider>
    </ThemeProvider>
  );
}
