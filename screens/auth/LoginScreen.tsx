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
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '@env';
import authService from '../../services/authService';
import { useThemeColors } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/common';

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onNavigateToRegister: () => void;
}

import { useAuth } from '../../contexts/AuthContext';

export function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
    const { refreshProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
    const { toast, showToast, hideToast } = useToast();

    const handleLogin = async () => {
        setError('');

        const errors: { [key: string]: boolean } = {};
        if (!email) errors.email = true;
        if (!password) errors.password = true;

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.login({ email, password });

            if (response.success) {
                showToast('Login successful!', 'success');
                setTimeout(() => {
                    onLoginSuccess();
                }, 1000);
            }
        } catch (err: any) {
            showToast(err.message || 'Login failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setError('');

            console.log('=== GOOGLE SIGN-IN DEBUG START ===');
            console.log('1. Package name should be: com.pratamarizki22.rentverse');
            console.log('2. Web Client ID:', GOOGLE_WEB_CLIENT_ID);
            console.log('3. Android Client ID:', GOOGLE_ANDROID_CLIENT_ID);

            // Configure Google Sign-In
            GoogleSignin.configure({
                webClientId: GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true,
            });
            console.log('4. GoogleSignin.configure() called successfully');

            // Check Play Services
            console.log('5. Checking Play Services...');
            const playServicesAvailable = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            console.log('6. Play Services available:', playServicesAvailable);

            // Try to sign in
            console.log('7. Calling GoogleSignin.signIn()...');
            const userInfo = await GoogleSignin.signIn();
            console.log('8. GoogleSignin.signIn() response:', JSON.stringify(userInfo, null, 2));

            if (userInfo.type === 'success' && userInfo.data) {
                const idToken = (userInfo.data as any).idToken;
                console.log('9. Got idToken:', idToken ? 'YES' : 'NO');

                if (!idToken) {
                    throw new Error('Failed to get ID token from Google');
                }

                console.log('10. Sending idToken to backend...');
                const response = await authService.loginWithGoogle(idToken);
                console.log('11. Backend response:', response);

                if (response.success) {
                    // Refresh the auth context to update UI
                    await refreshProfile();

                    showToast('Google Sign-In successful!', 'success');
                    setTimeout(() => {
                        onLoginSuccess();
                    }, 1000);
                }
            }
        } catch (error: any) {
            console.error('=== GOOGLE SIGN-IN ERROR ===');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                showToast('Sign in was cancelled', 'info');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                showToast('Sign in is already in progress', 'warning');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                showToast('Play services not available', 'error');
            } else {
                showToast(error.message || 'Google Sign-In failed', 'error');
            }
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
                                className={`${inputBg} border rounded-lg px-4 py-3 ${textColor} ${fieldErrors.email ? 'border-red-500 border-2' : borderColor
                                    }`}
                                placeholder="Enter your email"
                                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (text) setFieldErrors(prev => ({ ...prev, email: false }));
                                }}
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
                                    className={`${inputBg} border rounded-lg px-4 py-3 pr-12 ${textColor} ${fieldErrors.password ? 'border-red-500 border-2' : borderColor
                                        }`}
                                    placeholder="Enter your password"
                                    placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (text) setFieldErrors(prev => ({ ...prev, password: false }));
                                    }}
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
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </KeyboardAvoidingView>
    );
}
