import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { stripeService, Payment } from '../../services';
import { LoadingState, EmptyState, ErrorState } from '../../components/common/States';
import { format } from 'date-fns';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icon: 'time-outline' as const,
    },
    completed: {
        label: 'Completed',
        color: '#10B981',
        bgColor: '#D1FAE5',
        icon: 'checkmark-circle' as const,
    },
    failed: {
        label: 'Failed',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        icon: 'close-circle' as const,
    },
    refunded: {
        label: 'Refunded',
        color: '#6366F1',
        bgColor: '#E0E7FF',
        icon: 'arrow-undo-circle' as const,
    },
};

export default function PaymentHistoryScreen({ navigation }: any) {
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<PaymentStatus | 'all'>('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchPayments = useCallback(async (page = 1, status?: PaymentStatus | 'all') => {
        try {
            setError(null);
            const params: any = { page, limit: 10 };
            if (status && status !== 'all') {
                params.status = status;
            }

            const response = await stripeService.getPaymentHistory(params);
            setPayments(response.payments);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to load payment history');
            console.error('Payment history error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchPayments(1, selectedFilter === 'all' ? undefined : selectedFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPayments(1, selectedFilter === 'all' ? undefined : selectedFilter);
    };

    const handleFilterChange = (filter: PaymentStatus | 'all') => {
        setSelectedFilter(filter);
    };

    const handlePaymentPress = (payment: Payment) => {
        navigation.navigate('PaymentDetail', { paymentId: payment.id });
    };

    const renderFilterChip = (filter: PaymentStatus | 'all', label: string) => {
        const isSelected = selectedFilter === filter;
        return (
            <TouchableOpacity
                key={filter}
                onPress={() => handleFilterChange(filter)}
                className={`px-4 py-2.5 rounded-full mr-2 ${isSelected ? 'bg-primary' : isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                style={{
                    minHeight: 36,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text
                    className={`font-medium text-sm ${isSelected ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderPaymentCard = (payment: Payment) => {
        const statusConfig = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG];
        const propertyImage = payment.booking?.property?.images?.[0];
        const propertyTitle = payment.booking?.property?.title || 'Property';
        const location = payment.booking?.property
            ? `${payment.booking.property.city}, ${payment.booking.property.state}`
            : '';

        return (
            <TouchableOpacity
                key={payment.id}
                onPress={() => handlePaymentPress(payment)}
                className={`${cardBg} rounded-2xl p-4 mb-3`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                {/* Property Info */}
                <View className="flex-row mb-3">
                    {propertyImage ? (
                        <Image
                            source={{ uri: propertyImage }}
                            className="w-20 h-20 rounded-xl"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-20 h-20 rounded-xl bg-gray-300 items-center justify-center">
                            <Ionicons name="home" size={32} color="#9CA3AF" />
                        </View>
                    )}
                    <View className="flex-1 ml-3 justify-center">
                        <Text className={`font-semibold text-base ${textColor}`} numberOfLines={1}>
                            {propertyTitle}
                        </Text>
                        {location && (
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                                {location}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Amount & Status */}
                <View className="flex-row items-center justify-between mb-2">
                    <View>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                            Amount
                        </Text>
                        <Text className={`font-bold text-lg ${textColor}`}>
                            RM {payment.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View
                        className="px-3 py-1.5 rounded-full flex-row items-center"
                        style={{ backgroundColor: statusConfig.bgColor }}
                    >
                        <Ionicons
                            name={statusConfig.icon}
                            size={16}
                            color={statusConfig.color}
                            style={{ marginRight: 4 }}
                        />
                        <Text className="font-semibold text-xs" style={{ color: statusConfig.color }}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Date */}
                <View className="flex-row items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
                        {payment.completedAt
                            ? format(new Date(payment.completedAt), 'MMM dd, yyyy • HH:mm')
                            : format(new Date(payment.createdAt), 'MMM dd, yyyy • HH:mm')}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return <LoadingState message="Loading payment history..." />;
    }

    if (error && !refreshing) {
        return (
            <View className={`flex-1 ${bgColor} items-center justify-center p-6`}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className={`text-lg font-semibold mt-4 ${textColor}`}>{error}</Text>
                <TouchableOpacity
                    onPress={() => {
                        setLoading(true);
                        fetchPayments(1, selectedFilter === 'all' ? undefined : selectedFilter);
                    }}
                    className="bg-primary rounded-xl px-6 py-3 mt-4"
                >
                    <Text className="text-white font-semibold">Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View className="px-6 pt-16 pb-4">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text className={`text-2xl font-bold ${textColor}`}>Payment History</Text>
                </View>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    View all your payment transactions
                </Text>
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-6 mb-4"
                contentContainerStyle={{
                    paddingRight: 24,
                    alignItems: 'center',
                }}
                style={{ maxHeight: 50 }}
            >
                {renderFilterChip('all', 'All')}
                {renderFilterChip('completed', 'Completed')}
                {renderFilterChip('pending', 'Pending')}
                {renderFilterChip('refunded', 'Refunded')}
                {renderFilterChip('failed', 'Failed')}
            </ScrollView>

            {/* Payment List */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={payments.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : undefined}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={isDark ? '#00D9A3' : '#00B87C'}
                        colors={[isDark ? '#00D9A3' : '#00B87C']}
                    />
                }
            >
                {payments.length === 0 ? (
                    <EmptyState
                        icon="receipt-outline"
                        title="No Payments Found"
                        message={
                            selectedFilter === 'all'
                                ? "You haven't made any payments yet"
                                : `No ${selectedFilter} payments found`
                        }
                    />
                ) : (
                    <>
                        {payments.map(renderPaymentCard)}

                        {/* Pagination Info */}
                        {pagination.totalPages > 1 && (
                            <View className="py-4 items-center">
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                    Page {pagination.page} of {pagination.totalPages} • {pagination.total}{' '}
                                    total payments
                                </Text>
                            </View>
                        )}

                        {/* Bottom Padding */}
                        <View style={{ height: 100 }} />
                    </>
                )}
            </ScrollView>
        </View>
    );
}
