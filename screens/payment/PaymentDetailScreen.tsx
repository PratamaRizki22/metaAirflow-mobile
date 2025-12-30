import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { stripeService, Payment } from '../../services';
import { LoadingState } from '../../components/common/States';
import { CancelPaymentModal } from '../../components/payment/CancelPaymentModal';
import { formatDate } from '../../utils/dateUtils';

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

export default function PaymentDetailScreen({ route, navigation }: any) {
    const { paymentId } = route.params;
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPaymentDetails();
    }, [paymentId]);

    const loadPaymentDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await stripeService.getPaymentDetails(paymentId);
            setPayment(response);
        } catch (err: any) {
            setError(err.message || 'Failed to load payment details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!payment?.paymentIntentId) return;

        try {
            await stripeService.cancelPayment(payment.paymentIntentId);
            navigation.goBack();
        } catch (err: any) {
            setError(err.message || 'Failed to cancel payment');
            throw err;
        }
    };

    if (loading) {
        return <LoadingState message="Loading payment details..." />;
    }

    if (error || !payment) {
        return (
            <View className={`flex-1 ${bgColor} items-center justify-center p-6`}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                    {error || 'Payment not found'}
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="bg-primary rounded-xl px-6 py-3 mt-4"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusConfig = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG];
    const propertyImage = payment.booking?.property?.images?.[0];
    const propertyTitle = payment.booking?.property?.title || 'Property';
    const location = payment.booking?.property
        ? `${payment.booking.property.city}, ${payment.booking.property.state}`
        : '';

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View className="px-6 pt-16 pb-4">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text className={`text-2xl font-bold ${textColor}`}>Payment Details</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Status Badge */}
                <View className="items-center mb-6">
                    <View
                        className="px-6 py-2 rounded-full flex-row items-center"
                        style={{ backgroundColor: statusConfig.bgColor }}
                    >
                        <Ionicons
                            name={statusConfig.icon}
                            size={20}
                            color={statusConfig.color}
                            style={{ marginRight: 8 }}
                        />
                        <Text
                            className="font-bold text-base"
                            style={{ color: statusConfig.color }}
                        >
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Property Card */}
                <View
                    className={`${cardBg} rounded-2xl p-4 mb-4`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-3">
                        PROPERTY
                    </Text>
                    <View className="flex-row">
                        {propertyImage ? (
                            <Image
                                source={{ uri: propertyImage }}
                                className="w-24 h-24 rounded-xl"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-24 h-24 rounded-xl bg-gray-300 items-center justify-center">
                                <Ionicons name="home" size={32} color="#9CA3AF" />
                            </View>
                        )}
                        <View className="flex-1 ml-3 justify-center">
                            <Text className={`font-semibold text-base ${textColor}`} numberOfLines={2}>
                                {propertyTitle}
                            </Text>
                            {location && (
                                <View className="flex-row items-center mt-2">
                                    <Ionicons
                                        name="location-outline"
                                        size={14}
                                        color="#6B7280"
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                        {location}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Amount Card */}
                <View
                    className={`${cardBg} rounded-2xl p-4 mb-4`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-2">
                        AMOUNT
                    </Text>
                    <Text className={`text-4xl font-bold ${textColor}`}>
                        RM {payment.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                        {payment.currency.toUpperCase()}
                    </Text>
                </View>

                {/* Transaction Details */}
                <View
                    className={`${cardBg} rounded-2xl p-4 mb-4`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-4">
                        TRANSACTION DETAILS
                    </Text>

                    {/* Payment ID */}
                    <View className="mb-3">
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                            Payment ID
                        </Text>
                        <Text className={`font-mono text-sm ${textColor}`}>{payment.id}</Text>
                    </View>

                    {/* Booking ID */}
                    <View className="mb-3">
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                            Booking ID
                        </Text>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('BookingDetail', { bookingId: payment.bookingId })
                            }
                        >
                            <Text className="font-mono text-sm text-primary underline">
                                {payment.bookingId}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Payment Intent ID */}
                    {payment.paymentIntentId && (
                        <View className="mb-3">
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                                Stripe Payment Intent
                            </Text>
                            <Text className={`font-mono text-xs ${textColor}`}>
                                {payment.paymentIntentId}
                            </Text>
                        </View>
                    )}

                    {/* Created Date */}
                    <View className="mb-3">
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                            Created
                        </Text>
                        <Text className={`text-sm ${textColor}`}>
                            {formatDate(new Date(payment.createdAt), 'MMMM dd, yyyy HH:mm')}
                        </Text>
                    </View>

                    {/* Completed Date */}
                    {payment.completedAt && (
                        <View className="mb-3">
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                                Completed
                            </Text>
                            <Text className={`text-sm ${textColor}`}>
                                {formatDate(new Date(payment.completedAt), 'MMMM dd, yyyy HH:mm')}
                            </Text>
                        </View>
                    )}

                    {/* Refunded Date */}
                    {payment.refundedAt && (
                        <View>
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                                Refunded
                            </Text>
                            <Text className={`text-sm ${textColor}`}>
                                {formatDate(new Date(payment.refundedAt), 'MMMM dd, yyyy HH:mm')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Cancel Payment Button (for pending payments) */}
                {payment.status === 'pending' && (
                    <TouchableOpacity
                        onPress={() => setShowCancelModal(true)}
                        className="bg-yellow-500 rounded-xl py-4 mb-4 flex-row items-center justify-center"
                    >
                        <Ionicons name="close-circle" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-semibold text-base">Cancel Payment</Text>
                    </TouchableOpacity>
                )}

                {/* Receipt/Invoice Info */}
                <View
                    className={`rounded-xl p-3 mb-6 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}
                >
                    <View className="flex-row">
                        <Ionicons
                            name="information-circle"
                            size={16}
                            color="#3B82F6"
                            style={{ marginRight: 8, marginTop: 2 }}
                        />
                        <Text className="flex-1 text-xs text-blue-600 dark:text-blue-400">
                            Need a receipt? Contact support with your Payment ID for an official invoice.
                        </Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Cancel Payment Modal */}
            <CancelPaymentModal
                visible={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelPayment}
                paymentDetails={{
                    propertyTitle,
                    amount: payment.amount,
                }}
            />
        </View>
    );
}
