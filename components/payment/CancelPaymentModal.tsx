import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface CancelPaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    paymentDetails: {
        propertyTitle: string;
        amount: number;
    };
}

export function CancelPaymentModal({
    visible,
    onClose,
    onConfirm,
    paymentDetails,
}: CancelPaymentModalProps) {
    const { isDark, textColor } = useThemeColors();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
            onClose();
        } catch (error) {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View
                    className={`w-full max-w-md rounded-3xl p-6 ${isDark ? 'bg-[#1E293B]' : 'bg-white'
                        }`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-yellow-500/10 items-center justify-center mr-3">
                                <Ionicons name="close-circle" size={20} color="#F59E0B" />
                            </View>
                            <Text className={`text-xl font-bold ${textColor}`}>
                                Cancel Payment
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Ionicons
                                name="close-circle"
                                size={28}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Property Info */}
                    <View
                        className={`rounded-2xl p-4 mb-4 ${isDark ? 'bg-[#0F172A]' : 'bg-gray-50'
                            }`}
                    >
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-2">
                            Property
                        </Text>
                        <Text className={`font-semibold ${textColor}`}>
                            {paymentDetails.propertyTitle}
                        </Text>
                        <Text className={`text-2xl font-bold mt-2 ${textColor}`}>
                            MYR {paymentDetails.amount.toLocaleString('en-MY', {
                                minimumFractionDigits: 2,
                            })}
                        </Text>
                    </View>

                    {/* Warning */}
                    <View
                        className={`rounded-xl p-3 mb-4 ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
                            }`}
                    >
                        <View className="flex-row">
                            <Ionicons
                                name="warning"
                                size={16}
                                color="#F59E0B"
                                style={{ marginRight: 8, marginTop: 2 }}
                            />
                            <Text className="flex-1 text-xs text-yellow-600 dark:text-yellow-400">
                                Are you sure you want to cancel this pending payment? This action cannot be
                                undone and you'll need to create a new booking if you change your mind.
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={loading}
                            className={`flex-1 rounded-xl py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                        >
                            <Text
                                className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                            >
                                Keep Payment
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={loading}
                            className={`flex-1 rounded-xl py-3 ${loading ? 'bg-yellow-300' : 'bg-yellow-500'
                                }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white text-center font-semibold">
                                    Yes, Cancel
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
