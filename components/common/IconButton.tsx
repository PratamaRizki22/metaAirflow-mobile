import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface IconButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    disabled?: boolean;
    badge?: number;
    className?: string;
}

/**
 * Reusable Icon Button Component
 * Perfect for toolbar actions, navigation, etc.
 */
export function IconButton({
    icon,
    onPress,
    size = 'md',
    variant = 'ghost',
    disabled = false,
    badge,
    className = '',
}: IconButtonProps) {
    const { isDark } = useTheme();

    // Size mappings
    const sizeMap = {
        sm: { container: 'w-8 h-8', icon: 18 },
        md: { container: 'w-12 h-12', icon: 24 },
        lg: { container: 'w-14 h-14', icon: 28 },
    };

    // Variant styles
    const variantStyles = {
        primary: 'bg-primary',
        secondary: isDark ? 'bg-gray-700' : 'bg-gray-200',
        ghost: isDark ? 'bg-gray-700' : 'bg-gray-100',
        danger: 'bg-red-500',
    };

    // Icon color
    const iconColor = {
        primary: '#FFFFFF',
        secondary: isDark ? '#FFFFFF' : '#1F2937',
        ghost: '#00D9A3',
        danger: '#FFFFFF',
    };

    return (
        <View className="relative">
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                className={`
                    ${sizeMap[size].container}
                    ${variantStyles[variant]}
                    ${disabled ? 'opacity-50' : ''}
                    rounded-full
                    items-center
                    justify-center
                    ${className}
                `}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: variant === 'ghost' ? 3 : 2,
                }}
            >
                <Ionicons
                    name={icon}
                    size={sizeMap[size].icon}
                    color={iconColor[variant]}
                />
            </TouchableOpacity>

            {/* Badge */}
            {badge !== undefined && badge > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                        {badge > 9 ? '9+' : badge}
                    </Text>
                </View>
            )}
        </View>
    );
}
