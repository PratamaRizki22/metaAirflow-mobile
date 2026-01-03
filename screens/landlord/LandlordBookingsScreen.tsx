import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { bookingService } from '../../services';
import { LoadingState, Toast } from '../../components/common';
import { BookingCard } from '../../components/booking';

export function LandlordBookingsScreen({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [refreshing, setRefreshing] = useState(false);

    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const { toast, showToast, hideToast } = useToast();

    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

    const loadBookings = async () => {
        try {
            setLoading(true);
            // Get bookings as landlord (property owner)
            const response = await bookingService.getBookings(1, 50, undefined, 'landlord');
            setBookings(response.data.bookings);
        } catch (error: any) {
            showToast(error.message || 'Failed to load bookings', 'error');
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
            {/* Fixed Header */}
            <View className="px-6 pt-16 pb-4">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Bookings
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                    Manage booking requests from tenants
                </Text>

                {/* Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
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
                                    {status === 'all' ? 'All' : status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 24,
                    paddingBottom: 200,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
                        <Ionicons
                            name="calendar-outline"
                            size={64}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                            No bookings
                        </Text>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center px-8">
                            {filter === 'all'
                                ? 'No booking requests from tenants yet'
                                : `No bookings with status ${filter}`
                            }
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
            </ScrollView>

            {/* Toast Notification */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </View>
    );
}
