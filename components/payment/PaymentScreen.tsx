import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    StyleSheet
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { stripeService } from '../../services/stripeService';
import { useThemeColors } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../common';

interface PaymentScreenProps {
    bookingId: string;
    amount: number;
    propertyTitle?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PaymentScreen({
    bookingId,
    amount,
    propertyTitle = 'Property',
    onSuccess,
    onCancel
}: PaymentScreenProps) {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { bgColor, textColor, cardBg } = useThemeColors();
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Initialize Payment Sheet when component mounts
    useEffect(() => {
        initializePaymentSheet();
    }, []);

    const initializePaymentSheet = async () => {
        try {
            setLoading(true);

            // 1. Fetch payment sheet parameters from backend
            const {
                paymentIntent,
                ephemeralKey,
                customer,
                publishableKey
            } = await stripeService.getPaymentSheetParams(bookingId);

            // 2. Initialize the Payment Sheet
            const { error } = await initPaymentSheet({
                merchantDisplayName: 'Rentverse',
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                // Allow delayed payment methods (e.g., SEPA Debit)
                allowsDelayedPaymentMethods: true,
                // Set default billing details if available
                defaultBillingDetails: {
                    name: 'Guest User',
                },
                // Appearance customization
                appearance: {
                    colors: {
                        primary: '#6366F1', // Indigo-500
                        background: '#FFFFFF',
                        componentBackground: '#F3F4F6',
                        componentBorder: '#E5E7EB',
                        componentDivider: '#E5E7EB',
                        primaryText: '#111827',
                        secondaryText: '#6B7280',
                        componentText: '#111827',
                        placeholderText: '#9CA3AF',
                    },
                    shapes: {
                        borderRadius: 12,
                        borderWidth: 1,
                    },
                },
                // Return URL for 3D Secure and redirects (iOS only)
                returnURL: 'rentverse://stripe-redirect',
            });

            if (error) {
                console.error('Payment Sheet initialization error:', error);
                Alert.alert(
                    'Initialization Error',
                    error.message,
                    [{ text: 'OK', onPress: onCancel }]
                );
                return;
            }

            // Payment Sheet is ready
            setReady(true);
        } catch (error: any) {
            console.error('Payment Sheet initialization error:', error);
            showToast(error.message || 'Failed to initialize payment', 'error');
            setTimeout(() => onCancel(), 2000);
        } finally {
            setLoading(false);
        }
    };

    const openPaymentSheet = async () => {
        if (!ready) {
            Alert.alert('Please wait', 'Payment is being prepared...');
            return;
        }

        try {
            // Present the Payment Sheet
            const { error } = await presentPaymentSheet();

            if (error) {
                // Handle different error codes
                switch (error.code) {
                    case 'Canceled':
                        // User canceled the payment
                        console.log('Payment canceled by user');
                        break;
                    case 'Failed':
                        showToast(error.message || 'Payment failed. Please try again.', 'error');
                        break;
                    default:
                        showToast(error.message || 'Payment error occurred', 'error');
                }
            } else {
                // Payment successful!
                showToast('Payment successful! 🎉 Your booking is confirmed', 'success');
                setTimeout(() => onSuccess(), 1500);
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error');
        }
    };

    return (
        <ScrollView
            className={`flex-1 ${bgColor}`}
            contentContainerStyle={styles.container}
        >
            {/* Header */}
            <View className="flex-row items-center mb-6 px-6 pt-6">
                <TouchableOpacity
                    onPress={onCancel}
                    className="mr-4"
                    disabled={loading}
                >
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text className={`text-2xl font-bold ${textColor}`}>
                    Complete Payment
                </Text>
            </View>

            {/* Property Info */}
            <View className={`${cardBg} rounded-2xl p-4 mx-6 mb-4`}>
                <View className="flex-row items-center mb-2">
                    <Ionicons name="home" size={20} color="#6366F1" />
                    <Text className={`ml-2 font-semibold ${textColor}`}>
                        Booking Details
                    </Text>
                </View>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    {propertyTitle}
                </Text>
            </View>

            {/* Amount Card */}
            <View className={`${cardBg} rounded-2xl p-6 mx-6 mb-4`}>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-2">
                    Total Amount
                </Text>
                <Text className={`text-4xl font-bold ${textColor}`}>
                    MYR {amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </Text>
            </View>

            {/* Payment Methods Info */}
            <View className={`${cardBg} rounded-2xl p-4 mx-6 mb-4`}>
                <View className="flex-row items-center mb-3">
                    <Ionicons name="card" size={20} color="#6366F1" />
                    <Text className={`ml-2 font-semibold ${textColor}`}>
                        Accepted Payment Methods
                    </Text>
                </View>
                <View className="flex-row items-center flex-wrap">
                    <View className="flex-row items-center mr-4 mb-2">
                        <Ionicons name="card-outline" size={16} color="#6B7280" />
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-1">
                            Credit Card
                        </Text>
                    </View>
                    <View className="flex-row items-center mr-4 mb-2">
                        <Ionicons name="card-outline" size={16} color="#6B7280" />
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-1">
                            Debit Card
                        </Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="wallet-outline" size={16} color="#6B7280" />
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-1">
                            Digital Wallet
                        </Text>
                    </View>
                </View>
            </View>

            {/* Security Info */}
            <View className={`${cardBg} rounded-2xl p-4 mx-6 mb-6`}>
                <View className="flex-row items-center mb-3">
                    <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                    <Text className={`ml-2 font-semibold ${textColor}`}>
                        Secure Payment
                    </Text>
                </View>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-5">
                    Your payment is processed securely through Stripe. We use industry-standard encryption and never store your card details.
                </Text>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Action Buttons */}
            <View className="px-6 pb-6">
                {/* Pay Button */}
                <TouchableOpacity
                    onPress={openPaymentSheet}
                    disabled={loading || !ready}
                    className={`bg-primary rounded-xl py-4 mb-3 ${(loading || !ready) ? 'opacity-50' : ''}`}
                    style={styles.shadow}
                >
                    {loading ? (
                        <View className="flex-row items-center justify-center">
                            <ActivityIndicator color="white" size="small" />
                            <Text className="text-white font-semibold text-base ml-2">
                                Preparing Payment...
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="lock-closed" size={20} color="white" />
                            <Text className="text-white font-bold text-base ml-2">
                                Pay MYR {amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                    onPress={onCancel}
                    disabled={loading}
                    className="py-3"
                >
                    <Text className="text-center text-text-secondary-light dark:text-text-secondary-dark font-medium">
                        Cancel Payment
                    </Text>
                </TouchableOpacity>

                {/* Powered by Stripe */}
                <View className="flex-row items-center justify-center mt-4">
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
                        Powered by
                    </Text>
                    <Text className="text-primary font-bold text-xs ml-1">
                        Stripe
                    </Text>
                </View>
            </View>

            {/* Toast Notification */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    shadow: {
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
