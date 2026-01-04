import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, Image, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { bookingService } from '../../services';
import { useThemeColors } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState, Toast, Button } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import { DEFAULT_IMAGES } from '../../constants/images';

export default function MyTripsScreen({ navigation }: any) {
    const { isLoggedIn } = useAuth();
    const { bgColor, cardBg, textColor, secondaryTextColor, borderColor, isDark } = useThemeColors();

    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'REFUNDED' | 'PENDING' | 'PAID' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'>('PAID');
    const { toast, showToast, hideToast } = useToast();

    // Load bookings when screen gains focus
    useFocusEffect(
        useCallback(() => {
            console.log('🔄 MyTripsScreen focused - isLoggedIn:', isLoggedIn);
            if (isLoggedIn) {
                loadBookings();
            } else {
                console.log('⚠️  User not logged in - skipping booking load');
                setLoading(false);
            }
        }, [filter, isLoggedIn])
    );

    const loadBookings = async () => {
        try {
            setLoading(true);
            // For REFUNDED, we need to filter by paymentStatus instead of booking status
            const status = filter === 'REFUNDED' ? undefined : filter;
            console.log('📱 Loading bookings with filter:', filter, 'status:', status);
            const response = await bookingService.getBookings(1, 20, status as any, 'tenant');
            console.log('📱 Bookings response:', response);
            console.log('📱 Bookings loaded successfully:', response.data.bookings.length, 'bookings');

            if (response.data.bookings.length === 0) {
                console.log('⚠️  No bookings found - checking if user is logged in and has made bookings');
            }

            // Filter for refunded bookings if REFUNDED tab is selected
            const filteredBookings = filter === 'REFUNDED'
                ? response.data.bookings.filter((b: any) => b.paymentStatus === 'refunded')
                : response.data.bookings;

            setBookings(filteredBookings);
        } catch (error: any) {
            console.error('🔴 Load bookings error:', error);
            console.error('🔴 Error details:', error.response?.data || error.message);
            setBookings([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadBookings();
    };

    const handleCancelBooking = (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.cancelBooking(bookingId, 'Changed plans');
                            showToast('Booking cancelled successfully', 'success');
                            loadBookings();
                        } catch (error: any) {
                            showToast(error.message || 'Failed to cancel booking', 'error');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#FF9500';
            case 'PAID': return '#007AFF'; // Blue for Paid
            case 'APPROVED': return '#34C759';
            case 'REJECTED': return '#FF3B30';
            case 'CANCELLED': return '#9CA3AF';
            case 'COMPLETED': return '#00D9A3';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return 'time-outline';
            case 'PAID': return 'cash-outline';
            case 'APPROVED': return 'checkmark-circle';
            case 'REJECTED': return 'close-circle';
            case 'CANCELLED': return 'ban';
            case 'COMPLETED': return 'checkmark-done-circle';
            default: return 'help-circle';
        }
    };

    const getPaymentStatusColor = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'paid': return { bg: '#34C75920', text: '#34C759', icon: 'checkmark-circle' };
            case 'pending': return { bg: '#FF950020', text: '#FF9500', icon: 'time' };
            case 'refunded': return { bg: '#9C27B020', text: '#9C27B0', icon: 'refresh' };
            default: return { bg: '#9CA3AF20', text: '#9CA3AF', icon: 'help-circle' };
        }
    };

    const handlePayNow = (bookingId: string, amount: number, propertyTitle: string) => {
        navigation.navigate('Payment', {
            bookingId,
            amount,
            propertyTitle,
        });
    };

    if (loading) {
        return <LoadingState message="Loading your trips..." />;
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <View className="px-6 pt-16 pb-4">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    My Trips
                </Text>
                <Text className={`${secondaryTextColor} mb-4`}>
                    {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
                </Text>

                {/* Filter Tabs */}
                <View className="flex-row">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 24 }}
                    >
                        <View className="flex-row gap-3">
                            {['PENDING', 'PAID', 'APPROVED', 'COMPLETED', 'REFUNDED', 'CANCELLED'].map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setFilter(tab as any)}
                                    className={`px-5 py-2.5 rounded-xl border ${filter === tab
                                        ? 'bg-[#0EA5E9] border-[#0EA5E9]'
                                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className={`font-visby-bold text-sm ${filter === tab
                                        ? 'text-white'
                                        : isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Bookings List */}
            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 200 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInDown.delay(index * 100)}
                        className="mb-4"
                    >
                        <TouchableOpacity
                            onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
                            className={`${cardBg} rounded-2xl overflow-hidden border ${borderColor}`}
                            activeOpacity={0.7}
                        >
                            {/* Property Image */}
                            <Image
                                source={{ uri: item.property?.images?.[0] || DEFAULT_IMAGES.PROPERTY }}
                                className="w-full h-40"
                                resizeMode="cover"
                            />

                            <View className="p-4">
                                {/* Property Title */}
                                <Text className={`text-lg font-bold mb-1 ${textColor}`}>
                                    {item.property?.title}
                                </Text>

                                {/* Location */}
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center flex-1">
                                        <Ionicons name="location" size={14} color="#9CA3AF" />
                                        <Text className={`ml-1 text-sm ${secondaryTextColor}`} numberOfLines={1}>
                                            {item.property?.city}, {item.property?.state}
                                        </Text>
                                    </View>
                                    {item.property?.averageRating > 0 && (
                                        <View className="flex-row items-center ml-2">
                                            <Ionicons name="star" size={14} color="#FBBF24" />
                                            <Text className={`ml-1 text-sm font-semibold ${textColor}`}>
                                                {item.property.averageRating.toFixed(1)}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Dates */}
                                <View className="flex-row items-center mb-3">
                                    <View className="flex-1 flex-row items-center">
                                        <Ionicons name="calendar-outline" size={16} color="#00D9A3" />
                                        <Text className={`ml-2 text-sm ${textColor}`}>
                                            {new Date(item.checkInDate || item.startDate).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                                    <View className="flex-1 flex-row items-center justify-end">
                                        <Text className={`mr-2 text-sm ${textColor}`}>
                                            {new Date(item.checkOutDate || item.endDate).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={16} color="#00D9A3" />
                                    </View>
                                </View>

                                {/* Status and Payment Badge */}
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row gap-2">
                                        <View
                                            className="flex-row items-center px-3 py-1.5 rounded-full"
                                            style={{ backgroundColor: `${getStatusColor(item.status)}20` }}
                                        >
                                            <Ionicons
                                                name={getStatusIcon(item.status) as any}
                                                size={16}
                                                color={getStatusColor(item.status)}
                                            />
                                            <Text
                                                className="ml-1.5 text-xs font-semibold"
                                                style={{ color: getStatusColor(item.status) }}
                                            >
                                                {item.status === 'PENDING' && item.paymentStatus !== 'paid'
                                                    ? 'Awaiting Payment'
                                                    : item.status === 'PENDING' && item.paymentStatus === 'paid'
                                                        ? 'Awaiting Approval'
                                                        : item.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Price */}
                                    {item.totalPrice && (
                                        <Text className="text-primary font-bold text-base">
                                            RM {item.totalPrice.toLocaleString()}
                                        </Text>
                                    )}
                                </View>

                                {/* Action Buttons */}
                                <View className="gap-2">
                                    {/* Pay Now Button - for unpaid bookings */}
                                    {item.status === 'PENDING' && item.paymentStatus !== 'paid' && (
                                        <TouchableOpacity
                                            onPress={() => handlePayNow(item.id, item.totalPrice, item.property?.title)}
                                            className="bg-primary rounded-xl py-3 flex-row items-center justify-center gap-2"
                                        >
                                            <Ionicons name="card" size={18} color="white" />
                                            <Text className="text-white text-center font-semibold">
                                                Pay Now
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* Cancel Button - only available within 8 hours after payment and before approval */}
                                    {item.status === 'PENDING' && item.paymentStatus === 'paid' && (() => {
                                        const paymentTime = new Date(item.paymentDate || item.createdAt).getTime();
                                        const now = new Date().getTime();
                                        const hoursSincePayment = (now - paymentTime) / (1000 * 60 * 60);
                                        return hoursSincePayment < 8;
                                    })() && (
                                            <TouchableOpacity
                                                onPress={() => handleCancelBooking(item.id)}
                                                className="bg-red-500/10 border border-red-500/30 rounded-xl py-3"
                                            >
                                                <Text className="text-red-500 text-center font-semibold">
                                                    Cancel Booking
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                    {/* Cancel Button for unpaid bookings */}
                                    {item.status === 'PENDING' && item.paymentStatus !== 'paid' && (
                                        <TouchableOpacity
                                            onPress={() => handleCancelBooking(item.id)}
                                            className="bg-red-500/10 border border-red-500/30 rounded-xl py-3"
                                        >
                                            <Text className="text-red-500 text-center font-semibold">
                                                Cancel Booking
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <View className="items-center py-12">
                        <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                        <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                            No Trips Yet
                        </Text>
                        <Text className={`${secondaryTextColor} text-center mt-2 px-8`}>
                            {filter === 'REFUNDED'
                                ? 'No refunded bookings yet'
                                : `No ${filter.toLowerCase()} bookings found`
                            }
                        </Text>
                        {filter === 'REFUNDED' && (
                            <Button
                                onPress={() => navigation.navigate('Explore')}
                                variant="primary"
                                className="mt-6"
                            >
                                Explore Properties
                            </Button>
                        )}
                    </View>
                }
            />

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
