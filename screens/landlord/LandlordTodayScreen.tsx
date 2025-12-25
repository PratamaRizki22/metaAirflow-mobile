import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services';
import { useThemeColors } from '../../hooks';

export function LandlordTodayScreen({ navigation }: any) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [todayBookings, setTodayBookings] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        revenue: 0,
    });

    const { bgColor, textColor, cardBg, isDark } = useThemeColors();

    useEffect(() => {
        loadTodayData();
    }, []);

    const loadTodayData = async () => {
        try {
            setLoading(true);
            // Get bookings as owner
            const response = await bookingService.getBookings(1, 10, undefined, 'owner');

            // Filter today's bookings
            const today = new Date().toDateString();
            const todayItems = response.data.bookings.filter((booking: any) => {
                const bookingDate = new Date(booking.createdAt).toDateString();
                return bookingDate === today;
            });

            setTodayBookings(todayItems);

            // Calculate stats
            const pending = response.data.bookings.filter((b: any) => b.status === 'PENDING').length;
            const approved = response.data.bookings.filter((b: any) => b.status === 'APPROVED').length;

            setStats({ pending, approved, revenue: 0 });
        } catch (error) {
            console.error('Error loading today data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 ${bgColor} justify-center items-center`}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="px-6 pt-16 pb-6">
                {/* Header */}
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Today
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>

                {/* Stats Cards */}
                <View className="flex-row gap-3 mb-6">
                    <View className={`flex-1 ${cardBg} p-4 rounded-2xl`}>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                            Pending
                        </Text>
                        <Text className={`text-2xl font-bold ${textColor}`}>
                            {stats.pending}
                        </Text>
                    </View>
                    <View className={`flex-1 ${cardBg} p-4 rounded-2xl`}>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                            Approved
                        </Text>
                        <Text className={`text-2xl font-bold ${textColor}`}>
                            {stats.approved}
                        </Text>
                    </View>
                </View>

                {/* Today's Bookings */}
                <Text className={`text-xl font-bold mb-4 ${textColor}`}>
                    Booking Hari Ini
                </Text>

                {todayBookings.length === 0 ? (
                    <View className={`${cardBg} p-8 rounded-2xl items-center`}>
                        <Ionicons
                            name="calendar-outline"
                            size={48}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-4 text-center">
                            Tidak ada booking baru hari ini
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {todayBookings.map((booking) => (
                            <TouchableOpacity
                                key={booking.id}
                                onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                                className={`${cardBg} p-4 rounded-2xl`}
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className={`text-base font-semibold ${textColor} flex-1`}>
                                        {booking.property.title}
                                    </Text>
                                    <View className={`px-3 py-1 rounded-full ${booking.status === 'PENDING' ? 'bg-yellow-500/20' :
                                        booking.status === 'APPROVED' ? 'bg-green-500/20' :
                                            'bg-red-500/20'
                                        }`}>
                                        <Text className={`text-xs font-medium ${booking.status === 'PENDING' ? 'text-yellow-600' :
                                            booking.status === 'APPROVED' ? 'text-green-600' :
                                                'text-red-600'
                                            }`}>
                                            {booking.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                    Tenant: {booking.tenant.firstName} {booking.tenant.lastName}
                                </Text>
                                <Text className={`text-sm mt-2 ${textColor}`}>
                                    MYR {booking.rentAmount.toLocaleString()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Quick Actions */}
                <Text className={`text-xl font-bold mb-4 mt-6 ${textColor}`}>
                    Quick Actions
                </Text>
                <View className="gap-3">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ManageProperties')}
                        className={`${cardBg} p-4 rounded-2xl flex-row items-center justify-between`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="home-outline" size={24} color="#007AFF" />
                            <Text className={`ml-3 text-base font-medium ${textColor}`}>
                                Kelola Properti
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateProperty')}
                        className={`${cardBg} p-4 rounded-2xl flex-row items-center justify-between`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                            <Text className={`ml-3 text-base font-medium ${textColor}`}>
                                Tambah Properti Baru
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
