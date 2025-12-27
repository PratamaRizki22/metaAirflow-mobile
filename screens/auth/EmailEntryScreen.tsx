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

interface EmailEntryScreenProps {
    onEmailNotRegistered: (email: string) => void;
    onEmailRegistered: (email: string) => void;
    onGoogleSignIn: () => void;
    onClose?: () => void;
}

export function EmailEntryScreen({
    onEmailNotRegistered,
    onEmailRegistered,
    onGoogleSignIn,
    onClose,
}: EmailEntryScreenProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldError, setFieldError] = useState(false);
    const { toast, showToast, hideToast } = useToast();

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
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <LinearGradient
                colors={['#FFFFFF', '#DAF3FF']}
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
                                <Text className="text-2xl font-bold text-[#0f172a]">
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
                                <Ionicons name="close" size={24} color="#334155" />
                            </TouchableOpacity>

                            {/* Title */}
                            <View className="items-center mb-12">
                                <Text className="text-lg font-semibold text-[#0f172a] mb-2">
                                    Log in or Sign up
                                </Text>
                                <Text className="text-sm text-[#475569] text-center">
                                    Get the full experience in property search
                                </Text>
                            </View>

                            {/* Email Input */}
                            <View className="mb-4">
                                <Text className="text-sm text-[#475569] mb-2">Email</Text>
                                <TextInput
                                    className={`bg-white border ${fieldError ? 'border-red-500' : 'border-[#10A0F7]'
                                        } rounded-md px-4 py-3 text-[#64748b]`}
                                    placeholder="someone123@gmail.com"
                                    placeholderTextColor="#64748b"
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
                            <TouchableOpacity className="mb-6">
                                <Text className="text-sm text-[#10A0F7] underline">
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>

                            {/* Next Button */}
                            <TouchableOpacity
                                className={isLoading ? 'opacity-50 mb-8' : 'mb-8'}
                                style={{
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                }}
                                onPress={handleNext}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={['#10A0F7', '#01E8AD']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0.65 }}
                                    className="py-3 px-4"
                                    style={{
                                        shadowColor: '#10A0F7',
                                        shadowOffset: { width: 4, height: 4 },
                                        shadowOpacity: 0.4,
                                        shadowRadius: 12,
                                        elevation: 8,
                                    }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-[#f1f5f9] text-center font-semibold text-sm">
                                            Next
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View className="flex-row items-center mb-8">
                                <View className="flex-1 h-[1px] bg-[#cbd5e1]" />
                                <Text className="mx-2 text-sm text-[#475569]">or</Text>
                                <View className="flex-1 h-[1px] bg-[#cbd5e1]" />
                            </View>

                            {/* Google Sign In */}
                            <TouchableOpacity
                                onPress={onGoogleSignIn}
                                disabled={isLoading}
                                className={`bg-white border border-[#cbd5e1] rounded-md py-3 flex-row items-center justify-center ${isLoading ? 'opacity-50' : ''
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
                                <Text className="text-[#475569] text-sm">Sign in with Google</Text>
                            </TouchableOpacity>

                            {/* Terms and Skip */}
                            <View className="mt-auto pb-8">
                                <Text className="text-xs text-[#475569] text-center mb-4 leading-5">
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
                                    <Text className="text-base text-[#94a3b8] text-center">Skip</Text>
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
