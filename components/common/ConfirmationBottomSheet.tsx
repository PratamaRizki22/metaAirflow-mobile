import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FilterBottomSheet } from '../search/FilterBottomSheet';
import { Button } from '../common';
import { useTheme } from '../../contexts/ThemeContext';

interface ConfirmationBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'danger' | 'secondary';
}

export function ConfirmationBottomSheet({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'danger',
}: ConfirmationBottomSheetProps) {
    const { isDark } = useTheme();
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    return (
        <FilterBottomSheet visible={visible} onClose={onClose} title={title}>
            <View className="py-4">
                <Text className={`text-base leading-6 mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {message}
                </Text>

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Button
                            onPress={onClose}
                            variant="secondary"
                            className={`py-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                        >
                            {cancelText}
                        </Button>
                    </View>

                    <View className="flex-1">
                        <Button
                            onPress={onConfirm}
                            variant={confirmVariant}
                            className="py-4"
                        >
                            {confirmText}
                        </Button>
                    </View>
                </View>
            </View>
        </FilterBottomSheet>
    );
}
