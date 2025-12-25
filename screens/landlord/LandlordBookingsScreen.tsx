import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { bookingService } from '../../services';

export function LandlordBookingsScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            // Get bookings as owner
            const response = await bookingService.getBookings(1, 50, undefined, 'owner');
            setBookings(response.data.bookings);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status.toLowerCase() === filter;
    });

    if (loading) {
        return (
            <View className={`flex-1 ${bgColor} justify-center items-center`}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView>
                <View className="px-6 pt-16 pb-6">
                    <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                        Bookings
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                        Kelola booking request dari tenant
                    </Text>

                    {/* Filter Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                    >
                        <View className="flex-row gap-2">
                            {['all', 'pending', 'approved', 'rejected'].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    onPress={() => setFilter(status as any)}
                                    className={`px-4 py-2 rounded-full ${filter === status
                                        ? 'bg-primary'
                                        : isDark ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}
                                >
                                    <Text className={`font-medium capitalize ${filter === status
                                        ? 'text-white'
                                        : isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {status === 'all' ? 'Semua' : status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Bookings List */}
                    {filteredBookings.length === 0 ? (
                        <View className={`${cardBg} p-8 rounded-2xl items-center`}>
                            <Ionicons
                                name="calendar-outline"
                                size={48}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-4 text-center">
                                Tidak ada booking {filter !== 'all' ? filter : ''}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {filteredBookings.map((booking) => (
                                <TouchableOpacity
                                    key={booking.id}
                                    onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                                    className={`${cardBg} p-4 rounded-2xl`}
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1">
                                            <Text className={`text-base font-semibold ${textColor} mb-1`}>
                                                {booking.property.title}
                                            </Text>
                                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                                Tenant: {booking.tenant.firstName} {booking.tenant.lastName}
                                            </Text>
                                        </View>
                                        <View className={`px-3 py-1 rounded-full ${booking.status === 'PENDING' ? 'bg-yellow-500/20' :
                                            booking.status === 'APPROVED' ? 'bg-green-500/20' :
                                                booking.status === 'REJECTED' ? 'bg-red-500/20' :
                                                    'bg-gray-500/20'
                                            }`}>
                                            <Text className={`text-xs font-medium ${booking.status === 'PENDING' ? 'text-yellow-600' :
                                                booking.status === 'APPROVED' ? 'text-green-600' :
                                                    booking.status === 'REJECTED' ? 'text-red-600' :
                                                        'text-gray-600'
                                                }`}>
                                                {booking.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center gap-4">
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
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="cash-outline"
                                                size={16}
                                                color={isDark ? '#9CA3AF' : '#6B7280'}
                                            />
                                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-1">
                                                MYR {booking.rentAmount.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
