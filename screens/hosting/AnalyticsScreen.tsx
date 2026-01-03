import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../hooks';
import { bookingService, propertyService, reviewService } from '../../services';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }: any) {
    const { bgColor, textColor, cardBg, isDark, secondaryTextColor } = useThemeColors();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalProperties: 0,
        activeProperties: 0,
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
    });

    useFocusEffect(
        useCallback(() => {
            loadAnalytics();
        }, [])
    );

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // Load properties
            const propertiesResponse = await propertyService.getMyProperties(1, 100);
            const properties = propertiesResponse?.data?.properties || [];
            const activeProperties = properties.filter((p: any) => p.status === 'APPROVED' && p.isAvailable);

            // Load all bookings
            const bookingsResponse = await bookingService.getBookings(1, 100, undefined, 'owner');
            const bookings = bookingsResponse.data.bookings;

            // Calculate booking stats
            const pending = bookings.filter((b: any) => b.status === 'PENDING').length;
            const approved = bookings.filter((b: any) => b.status === 'APPROVED').length;
            const completed = bookings.filter((b: any) => b.status === 'COMPLETED').length;

            // Calculate revenue
            const totalRevenue = bookings
                .filter((b: any) => b.status === 'APPROVED' || b.status === 'COMPLETED')
                .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

            // Calculate monthly revenue
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = bookings
                .filter((b: any) => {
                    const bookingDate = new Date(b.createdAt);
                    const isCurrentMonth = bookingDate.getMonth() === currentMonth &&
                        bookingDate.getFullYear() === currentYear;
                    const isPaid = b.status === 'APPROVED' || b.status === 'COMPLETED';
                    return isCurrentMonth && isPaid;
                })
                .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

            // Calculate average rating
            let totalRating = 0;
            let totalReviews = 0;
            for (const property of properties) {
                try {
                    const reviewsResponse = await reviewService.getPropertyRating(property.id);
                    if (reviewsResponse.data && reviewsResponse.data.totalReviews > 0) {
                        totalRating += reviewsResponse.data.averageRating * reviewsResponse.data.totalReviews;
                        totalReviews += reviewsResponse.data.totalReviews;
                    }
                } catch (error) {
                    // Skip if no reviews
                }
            }
            const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

            setStats({
                totalProperties: properties.length,
                activeProperties: activeProperties.length,
                totalBookings: bookings.length,
                pendingBookings: pending,
                approvedBookings: approved,
                completedBookings: completed,
                totalRevenue,
                monthlyRevenue,
                averageRating,
                totalReviews,
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
            // Set empty stats on error
            setStats({
                totalProperties: 0,
                activeProperties: 0,
                totalBookings: 0,
                pendingBookings: 0,
                approvedBookings: 0,
                completedBookings: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                averageRating: 0,
                totalReviews: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAnalytics();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View className={`flex-1 ${bgColor} justify-center items-center`}>
                <ActivityIndicator size="large" color="#00D9A3" />
                <Text className={`mt-4 ${secondaryTextColor}`}>Loading analytics...</Text>
            </View>
        );
    }

    const StatCard = ({ icon, label, value, color = '#00D9A3', subtitle }: any) => (
        <View className={`${cardBg} p-4 rounded-2xl mb-3`} style={{ width: (width - 60) / 2 }}>
            <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: color + '20' }}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
            </View>
            <Text className={`text-2xl font-bold ${textColor} mb-1`}>{value}</Text>
            <Text className={`text-sm ${secondaryTextColor}`}>{label}</Text>
            {subtitle && (
                <Text className={`text-xs ${secondaryTextColor} mt-1`}>{subtitle}</Text>
            )}
        </View>
    );

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
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className={`text-3xl font-bold ${textColor}`}>
                            Analytics
                        </Text>
                        <Text className={`${secondaryTextColor} mt-1`}>
                            Your hosting performance
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center"
                    >
                        <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                    </TouchableOpacity>
                </View>

                {/* Revenue Section */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-3 ${textColor}`}>Revenue</Text>
                    <View className={`${cardBg} p-5 rounded-2xl mb-3`}>
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="trending-up" size={24} color="#10B981" />
                            <Text className={`ml-2 ${secondaryTextColor}`}>Total Revenue</Text>
                        </View>
                        <Text className={`text-3xl font-bold text-green-600 dark:text-green-400`}>
                            RM {stats.totalRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View className={`${cardBg} p-5 rounded-2xl`}>
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar" size={24} color="#00D9A3" />
                            <Text className={`ml-2 ${secondaryTextColor}`}>This Month</Text>
                        </View>
                        <Text className={`text-3xl font-bold text-primary`}>
                            RM {stats.monthlyRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {/* Properties Stats */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-3 ${textColor}`}>Properties</Text>
                    <View className="flex-row flex-wrap gap-3">
                        <StatCard
                            icon="home"
                            label="Total Properties"
                            value={stats.totalProperties}
                            color="#3B82F6"
                        />
                        <StatCard
                            icon="checkmark-circle"
                            label="Active Properties"
                            value={stats.activeProperties}
                            color="#10B981"
                        />
                    </View>
                </View>

                {/* Bookings Stats */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-3 ${textColor}`}>Bookings</Text>
                    <View className="flex-row flex-wrap gap-3">
                        <StatCard
                            icon="calendar-outline"
                            label="Total Bookings"
                            value={stats.totalBookings}
                            color="#8B5CF6"
                        />
                        <StatCard
                            icon="time-outline"
                            label="Pending"
                            value={stats.pendingBookings}
                            color="#F59E0B"
                        />
                        <StatCard
                            icon="checkmark-done"
                            label="Approved"
                            value={stats.approvedBookings}
                            color="#00D9A3"
                        />
                        <StatCard
                            icon="flag"
                            label="Completed"
                            value={stats.completedBookings}
                            color="#10B981"
                        />
                    </View>
                </View>

                {/* Reviews Stats */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-3 ${textColor}`}>Reviews</Text>
                    <View className="flex-row flex-wrap gap-3">
                        <StatCard
                            icon="star"
                            label="Average Rating"
                            value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                            color="#F59E0B"
                            subtitle={stats.totalReviews > 0 ? `${stats.totalReviews} reviews` : 'No reviews yet'}
                        />
                        <StatCard
                            icon="chatbubbles"
                            label="Total Reviews"
                            value={stats.totalReviews}
                            color="#6366F1"
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-3 ${textColor}`}>Quick Actions</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ManageProperties')}
                        className={`${cardBg} p-4 rounded-2xl flex-row items-center justify-between mb-3`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="list" size={24} color="#00D9A3" />
                            <Text className={`ml-3 text-base font-medium ${textColor}`}>
                                Manage Properties
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateProperty')}
                        className={`${cardBg} p-4 rounded-2xl flex-row items-center justify-between`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="add-circle" size={24} color="#00D9A3" />
                            <Text className={`ml-3 text-base font-medium ${textColor}`}>
                                Add New Property
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
