import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService, reviewService, propertyService } from '../../services';
import { useThemeColors } from '../../hooks';
import { ReviewCard } from '../../components/review';
import { LoadingState, TabBarBottomSpacer } from '../../components/common';
import { BookingCard } from '../../components/booking';

export function LandlordTodayScreen({ navigation }: any) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [todayBookings, setTodayBookings] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        revenue: 0,
    });
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const { bgColor, textColor, cardBg, isDark } = useThemeColors();

    // Component lifecycle logging for memory management verification
    useEffect(() => {
        console.log('🟢 [LANDLORD MODE] LandlordTodayScreen MOUNTED - Memory allocated');

        return () => {
            console.log('🔴 [LANDLORD MODE] LandlordTodayScreen UNMOUNTED - Memory released');
            console.log('   → Bookings data cleared from memory');
            console.log('   → Stats data cleared from memory');
            console.log('   → Reviews data cleared from memory');
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTodayData();
            loadRecentReviews();
        }, [])
    );

    const loadTodayData = async () => {
        try {
            setLoading(true);
            // Get all bookings as landlord (property owner) - increase limit to get more data
            const response = await bookingService.getBookings(1, 100, undefined, 'landlord');

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

            // Calculate monthly revenue from approved and completed bookings
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const monthlyRevenue = response.data.bookings
                .filter((b: any) => {
                    const bookingDate = new Date(b.createdAt);
                    const isCurrentMonth = bookingDate.getMonth() === currentMonth &&
                        bookingDate.getFullYear() === currentYear;
                    const isPaid = b.status === 'APPROVED' || b.status === 'COMPLETED';
                    return isCurrentMonth && isPaid;
                })
                .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

            setStats({ pending, approved, revenue: monthlyRevenue });
        } catch (error: any) {
            console.error('Error loading today data:', error);
            // Set empty state instead of crashing
            setTodayBookings([]);
            setStats({ pending: 0, approved: 0, revenue: 0 });
            // Don't show error alert, just log it
        } finally {
            setLoading(false);
        }
    };

    const loadRecentReviews = async () => {
        try {
            // Get landlord's properties
            const propertiesResponse = await propertyService.getMyProperties(1, 10);
            const properties = propertiesResponse.data.properties;

            // Get recent reviews for each property
            const allReviews: any[] = [];
            for (const property of properties.slice(0, 3)) {
                try {
                    const reviewsResponse = await reviewService.getPropertyReviews(property.id, 1, 2);
                    const reviewsWithProperty = reviewsResponse.data.reviews.map((review: any) => ({
                        ...review,
                        propertyTitle: property.title,
                    }));
                    allReviews.push(...reviewsWithProperty);
                } catch (error) {
                    // Skip if no reviews for this property
                    console.log('No reviews for property:', property.id);
                }
            }

            // Sort by date and take latest 5
            const sortedReviews = allReviews.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentReviews(sortedReviews.slice(0, 5));
        } catch (error) {
            console.error('Error loading recent reviews:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadTodayData(), loadRecentReviews()]);
        setRefreshing(false);
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <ScrollView
            className={`flex-1 ${bgColor}`}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    progressViewOffset={100}
                />
            }
        >
            <View className="px-6 pt-16 pb-6">
                {/* Header */}
                <Text
                    className={`text-3xl mb-2 ${textColor}`}
                    style={{ fontFamily: 'VisbyRound-Bold' }}
                >
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
                    <View className={`flex-1 ${cardBg} p-4 rounded-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                            Pending
                        </Text>
                        <Text
                            className={`text-2xl ${textColor}`}
                            style={{ fontFamily: 'VisbyRound-Bold' }}
                        >
                            {stats.pending}
                        </Text>
                    </View>
                    <View className={`flex-1 ${cardBg} p-4 rounded-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                            Approved
                        </Text>
                        <Text
                            className={`text-2xl ${textColor}`}
                            style={{ fontFamily: 'VisbyRound-Bold' }}
                        >
                            {stats.approved}
                        </Text>
                    </View>
                </View>

                {/* Monthly Revenue Card */}
                <View className={`${cardBg} p-4 rounded-2xl mb-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="cash-outline" size={20} color="#10A0F7" />
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-2">
                            Pendapatan Bulan Ini
                        </Text>
                    </View>
                    <Text
                        className={`text-3xl ${textColor}`}
                        style={{ fontFamily: 'VisbyRound-Bold' }}
                    >
                        RM {stats.revenue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">
                        Dari booking yang disetujui
                    </Text>
                </View>

                {/* Today's Bookings */}
                <Text
                    className={`text-xl mb-4 ${textColor}`}
                    style={{ fontFamily: 'VisbyRound-Bold' }}
                >
                    Booking Hari Ini
                </Text>

                {todayBookings.length === 0 ? (
                    <View className={`${cardBg} p-8 rounded-2xl items-center border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Ionicons
                            name="calendar-outline"
                            size={48}
                            color="#10A0F7"
                        />
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-4 text-center">
                            Tidak ada booking baru hari ini
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {todayBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                                showDate={false}
                            />
                        ))}
                    </View>
                )}

                {/* Recent Reviews */}
                {recentReviews.length > 0 && (
                    <View className="mt-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className={`text-xl font-bold ${textColor}`}>
                                Recent Reviews
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ManageProperties')}>
                                <Text className="text-primary-light dark:text-primary-dark font-semibold">
                                    View All
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {recentReviews.map((review) => (
                            <View key={review.id} className="mb-3">
                                <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                                    {review.propertyTitle}
                                </Text>
                                <ReviewCard
                                    rating={review.rating}
                                    comment={review.comment}
                                    userName={`${review.user.firstName} ${review.user.lastName}`}
                                    date={review.createdAt}
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* Bottom Padding */}
                <TabBarBottomSpacer />
            </View>
        </ScrollView>
    );
}
