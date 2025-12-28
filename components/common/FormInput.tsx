import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useThemeColors } from '../../hooks';

interface FormInputProps extends TextInputProps {
    label?: string;
    required?: boolean;
    error?: string;
    containerStyle?: any;
}

export function FormInput({
    label,
    required,
    error,
    containerStyle,
    style,
    rightElement,
    ...props
}: FormInputProps & { rightElement?: React.ReactNode }) {
    const { cardBg, textColor, borderColor, isDark } = useThemeColors();

    return (
        <View className="mb-4" style={containerStyle}>
            {label && (
                <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                    {label} {required && <Text className="text-red-500">*</Text>}
                </Text>
            )}
            <View className="relative">
                <TextInput
                    placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
                    className={`${cardBg} border ${error ? 'border-red-500' : borderColor} rounded-xl px-4 py-3 ${textColor} ${rightElement ? 'pr-12' : ''}`}
                    style={[style]}
                    {...props}
                />
                {rightElement && (
                    <View className="absolute right-4 top-0 bottom-0 justify-center">
                        {rightElement}
                    </View>
                )}
            </View>
            {error && (
                <Text className="text-red-500 text-xs mt-1">{error}</Text>
            )}
        </View>
    );
}
