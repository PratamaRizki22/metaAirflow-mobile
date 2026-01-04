import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useMode } from '../../contexts/ModeContext';
import { useThemeColors } from '../../hooks';
import { useCustomAlert } from '../../components/common';

export default function BecomeHostScreen({ navigation }: any) {
    const { activateHosting } = useAuth();
    const { switchMode } = useMode();
    const [loading, setLoading] = useState(false);
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const { showAlert, AlertComponent } = useCustomAlert();

    const [stripeConnected, setStripeConnected] = useState(false);
    const [checkingStripe, setCheckingStripe] = useState(false);

    // Check Stripe Status on Mount
    React.useEffect(() => {
        checkStripeStatus();
    }, []);

    const checkStripeStatus = async () => {
        setCheckingStripe(true);
        try {
            // Import stripeService dynamically to avoid circular dependency issues if any
            const { stripeService } = require('../../services/stripeService');
            const status = await stripeService.getConnectAccountStatus();
            setStripeConnected(status.connected && status.detailsSubmitted);
        } catch (error) {
            console.log('Stripe status check failed:', error);
        } finally {
            setCheckingStripe(false);
        }
    };

    const handleConnectStripe = async () => {
        setLoading(true);
        try {
            const { stripeService } = require('../../services/stripeService');
            const result = await stripeService.createConnectAccount();

            // Open Stripe onboarding URL
            const { Linking } = require('react-native');
            const canOpen = await Linking.canOpenURL(result.onboardingUrl);
            if (canOpen) {
                await Linking.openURL(result.onboardingUrl);
                // In a real app, we'd listen for deep link return. 
                // For now, we'll suggest user to refresh status after returning.
                showAlert('Stripe Connection', 'Please complete the setup in your browser. After returning, click "Refresh Status".', [
                    { text: 'OK', onPress: () => { } }
                ]);
            } else {
                showAlert('Error', 'Cannot open Stripe onboarding link');
            }
        } catch (error: any) {
            showAlert('Error', error.message || 'Failed to connect Stripe');
        } finally {
            setLoading(false);
        }
    };

    const handleActivateHosting = async () => {
        if (!stripeConnected) {
            showAlert('Required', 'Please connect your Stripe account first to receive payments.');
            return;
        }

        showAlert(
            'Activate Hosting',
            'You will be able to manage properties and receive bookings. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Activate',
                    style: 'default',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Activate hosting 
                            await activateHosting();

                            showAlert(
                                'Success!',
                                'Hosting features activated.',
                                [
                                    {
                                        text: 'Start',
                                        style: 'default',
                                        onPress: async () => {
                                            await switchMode();
                                            navigation.popToTop();
                                        }
                                    }
                                ]
                            );
                        } catch (error: any) {
                            showAlert('Error', error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const features = [
        {
            icon: 'home-outline',
            title: 'Manage your properties',
            description: 'Add, edit, and manage all your listings'
        },
        {
            icon: 'calendar-outline',
            title: 'Manage bookings',
            description: 'Accept booking requests and manage schedules'
        },
        {
            icon: 'stats-chart-outline',
            title: 'Track earnings',
            description: 'Monitor revenue and property performance'
        },
        {
            icon: 'chatbubbles-outline',
            title: 'Chat with tenants',
            description: 'Communicate directly with potential tenants'
        }
    ];

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="px-6 py-8">
                {/* Header */}
                <Text className={`text-3xl font-bold mb-3 ${textColor}`}>
                    Become a Host
                </Text>

                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-base mb-8">
                    Start renting out your property and earn extra income
                </Text>

                {/* Stripe Connection Section - Required */}
                <View className={`mb-8 p-4 rounded-xl border ${stripeConnected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <View className="flex-row items-center mb-2">
                        <Ionicons
                            name={stripeConnected ? "checkmark-circle" : "alert-circle"}
                            size={24}
                            color={stripeConnected ? "#10B981" : "#F59E0B"}
                        />
                        <Text className="text-lg font-bold ml-2 text-gray-900">
                            {stripeConnected ? "Payment Account Connected" : "Connect Payments (Required)"}
                        </Text>
                    </View>

                    <Text className="text-gray-600 mb-4 text-sm">
                        {stripeConnected
                            ? "Your Stripe account is ready to receive payouts. You can now activate hosting."
                            : "You must connect a Stripe account to receive payouts from tenants before you can start hosting."}
                    </Text>

                    {!stripeConnected && (
                        <TouchableOpacity
                            onPress={handleConnectStripe}
                            disabled={loading || checkingStripe}
                            className="bg-[#635BFF] py-3 rounded-lg items-center mb-2 flex-row justify-center"
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="card" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text className="text-white font-semibold">Connect with Stripe</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={checkStripeStatus}
                        disabled={checkingStripe}
                        className="py-2 items-center"
                    >
                        <Text className="text-blue-600 font-semibold">
                            {checkingStripe ? "Checking status..." : "Refresh Status"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Features List */}
                <Text className={`text-lg font-semibold mb-4 ${textColor}`}>
                    Features you'll get:
                </Text>

                <View className="gap-4 mb-8">
                    {features.map((feature, index) => (
                        <View
                            key={index}
                            className={`${cardBg} p-4 rounded-2xl flex-row items-start`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                        >
                            <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                                <Ionicons
                                    name={feature.icon as any}
                                    size={24}
                                    color="#00D9A3"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-base font-semibold mb-1 ${textColor}`}>
                                    {feature.title}
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                    {feature.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                {loading && !checkingStripe ? (
                    <View className="items-center py-8">
                        <ActivityIndicator size="large" color="#00D9A3" />
                        <Text className={`mt-4 ${textColor}`}>
                            Processing...
                        </Text>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={handleActivateHosting}
                            disabled={!stripeConnected}
                            className={`${stripeConnected ? 'bg-primary' : 'bg-gray-300'} rounded-xl py-4 mb-3`}
                            style={stripeConnected ? {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                            } : {}}
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                ACTIVATE HOSTING
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className={`${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-xl py-4`}
                        >
                            <Text className={`text-center font-semibold text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                MAYBE LATER
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Bottom Spacing */}
                <View className="h-8" />
            </View>

            {/* Custom Alert */}
            <AlertComponent />
        </ScrollView>
    );
}
