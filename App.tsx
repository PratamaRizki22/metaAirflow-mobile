import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { View, Text, TouchableOpacity } from 'react-native';

import './global.css';

function AppContent() {
  const { isDark } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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

  // Temporary home screen after login
  const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
  const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

  return (
    <View className={`flex-1 items-center justify-center ${bgColor}`}>
      <Text className={`text-2xl font-bold mb-4 ${textColor}`}>
        Welcome to Listing Property!
      </Text>
      <TouchableOpacity
        onPress={() => setIsAuthenticated(false)}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
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
      <AppContent />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

