import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface BookingCardProps {
    booking: any;
    onPress: () => void;
    showDate?: boolean;
}

export function BookingCard({ booking, onPress, showDate = false }: BookingCardProps) {
    const { cardBg, textColor, isDark } = useThemeColors();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return { bg: 'bg-yellow-500/20', text: 'text-yellow-600' };
            case 'APPROVED': return { bg: 'bg-green-500/20', text: 'text-green-600' };
            case 'REJECTED': return { bg: 'bg-red-500/20', text: 'text-red-600' };
            default: return { bg: 'bg-gray-500/20', text: 'text-gray-600' };
        }
    };

    const statusColors = getStatusColor(booking.status);

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${cardBg} p-4 rounded-2xl`}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className={`text-base font-semibold ${textColor} flex-1 mr-2`}>
                    {booking.property.title}
                </Text>
                <View className={`px-3 py-1 rounded-full ${statusColors.bg}`}>
                    <Text className={`text-xs font-medium ${statusColors.text}`}>
                        {booking.status}
                    </Text>
                </View>
            </View>

            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-3">
                Tenant: {booking.tenant.firstName} {booking.tenant.lastName}
            </Text>

            <View className="flex-row items-center gap-4">
                {showDate && (
                    <View className="flex-row items-center mr-4">
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
                    <Text className={`text-sm ${textColor}`}>
                        MYR {booking.rentAmount.toLocaleString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
