import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useThemeColors } from '../../hooks';
import { Button } from './Button';

interface LoadingStateProps {
    message?: string;
    size?: 'small' | 'large';
    color?: string;
}

/**
 * Reusable loading state component
 * Consistent loading UI across the app
 */
export function LoadingState({ message, size = 'large', color }: LoadingStateProps) {
    const { bgColor, secondaryTextColor } = useThemeColors();

    return (
        <View className={`flex-1 ${bgColor} items-center justify-center`}>
            <ActivityIndicator size={size} color={color || '#00D9A3'} />
            {message && (
                <Text className={`mt-4 ${secondaryTextColor}`}>{message}</Text>
            )}
        </View>
    );
}

interface EmptyStateProps {
    icon?: string;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Reusable empty state component
 * Consistent empty state UI across the app
 */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
    const { bgColor, textColor, secondaryTextColor } = useThemeColors();
    const Ionicons = require('@expo/vector-icons').Ionicons;

    return (
        <View className={`flex-1 ${bgColor} items-center justify-center px-6`}>
            {icon && <Ionicons name={icon} size={64} color="#9CA3AF" />}
            <Text className={`text-xl font-bold mt-4 text-center ${textColor}`}>{title}</Text>
            {message && (
                <Text className={`mt-2 text-center ${secondaryTextColor}`}>{message}</Text>
            )}
            {actionLabel && onAction && (
                <View className="mt-6">
                    <Button
                        onPress={onAction}
                        variant="primary"
                    >
                        {actionLabel}
                    </Button>
                </View>
            )}
        </View>
    );
}

interface ErrorStateProps {
    title?: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Reusable error state component
 * Consistent error UI across the app
 */
export function ErrorState({
    title = 'Oops!',
    message,
    actionLabel = 'Try Again',
    onAction,
}: ErrorStateProps) {
    const { bgColor, textColor, secondaryTextColor } = useThemeColors();
    const Ionicons = require('@expo/vector-icons').Ionicons;

    return (
        <View className={`flex-1 ${bgColor} items-center justify-center px-6`}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text className={`text-xl font-bold mt-4 text-center ${textColor}`}>{title}</Text>
            <Text className={`mt-2 text-center ${secondaryTextColor}`}>{message}</Text>
            {onAction && (
                <View className="mt-6">
                    <Button
                        onPress={onAction}
                        variant="primary"
                    >
                        {actionLabel}
                    </Button>
                </View>
            )}
        </View>
    );
}
