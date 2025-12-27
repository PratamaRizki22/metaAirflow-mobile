import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface RefundModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    bookingDetails: {
        propertyTitle: string;
        amount: number;
        completedDate?: string;
    };
    daysRemaining: number;
}

export function RefundModal({
    visible,
    onClose,
    onConfirm,
    bookingDetails,
    daysRemaining,
}: RefundModalProps) {
    const { isDark, textColor } = useThemeColors();
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) {
            return;
        }

        try {
            setLoading(true);
            await onConfirm(reason);
            setReason('');
            onClose();
        } catch (error) {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setReason('');
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
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
                    <ScrollView className="max-h-96">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center mr-3">
                                    <Ionicons name="arrow-undo" size={20} color="#EF4444" />
                                </View>
                                <Text className={`text-xl font-bold ${textColor}`}>
                                    Request Refund
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleClose} disabled={loading}>
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
                                {bookingDetails.propertyTitle}
                            </Text>
                            <Text className={`text-2xl font-bold mt-2 ${textColor}`}>
                                MYR {bookingDetails.amount.toLocaleString('en-MY', {
                                    minimumFractionDigits: 2,
                                })}
                            </Text>
                        </View>

                        {/* Eligibility Warning */}
                        <View
                            className={`rounded-xl p-3 mb-4 ${daysRemaining <= 2
                                    ? isDark
                                        ? 'bg-red-900/20'
                                        : 'bg-red-50'
                                    : isDark
                                        ? 'bg-yellow-900/20'
                                        : 'bg-yellow-50'
                                }`}
                        >
                            <View className="flex-row">
                                <Ionicons
                                    name="time-outline"
                                    size={16}
                                    color={daysRemaining <= 2 ? '#EF4444' : '#F59E0B'}
                                    style={{ marginRight: 8, marginTop: 2 }}
                                />
                                <Text
                                    className="flex-1 text-xs"
                                    style={{
                                        color: daysRemaining <= 2 ? '#EF4444' : '#F59E0B',
                                    }}
                                >
                                    {daysRemaining <= 2
                                        ? `⚠️ Only ${daysRemaining} day${daysRemaining > 1 ? 's' : ''
                                        } left to request a refund!`
                                        : `You have ${daysRemaining} days left to request a refund (within 7 days of payment)`}
                                </Text>
                            </View>
                        </View>

                        {/* Reason Input */}
                        <View className="mb-4">
                            <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                                Reason for Refund <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                value={reason}
                                onChangeText={setReason}
                                placeholder="Please explain why you're requesting a refund..."
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                multiline
                                numberOfLines={4}
                                className={`rounded-xl p-3 text-base ${isDark
                                        ? 'bg-[#0F172A] text-white border-gray-700'
                                        : 'bg-gray-50 text-gray-900 border-gray-300'
                                    } border`}
                                style={{ textAlignVertical: 'top', minHeight: 100 }}
                                editable={!loading}
                            />
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">
                                Minimum 10 characters
                            </Text>
                        </View>

                        {/* Info Box */}
                        <View
                            className={`rounded-xl p-3 mb-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                                }`}
                        >
                            <View className="flex-row">
                                <Ionicons
                                    name="information-circle"
                                    size={16}
                                    color="#3B82F6"
                                    style={{ marginRight: 8, marginTop: 2 }}
                                />
                                <Text className="flex-1 text-xs text-blue-600 dark:text-blue-400">
                                    Refund requests are processed within 5-7 business days. The amount
                                    will be credited back to your original payment method.
                                </Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleClose}
                                disabled={loading}
                                className={`flex-1 rounded-xl py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}
                            >
                                <Text
                                    className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirm}
                                disabled={loading || reason.trim().length < 10}
                                className={`flex-1 rounded-xl py-3 ${loading || reason.trim().length < 10
                                        ? 'bg-red-300'
                                        : 'bg-red-500'
                                    }`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white text-center font-semibold">
                                        Request Refund
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
