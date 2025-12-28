import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks';
import { bookingService } from '../../services';
import { LoadingState } from '../../components/common';
import { BookingCard } from '../../components/booking';

export function LandlordBookingsScreen({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [refreshing, setRefreshing] = useState(false);

    const { bgColor, textColor, cardBg, isDark } = useThemeColors();

    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

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

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status.toLowerCase() === filter;
    });

    if (loading) {
        return <LoadingState />;
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        progressViewOffset={100}
                    />
                }
            >
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
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                                    showDate={true}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
