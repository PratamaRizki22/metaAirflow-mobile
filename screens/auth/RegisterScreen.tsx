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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

interface RegisterScreenProps {
    onRegisterSuccess: () => void;
    onNavigateToLogin: () => void;
}

export function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
    const { isDark } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        // Mock register - replace with actual API call
        setTimeout(() => {
            setIsLoading(false);
            onRegisterSuccess();
        }, 1000);
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setError('');

            GoogleSignin.configure({
                webClientId: GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true,
            });

            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (response.type === 'success') {
                onRegisterSuccess();
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
        } finally {
            setIsLoading(false);
        }
    };

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const secondaryTextColor = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';
    const borderColor = isDark ? 'border-border-dark' : 'border-border-light';

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
                    <View className="mb-8">
                        <Text className={`text-4xl font-bold mb-2 ${textColor}`}>
                            Create Account
                        </Text>
                        <Text className={`text-base ${secondaryTextColor}`}>
                            Sign up to get started with MetaAirflow
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
                                Full Name
                            </Text>
                            <TextInput
                                className={`${inputBg} ${borderColor} border rounded-lg px-4 py-3 ${textColor}`}
                                placeholder="Enter your full name"
                                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                                value={name}
                                onChangeText={setName}
                                editable={!isLoading}
                            />
                        </View>

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
                                    placeholder="Create a password"
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

                        <View>
                            <Text className={`text-sm font-medium mb-2 ${textColor}`}>
                                Confirm Password
                            </Text>
                            <View className="relative">
                                <TextInput
                                    className={`${inputBg} ${borderColor} border rounded-lg px-4 py-3 pr-12 ${textColor}`}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-0 bottom-0 justify-center"
                                    disabled={isLoading}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color={isDark ? '#94A3B8' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={isLoading}
                        className={`bg-primary rounded-lg py-4 mb-6 ${isLoading ? 'opacity-50' : ''}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-semibold text-base">
                                Create Account
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
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
                            <Text className="text-primary font-semibold">
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
