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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/common';
import { useTheme } from '../../contexts/ThemeContext';

interface ForgotPasswordScreenProps {
    onBack: () => void;
    onClose?: () => void;
}

export function ForgotPasswordScreen({
    onBack,
    onClose,
}: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [fieldError, setFieldError] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const { isDark } = useTheme();

    const handleSubmit = async () => {
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

        console.log('📧 [ForgotPassword] Starting forgot password request...');
        console.log('📧 [ForgotPassword] Email:', email);

        setIsLoading(true);

        try {
            console.log('🌐 [ForgotPassword] Calling authService.forgotPassword...');
            const response = await authService.forgotPassword(email);
            console.log('✅ [ForgotPassword] Success! Response:', response);
            setEmailSent(true);
            showToast('Password reset email sent successfully', 'success');
        } catch (err: any) {
            console.error('❌ [ForgotPassword] Error caught:', err);
            console.error('❌ [ForgotPassword] Error message:', err.message);
            console.error('❌ [ForgotPassword] Error response:', err.response?.data);
            showToast(err.message || 'Failed to send reset email. Please try again.', 'error');
        } finally {
            setIsLoading(false);
            console.log('🏁 [ForgotPassword] Request completed');
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

                            {/* Back Button */}
                            <TouchableOpacity
                                className="absolute top-16 left-6 w-10 h-10 items-center justify-center"
                                onPress={onBack}
                                accessibilityLabel="Go back"
                                accessibilityRole="button"
                            >
                                <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#334155'} />
                            </TouchableOpacity>

                            {/* Close Button */}
                            {onClose && (
                                <TouchableOpacity
                                    className="absolute top-16 right-6 w-6 h-6 items-center justify-center"
                                    onPress={onClose}
                                    accessibilityLabel="Close"
                                    accessibilityRole="button"
                                >
                                    <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#334155'} />
                                </TouchableOpacity>
                            )}

                            {!emailSent ? (
                                <>
                                    {/* Title */}
                                    <View className="items-center mb-8 mt-8">
                                        <Text className="text-lg font-semibold text-[#0f172a] dark:text-white mb-2">
                                            Forgot Password?
                                        </Text>
                                        <Text className="text-sm text-[#475569] dark:text-gray-400 text-center">
                                            Enter your email address and we'll send you{'\n'}
                                            instructions to reset your password
                                        </Text>
                                    </View>

                                    {/* Email Input */}
                                    <View className="mb-6">
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

                                    {/* Submit Button */}
                                    <TouchableOpacity
                                        className={isLoading ? 'opacity-50 mb-8' : 'mb-8'}
                                        style={{
                                            borderRadius: 8,
                                            overflow: 'hidden',
                                        }}
                                        onPress={handleSubmit}
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
                                                    Send Reset Link
                                                </Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {/* Back to Login */}
                                    <TouchableOpacity
                                        onPress={onBack}
                                        className="flex-row items-center justify-center"
                                    >
                                        <Ionicons name="arrow-back" size={16} color="#10A0F7" />
                                        <Text className="text-sm text-[#10A0F7] ml-2">
                                            Back to Login
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {/* Success State */}
                                    <View className="items-center mt-12">
                                        {/* Icon */}
                                        <View className="w-20 h-20 rounded-full bg-[#10A0F7]/10 dark:bg-[#10A0F7]/20 items-center justify-center mb-6">
                                            <Ionicons name="mail-outline" size={40} color="#10A0F7" />
                                        </View>

                                        {/* Title */}
                                        <Text className="text-xl font-semibold text-[#0f172a] dark:text-white mb-3">
                                            Check Your Email
                                        </Text>

                                        {/* Message */}
                                        <Text className="text-sm text-[#475569] dark:text-gray-400 text-center mb-8 px-4">
                                            We've sent password reset instructions to{'\n'}
                                            <Text className="font-semibold text-[#0f172a] dark:text-white">{email}</Text>
                                        </Text>

                                        {/* Info Box */}
                                        <View className="bg-[#FEF3C7] dark:bg-yellow-900/30 border border-[#F59E0B] dark:border-yellow-700/50 rounded-lg p-4 mb-8">
                                            <Text className="text-xs text-[#92400E] dark:text-yellow-200 text-center">
                                                ✉️ Didn't receive the email? Check your spam folder or try again in a few minutes.
                                            </Text>
                                        </View>

                                        {/* Actions */}
                                        <View className="w-full space-y-3">
                                            {/* Resend Email */}
                                            <TouchableOpacity
                                                className="mb-3"
                                                style={{
                                                    borderRadius: 8,
                                                    overflow: 'hidden',
                                                }}
                                                onPress={() => {
                                                    setEmailSent(false);
                                                    setEmail('');
                                                }}
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
                                                    <Text className="text-[#f1f5f9] text-center font-semibold text-sm">
                                                        Try Another Email
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            {/* Back to Login */}
                                            <TouchableOpacity
                                                onPress={onBack}
                                                className="py-3 flex-row items-center justify-center"
                                            >
                                                <Ionicons name="arrow-back" size={16} color="#10A0F7" />
                                                <Text className="text-sm text-[#10A0F7] ml-2">
                                                    Back to Login
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </ScrollView>
                    <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}
