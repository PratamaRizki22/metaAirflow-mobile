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
    StatusBar,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/common';
import { Button } from '../../components/common';
import { useTheme } from '../../contexts/ThemeContext';

interface EmailEntryScreenProps {
    onEmailNotRegistered: (email: string) => void;
    onEmailRegistered: (email: string) => void;
    onGoogleSignIn: () => void;
    onForgotPassword?: () => void;
    onClose?: () => void;
}

export function EmailEntryScreen({
    onEmailNotRegistered,
    onEmailRegistered,
    onGoogleSignIn,
    onForgotPassword,
    onClose,
}: EmailEntryScreenProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldError, setFieldError] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const { isDark } = useTheme();

    const handleNext = async () => {
        if (!email) {
            setFieldError(true);
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
            // Check if email exists
            const response = await authService.checkEmail(email);

            if (response.exists) {
                // Email is registered, go to password screen
                onEmailRegistered(email);
            } else {
                // Email not registered, show role selection
                onEmailNotRegistered(email);
            }
        } catch (err: any) {
            showToast(err.message || 'Failed to check email. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1">
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={isDark ? '#0F172A' : '#FFFFFF'}
            />
            <LinearGradient
                colors={isDark ? ['#0F172A', '#1E293B'] : ['#FFFFFF', '#DAF3FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-1 px-6 pt-16">
                            {/* Logo */}
                            <View className="items-center mb-8">
                                <Text className="text-2xl font-bold text-[#0f172a] dark:text-white">
                                    <Text style={{ color: '#10A0F7' }}>Rent</Text>verse
                                </Text>
                            </View>

                            {/* Close Button */}
                            <TouchableOpacity
                                className="absolute top-16 right-6 w-6 h-6 items-center justify-center"
                                onPress={onClose}
                                accessibilityLabel="Close auth"
                                accessibilityRole="button"
                            >
                                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#334155'} />
                            </TouchableOpacity>

                            {/* Title */}
                            <View className="items-center mb-12">
                                <Text className="text-lg font-semibold text-[#0f172a] dark:text-white mb-2">
                                    Log in or Sign up
                                </Text>
                                <Text className="text-sm text-[#475569] dark:text-gray-400 text-center">
                                    Get the full experience in property search
                                </Text>
                            </View>

                            {/* Email Input */}
                            <View className="mb-4">
                                <Text className="text-sm text-[#475569] dark:text-gray-300 mb-2">Email</Text>
                                <TextInput
                                    className={`bg-white dark:bg-surface-dark border ${fieldError ? 'border-red-500' : 'border-[#10A0F7]'
                                        } rounded-md px-4 py-3 text-[#64748b] dark:text-white`}
                                    placeholder="someone123@gmail.com"
                                    placeholderTextColor={isDark ? '#9CA3AF' : '#64748b'}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (text) setFieldError(false);
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Forgot Password */}
                            {onForgotPassword && (
                                <TouchableOpacity
                                    className="mb-6"
                                    onPress={() => {
                                        console.log('Forgot Password button pressed');
                                        onForgotPassword?.();
                                    }}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text className="text-sm text-[#10A0F7] underline">
                                        Forgot Password?
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Next Button */}
                            <View className="mb-8">
                                <Button
                                    onPress={handleNext}
                                    loading={isLoading}
                                    size="lg"
                                    fullWidth
                                >
                                    Next
                                </Button>
                            </View>

                            {/* Divider */}
                            <View className="flex-row items-center mb-8">
                                <View className="flex-1 h-[1px] bg-[#cbd5e1] dark:bg-gray-700" />
                                <Text className="mx-2 text-sm text-[#475569] dark:text-gray-400">or</Text>
                                <View className="flex-1 h-[1px] bg-[#cbd5e1] dark:bg-gray-700" />
                            </View>

                            {/* Google Sign In */}
                            <TouchableOpacity
                                onPress={onGoogleSignIn}
                                disabled={isLoading}
                                className={`bg-white dark:bg-surface-dark border border-[#cbd5e1] dark:border-gray-700 rounded-md py-3 flex-row items-center justify-center ${isLoading ? 'opacity-50' : ''
                                    }`}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                }}
                            >
                                <Image
                                    source={{ uri: 'https://www.google.com/favicon.ico' }}
                                    style={{ width: 16, height: 16, marginRight: 8 }}
                                />
                                <Text className="text-[#475569] dark:text-gray-200 text-sm">Sign in with Google</Text>
                            </TouchableOpacity>

                            {/* Terms and Skip */}
                            <View className="mt-auto pb-8">
                                <Text className="text-xs text-[#475569] dark:text-gray-400 text-center mb-4 leading-5">
                                    By continuing to use our services, you agree to our{' '}
                                    <Text className="text-[#10A0F7] underline">Terms & Conditions</Text> and{' '}
                                    <Text className="text-[#10A0F7] underline">Privacy Policy</Text>
                                    {'\n'}Rentverse
                                </Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    accessibilityRole="button"
                                    accessibilityLabel="Skip auth"
                                >
                                    <Text className="text-base text-[#94a3b8] dark:text-gray-500 text-center">Skip</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                    <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}
