import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
}

export function CustomAlert({ visible, title, message, buttons = [], onDismiss }: CustomAlertProps) {
    const { isDark, textColor } = useThemeColors();

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    const getButtonStyle = (style?: string) => {
        switch (style) {
            case 'cancel':
                return isDark ? 'text-gray-400' : 'text-gray-600';
            case 'destructive':
                return 'text-red-500';
            default:
                return 'text-primary';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onDismiss}
                className="flex-1 bg-black/50 justify-center items-center px-6"
            >
                <TouchableOpacity
                    activeOpacity={1}
                    className={`w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-[#1E293B]' : 'bg-white'}`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    {/* Title */}
                    <Text className={`text-xl font-bold mb-3 text-center ${textColor}`}>
                        {title}
                    </Text>

                    {/* Message */}
                    {message && (
                        <Text className={`text-base mb-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {message}
                        </Text>
                    )}

                    {/* Buttons */}
                    {buttons.length > 0 && (
                        <View className={`flex-row ${buttons.length === 1 ? 'justify-center' : 'justify-between'} gap-3 w-full`}>
                            {buttons.map((button, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleButtonPress(button)}
                                    className={`px-4 py-3 rounded-xl flex-1 items-center justify-center ${button.style === 'default' || !button.style
                                        ? 'bg-primary'
                                        : isDark
                                            ? 'bg-gray-700'
                                            : 'bg-gray-200'
                                        }`}
                                >
                                    <Text
                                        className={`text-center font-bold text-base ${button.style === 'default' || !button.style
                                            ? 'text-white'
                                            : getButtonStyle(button.style)
                                            }`}
                                        numberOfLines={1}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

// Hook untuk menggunakan CustomAlert
export function useCustomAlert() {
    const [alertConfig, setAlertConfig] = React.useState<CustomAlertProps>({
        visible: false,
        title: '',
        message: '',
        buttons: [],
    });

    const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons: buttons || [{ text: 'OK', style: 'default' }],
            onDismiss: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    return {
        alertConfig,
        showAlert,
        hideAlert,
        AlertComponent: () => <CustomAlert {...alertConfig} />,
    };
}
