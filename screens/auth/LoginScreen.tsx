import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import authService from '../../services/authService';
import { useThemeColors } from '../../hooks';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onNavigateToRegister: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.login({ email, password });

            if (response.success) {
                Alert.alert(
                    'Success',
                    'Login successful!',
                    [
                        {
                            text: 'OK',
                            onPress: onLoginSuccess,
                        },
                    ]
                );
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setError('');

            // Configure Google Sign-In (should be done once, but safe to call multiple times)
            GoogleSignin.configure({
                webClientId: GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true,
            });

            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (response.type === 'success') {
                onLoginSuccess();
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                setError('Sign in was cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                setError('Sign in is already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                setError('Play services not available');
            } else {
                setError(error.message || 'Google Sign-In failed');
            }
            console.error('Google Sign-In Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const { bgColor, textColor, secondaryTextColor, borderColor, isDark } = useThemeColors();
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgColor}`}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 justify-center px-6 py-12">
                    <View className="mb-12">
                        <Text className={`text-4xl font-bold mb-2 ${textColor}`}>
                            Welcome Back
                        </Text>
                        <Text className={`text-base ${secondaryTextColor}`}>
                            Sign in to continue to Rentverse
                        </Text>
                    </View>

                    {error ? (
                        <View className="bg-error-light/10 border border-error-light rounded-lg p-4 mb-6">
                            <Text className="text-error-light">{error}</Text>
                        </View>
                    ) : null}

                    <View className="space-y-4 mb-6">
                        <View>
                            <Text className={`text-sm font-medium mb-2 ${textColor}`}>
                                Email
                            </Text>
                            <TextInput
                                className={`${inputBg} ${borderColor} border rounded-lg px-4 py-3 ${textColor}`}
                                placeholder="Enter your email"
                                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>

                        <View>
                            <Text className={`text-sm font-medium mb-2 ${textColor}`}>
                                Password
                            </Text>
                            <View className="relative">
                                <TextInput
                                    className={`${inputBg} ${borderColor} border rounded-lg px-4 py-3 pr-12 ${textColor}`}
                                    placeholder="Enter your password"
                                    placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-0 bottom-0 justify-center"
                                    disabled={isLoading}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color={isDark ? '#94A3B8' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`bg-primary rounded-lg py-4 mb-6 ${isLoading ? 'opacity-50' : ''}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-semibold text-base">
                                Sign In
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row items-center mb-6">
                        <View className={`flex-1 h-px ${isDark ? 'bg-border-dark' : 'bg-border-light'}`} />
                        <Text className={`mx-4 ${secondaryTextColor}`}>or</Text>
                        <View className={`flex-1 h-px ${isDark ? 'bg-border-dark' : 'bg-border-light'}`} />
                    </View>

                    <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                        className={`${inputBg} ${borderColor} border rounded-lg py-4 mb-6 ${isLoading ? 'opacity-50' : ''}`}
                    >
                        <Text className={`text-center font-semibold text-base ${textColor}`}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center">
                        <Text className={secondaryTextColor}>
                            Don&apos;t have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={onNavigateToRegister} disabled={isLoading}>
                            <Text className="text-primary font-semibold">
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
