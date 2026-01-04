import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

    const content = (
        <>
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#10A0F7' : '#FFFFFF'} />
            ) : (
                <Text className={`${textColorStyles[variant]} ${textSizeStyles[size]} font-semibold`}>
                    {children}
                </Text>
            )}
        </>
    );

    if (variant === 'primary' && !disabled && !loading) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                className={`${fullWidth ? 'w-full' : ''} ${className}`}
                style={{
                    shadowColor: '#10A0F7',
                    shadowOffset: { width: 0, height: 4 }, // Adjusted offset
                    shadowOpacity: 0.3, // Slightly reduced opacity
                    shadowRadius: 8,
                    elevation: 5,
                    backgroundColor: 'transparent', // Important for shadow on some versions
                }}
            >
                <LinearGradient
                    colors={['#10A0F7', '#01E8AD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 9999 }} // Apply border radius here
                    className={`
                        ${sizeStyles[size]}
                        ${fullWidth ? 'w-full' : ''}
                        items-center
                        justify-center
                    `}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? 'w-full' : ''}
                rounded-full
                items-center
                justify-center
                ${className}
            `}
            style={{
                borderRadius: 9999, // rounded-full equivalent
                shadowColor: variant === 'danger' ? '#ef4444' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: variant === 'danger' ? 2 : 0,
            }}
        >
            {content}
        </TouchableOpacity>
    );
}
