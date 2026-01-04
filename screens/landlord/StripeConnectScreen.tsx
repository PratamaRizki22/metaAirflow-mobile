import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks';
import { stripeService } from '../../services/stripeService';
import { useToast } from '../../hooks/useToast';
import { LoadingState, Toast } from '../../components/common';

export default function StripeConnectScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { bgColor, cardBg, textColor, secondaryTextColor, borderColor, isDark } = useThemeColors();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connectStatus, setConnectStatus] = useState<any>(null);
    const [payoutSummary, setPayoutSummary] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        loadData();

        // Listen for deep link when user returns from Stripe
        const handleDeepLink = (event: { url: string }) => {
            const url = event.url;

            if (url.includes('stripe-connect-callback')) {
                // User completed onboarding successfully
                showToast('Stripe account connected successfully!', 'success');
                setTimeout(() => loadData(), 1000);
            } else if (url.includes('stripe-connect-refresh')) {
                // User's session expired or cancelled
                showToast('Onboarding session expired. Please try again.', 'error');
            }
        };

        // Add event listener
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Check if app was opened via deep link
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Get Stripe Connect status
            const status = await stripeService.getConnectAccountStatus();
            setConnectStatus(status);

            // If connected, get payout summary
            if (status.connected) {
                const payout = await stripeService.getLandlordPayoutSummary();
                setPayoutSummary(payout);
            }
        } catch (error: any) {
            console.error('Error loading Stripe data:', error);
            showToast(error.message || 'Failed to load data', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleConnectStripe = async () => {
        try {
            setProcessing(true);
            showToast('Creating Stripe account...', 'info');

            const result = await stripeService.createConnectAccount();

            // Open Stripe onboarding URL in browser
            const canOpen = await Linking.canOpenURL(result.onboardingUrl);
            if (canOpen) {
                await Linking.openURL(result.onboardingUrl);
                // Toast will show when user returns via deep link
            } else {
                showToast('Cannot open Stripe onboarding', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to connect Stripe', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenDashboard = async () => {
        try {
            setProcessing(true);
            showToast('Opening Stripe dashboard...', 'info');

            const result = await stripeService.createDashboardLink();

            const canOpen = await Linking.canOpenURL(result.url);
            if (canOpen) {
                await Linking.openURL(result.url);
            } else {
                showToast('Cannot open dashboard', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to open dashboard', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return <LoadingState />;
    }

    const getStatusBadge = () => {
        if (!connectStatus?.connected) {
            return (
                <View className="bg-gray-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">Not Connected</Text>
                </View>
            );
        }
        if (connectStatus.onboardingComplete) {
            return (
                <View className="bg-green-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">Active</Text>
                </View>
            );
        }
        return (
            <View className="bg-yellow-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">Pending</Text>
            </View>
        );
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View className={`${cardBg} border-b ${borderColor} px-6`} style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#000'} />
                        </TouchableOpacity>
                        <Text className={`text-xl font-bold ${textColor}`}>Stripe Connect</Text>
                    </View>
                    {getStatusBadge()}
                </View>
                <Text className={`${secondaryTextColor} text-sm mt-2`}>
                    Connect your Stripe account to receive payments
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom, 24) + 200 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Connection Status Card */}
                <View className={`${cardBg} rounded-2xl p-6 mb-4 border ${borderColor}`}>
                    <View className="flex-row items-center mb-4">
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${connectStatus?.onboardingComplete ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                            <Ionicons
                                name={connectStatus?.onboardingComplete ? "checkmark-circle" : "information-circle"}
                                size={28}
                                color={connectStatus?.onboardingComplete ? "#10B981" : "#6B7280"}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className={`text-lg font-bold ${textColor}`}>
                                {connectStatus?.onboardingComplete ? 'Connected' : 'Not Connected'}
                            </Text>
                            <Text className={`${secondaryTextColor} text-sm`}>
                                {connectStatus?.onboardingComplete
                                    ? 'Your account is ready to receive payments'
                                    : 'Connect Stripe to start receiving payments'
                                }
                            </Text>
                        </View>
                    </View>

                    {!connectStatus?.onboardingComplete && (
                        <TouchableOpacity
                            onPress={handleConnectStripe}
                            disabled={processing}
                            className="bg-primary py-4 rounded-xl items-center flex-row justify-center"
                        >
                            {processing ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="link" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text className="text-white font-semibold text-base">
                                        Connect Stripe Account
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {connectStatus?.onboardingComplete && (
                        <TouchableOpacity
                            onPress={handleOpenDashboard}
                            disabled={processing}
                            className="bg-gray-700 py-4 rounded-xl items-center flex-row justify-center"
                        >
                            {processing ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="apps" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text className="text-white font-semibold text-base">
                                        Open Stripe Dashboard
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Payout Summary */}
                {payoutSummary && (
                    <View className={`${cardBg} rounded-2xl p-6 mb-4 border ${borderColor}`}>
                        <Text className={`text-lg font-bold ${textColor} mb-4`}>Payout Summary</Text>

                        <View className="space-y-3">
                            <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <Text className={`${secondaryTextColor}`}>Total Earned</Text>
                                <Text className={`${textColor} font-semibold`}>
                                    RM {payoutSummary.totalEarned?.toFixed(2) || '0.00'}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <Text className={`${secondaryTextColor}`}>Total Refunded</Text>
                                <Text className="text-red-500 font-semibold">
                                    - RM {payoutSummary.totalRefunded?.toFixed(2) || '0.00'}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <Text className={`${secondaryTextColor}`}>Platform Fee (10%)</Text>
                                <Text className="text-orange-500 font-semibold">
                                    - RM {payoutSummary.platformFee?.toFixed(2) || '0.00'}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-3 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 mt-2">
                                <Text className={`${textColor} font-bold text-lg`}>Your Payout</Text>
                                <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                                    RM {payoutSummary.landlordPayout?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <View className="items-center flex-1">
                                <Text className={`${secondaryTextColor} text-xs`}>Completed</Text>
                                <Text className={`${textColor} font-bold text-lg`}>
                                    {payoutSummary.completedTransactions || 0}
                                </Text>
                            </View>
                            <View className="items-center flex-1 border-l border-r border-gray-100 dark:border-gray-800">
                                <Text className={`${secondaryTextColor} text-xs`}>Refunded</Text>
                                <Text className={`${textColor} font-bold text-lg`}>
                                    {payoutSummary.refundedTransactions || 0}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* How it Works */}
                <View className={`${cardBg} rounded-2xl p-6 border ${borderColor}`}>
                    <Text className={`text-lg font-bold ${textColor} mb-4`}>How It Works</Text>

                    <View className="space-y-4">
                        <View className="flex-row">
                            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                                <Text className="text-white font-bold">1</Text>
                            </View>
                            <View className="flex-1">
                                <Text className={`${textColor} font-semibold mb-1`}>Connect Account</Text>
                                <Text className={`${secondaryTextColor} text-sm`}>
                                    Create or connect your Stripe account
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row">
                            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                                <Text className="text-white font-bold">2</Text>
                            </View>
                            <View className="flex-1">
                                <Text className={`${textColor} font-semibold mb-1`}>Receive Payments</Text>
                                <Text className={`${secondaryTextColor} text-sm`}>
                                    Tenants pay directly to your account (90%)
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row">
                            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                                <Text className="text-white font-bold">3</Text>
                            </View>
                            <View className="flex-1">
                                <Text className={`${textColor} font-semibold mb-1`}>Auto Payout</Text>
                                <Text className={`${secondaryTextColor} text-sm`}>
                                    Funds transfer to your bank automatically
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                            <Text className="text-blue-600 dark:text-blue-400 text-xs flex-1">
                                Platform charges 10% service fee. You keep 90% of each payment.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Toast */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
                position="top"
            />
        </View>
    );
}
