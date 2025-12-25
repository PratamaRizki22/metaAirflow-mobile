import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface LoginPromptProps {
    visible?: boolean;
    title?: string;
    message?: string;
    onLogin?: () => void;
    onRegister?: () => void;
    onClose?: () => void;
    onLoginPress?: () => void; // For inline variant
    variant?: 'modal' | 'inline';
}

export function LoginPrompt({
    visible = false,
    title = 'Login Required',
    message = 'Please login to continue',
    onLogin,
    onRegister,
    onClose,
    onLoginPress,
    variant = 'modal',
}: LoginPromptProps) {
    const { isDark } = useTheme();
    const bgColor = isDark ? 'bg-surface-dark' : 'bg-surface-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const secondaryTextColor = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';

    // Inline variant (for use in screens)
    if (variant === 'inline') {
        return (
            <View className={`${cardBg} rounded-2xl p-6 mb-4`}>
                {/* Icon */}
                <View className="items-center mb-4">
                    <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center">
                        <Ionicons name="lock-closed" size={40} color="#14B8A6" />
                    </View>
                </View>

                {/* Title */}
                <Text className={`text-xl font-bold text-center mb-2 ${textColor}`}>
                    {title}
                </Text>

                {/* Message */}
                <Text className={`text-base text-center mb-6 ${secondaryTextColor}`}>
                    {message}
                </Text>

                {/* Button */}
                <TouchableOpacity
                    onPress={onLoginPress}
                    className="bg-primary py-4 rounded-xl"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-center font-semibold text-base">
                        Go to Profile & Login
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Modal variant (original)
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className={`${bgColor} rounded-3xl p-6 w-full max-w-sm`}>
                    {/* Icon */}
                    <View className="items-center mb-4">
                        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center">
                            <Text className="text-3xl">🔐</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text className={`text-2xl font-bold text-center mb-2 ${textColor}`}>
                        {title}
                    </Text>

                    {/* Message */}
                    <Text className={`text-base text-center mb-6 ${secondaryTextColor}`}>
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={onLogin}
                            className="bg-primary py-4 rounded-2xl"
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                Login
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onRegister}
                            className="bg-primary/10 py-4 rounded-2xl"
                            activeOpacity={0.8}
                        >
                            <Text className="text-primary text-center font-semibold text-base">
                                Create Account
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            className="py-3"
                            activeOpacity={0.6}
                        >
                            <Text className={`text-center ${secondaryTextColor}`}>
                                Maybe Later
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

