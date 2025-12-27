import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
}

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and states
 */
export function Button({
    onPress,
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
}: ButtonProps) {
    const { isDark } = useTheme();

    // Variant styles
    const variantStyles = {
        primary: `bg-primary ${disabled ? 'opacity-50' : ''}`,
        secondary: isDark ? 'bg-gray-700' : 'bg-gray-200',
        outline: `border-2 border-primary ${isDark ? 'bg-transparent' : 'bg-transparent'}`,
        danger: `bg-red-500 ${disabled ? 'opacity-50' : ''}`,
        ghost: 'bg-transparent',
    };

    // Text color styles
    const textColorStyles = {
        primary: 'text-white',
        secondary: isDark ? 'text-white' : 'text-gray-900',
        outline: 'text-primary',
        danger: 'text-white',
        ghost: 'text-primary',
    };

    // Size styles
    const sizeStyles = {
        sm: 'px-4 py-2',
        md: 'px-6 py-3',
        lg: 'px-8 py-4',
    };

    const textSizeStyles = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? 'w-full' : ''}
                rounded-xl
                items-center
                justify-center
                ${className}
            `}
            style={{
                shadowColor: variant === 'primary' || variant === 'danger' ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: variant === 'primary' || variant === 'danger' ? 2 : 0,
            }}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#00D9A3' : '#FFFFFF'} />
            ) : (
                <Text className={`${textColorStyles[variant]} ${textSizeStyles[size]} font-semibold`}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
}
