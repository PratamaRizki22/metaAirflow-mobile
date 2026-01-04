import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { bookingService } from '../../services';
import { LoadingState, Toast, Button } from '../../components/common';
import { BookingCard } from '../../components/booking';

export function LandlordBookingsScreen({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'approved' | 'completed' | 'refunded' | 'rejected'>('all');
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

    const handleApprove = async (bookingId: string) => {
        try {
            setLoading(true);
            await bookingService.approveBooking(bookingId);
            showToast('Booking approved successfully', 'success');
            await loadBookings();
        } catch (error: any) {
            showToast(error.message || 'Failed to approve booking', 'error');
            setLoading(false);
        }
    };

    const handleReject = async (bookingId: string, status: string) => {
        const isPaid = status === 'PAID';
        Alert.alert(
            isPaid ? 'Refund & Cancel' : 'Reject Booking',
            isPaid
                ? 'This booking is PAID. Cancelling it will issue a refund. Continue?'
                : 'Are you sure you want to reject this request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: isPaid ? 'Yes, Refund' : 'Yes, Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await bookingService.rejectBooking(bookingId, isPaid ? 'Cancelled & Refunded by Landlord' : 'Rejected by Landlord');
                            showToast(isPaid ? 'Refund processed successfully' : 'Booking rejected', 'success');
                            await loadBookings();
                        } catch (error: any) {
                            showToast(error.message || 'Failed to reject booking', 'error');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
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
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    <View className="flex-row gap-3">
                        {['all', 'pending', 'paid', 'approved', 'completed', 'refunded'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                onPress={() => setFilter(status as any)}
                                className={`px-5 py-2.5 rounded-xl border ${filter === status
                                    ? 'bg-[#0EA5E9] border-[#0EA5E9]'
                                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    }`}
                            >
                                <Text className={`font-visby-bold text-sm ${filter === status
                                    ? 'text-white'
                                    : isDark ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    {status.toUpperCase()}
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
                                renderActions={() => {
                                    // Only show actions for PENDING or PAID bookings
                                    if (booking.status !== 'PENDING' && booking.status !== 'PAID') return null;

                                    return (
                                        <View className="flex-row gap-3 mt-2">
                                            <View className="flex-1">
                                                <Button
                                                    onPress={() => handleApprove(booking.id)}
                                                    variant="primary"
                                                    size="sm"
                                                    fullWidth
                                                >
                                                    {booking.status === 'PAID' ? 'Approve' : 'Accept'}
                                                </Button>
                                            </View>

                                            <View className="flex-1">
                                                <Button
                                                    onPress={() => handleReject(booking.id, booking.status)}
                                                    variant="danger"
                                                    size="sm"
                                                    fullWidth
                                                >
                                                    {booking.status === 'PAID' ? 'Refund & Cancel' : 'Reject'}
                                                </Button>
                                            </View>
                                        </View>
                                    );
                                }}
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
