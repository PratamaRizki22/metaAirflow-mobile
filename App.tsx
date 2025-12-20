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
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPreference, setShowPreference] = useState(false);

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
  // TEMPORARY: Always show onboarding for development
  if (true) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <OnboardingScreen onComplete={() => {
          // Do nothing after onboarding for now
          console.log('Onboarding completed');
        }} />
      </>
    );
  }

  // COMMENTED OUT: Auth screens - will enable later
  /*
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterScreen
          onRegisterSuccess={() => setIsAuthenticated(true)}
          onNavigateToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginScreen
        onLoginSuccess={() => setIsAuthenticated(true)}
        onNavigateToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Main app with tab navigation
  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
  */
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
