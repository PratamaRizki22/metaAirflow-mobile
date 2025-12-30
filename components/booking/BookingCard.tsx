import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface BookingCardProps {
    booking: any;
    onPress: () => void;
    showDate?: boolean;
    showPayButton?: boolean;
    onPayPress?: () => void;
}

export function BookingCard({ booking, onPress, showDate = false, showPayButton = false, onPayPress }: BookingCardProps) {
    const { cardBg, textColor, isDark } = useThemeColors();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return { bg: 'bg-yellow-500/20', text: 'text-yellow-600' };
            case 'APPROVED': return { bg: 'bg-green-500/20', text: 'text-green-600' };
            case 'REJECTED': return { bg: 'bg-red-500/20', text: 'text-red-600' };
            case 'CANCELLED': return { bg: 'bg-gray-500/20', text: 'text-gray-600' };
            default: return { bg: 'bg-gray-500/20', text: 'text-gray-600' };
        }
    };

    const getPaymentStatusColor = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'paid': return { bg: 'bg-emerald-500/20', text: 'text-emerald-600', icon: 'checkmark-circle' };
            case 'pending': return { bg: 'bg-amber-500/20', text: 'text-amber-600', icon: 'time' };
            case 'refunded': return { bg: 'bg-purple-500/20', text: 'text-purple-600', icon: 'refresh' };
            default: return { bg: 'bg-gray-500/20', text: 'text-gray-600', icon: 'help-circle' };
        }
    };

    const statusColors = getStatusColor(booking.status);
    const paymentColors = getPaymentStatusColor(booking.paymentStatus);
    const canPay = booking.status === 'APPROVED' && booking.paymentStatus === 'pending';

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${cardBg} p-4 rounded-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-3`}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className={`text-base font-semibold ${textColor} flex-1 mr-2`}>
                    {booking.property.title}
                </Text>
                <View className="flex-row gap-2">
                    <View className={`px-3 py-1 rounded-full ${statusColors.bg}`}>
                        <Text className={`text-xs font-medium ${statusColors.text}`}>
                            {booking.status}
                        </Text>
                    </View>
                </View>
            </View>

            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-3">
                Tenant: {booking.tenant.firstName} {booking.tenant.lastName}
            </Text>

            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-4">
                    {showDate && (
                        <View className="flex-row items-center">
                            <Ionicons
                                name="calendar-outline"
                                size={16}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-1">
                                {new Date(booking.startDate).toLocaleDateString('id-ID')}
                            </Text>
                        </View>
                    )}

                    <View className="flex-row items-center">
                        <Ionicons
                            name="cash-outline"
                            size={16}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                            style={{ marginRight: 4 }}
                        />
                        <Text className={`text-sm font-semibold ${textColor}`}>
                            MYR {booking.totalPrice?.toLocaleString() || booking.rentAmount?.toLocaleString()}
                        </Text>
                    </View>
                </View>

                <View className={`px-2.5 py-1 rounded-full ${paymentColors.bg} flex-row items-center gap-1`}>
                    <Ionicons
                        name={paymentColors.icon as any}
                        size={12}
                        color={paymentColors.text.replace('text-', '#')}
                    />
                    <Text className={`text-xs font-medium ${paymentColors.text} capitalize`}>
                        {booking.paymentStatus}
                    </Text>
                </View>
            </View>

            {(showPayButton && canPay && onPayPress) && (
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        onPayPress();
                    }}
                    className="bg-indigo-500 py-2.5 rounded-xl flex-row items-center justify-center gap-2"
                >
                    <Ionicons name="card" size={18} color="white" />
                    <Text className="text-white font-semibold">Pay Now</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}
