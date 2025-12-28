import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ChipButtonProps {
    label: string;
    onPress: () => void;
    active?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    disabled?: boolean;
    className?: string;
}

/**
 * Chip Button Component
 * Perfect for filters, tags, and selections
 */
export function ChipButton({
    label,
    onPress,
    active = false,
    icon,
    disabled = false,
    className = '',
}: ChipButtonProps) {
    const { isDark } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`
                flex-row items-center px-4 py-2.5 rounded-full border
                ${active
                    ? 'bg-primary/10 border-primary'
                    : isDark
                        ? 'bg-surface-dark border-gray-600'
                        : 'bg-white border-gray-300'
                }
                ${disabled ? 'opacity-50' : ''}
                ${className}
            `}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={16}
                    color={active ? '#00D9A3' : isDark ? '#9CA3AF' : '#6B7280'}
                    style={{ marginRight: 6 }}
                />
            )}
            <Text
                className={`font-medium text-sm ${active
                        ? 'text-primary'
                        : isDark
                            ? 'text-gray-300'
                            : 'text-gray-700'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}
