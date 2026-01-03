import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

export default function TermsOfServiceScreen() {
    const { bgColor, cardBg, textColor, secondaryTextColor, isDark, borderColor } = useThemeColors();

    const Section = ({ title, content }: any) => (
        <View className={`${cardBg} p-5 rounded-2xl mb-4 border ${borderColor}`}>
            <Text
                className={`text-lg mb-2 ${textColor}`}
                style={{ fontFamily: 'VisbyRound-Bold' }}
            >
                {title}
            </Text>
            <Text className={`text-base leading-6 ${secondaryTextColor}`}>
                {content}
            </Text>
        </View>
    );

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center py-6 mb-4">
                    <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-primary/20' : 'bg-primary/10'} items-center justify-center mb-4`}>
                        <Ionicons name="document-text-outline" size={40} color="#00D9A3" />
                    </View>
                    <Text
                        className={`text-2xl text-center ${textColor}`}
                        style={{ fontFamily: 'VisbyRound-Bold' }}
                    >
                        Terms of Service
                    </Text>
                    <Text className={`text-center mt-1 ${secondaryTextColor}`}>
                        Last updated: January 2026
                    </Text>
                </View>

                <Section
                    title="1. Acceptance of Terms"
                    content="By accessing and using Rentverse, you accept and agree to be bound by the terms and provision of this agreement."
                />

                <Section
                    title="2. Use of Platform"
                    content="Rentverse provides a platform for landlords to list properties and tenants to book them. We are not a party to any rental agreement between users."
                />

                <Section
                    title="3. User Accounts"
                    content="You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account."
                />

                <Section
                    title="4. Bookings and Payments"
                    content="All bookings are subject to availability and acceptance by the host. Payments are processed securely through our payment provider."
                />

                <Section
                    title="5. Cancellation Policy"
                    content="Cancellation policies are set by hosts. Please review the specific policy for each property before booking."
                />
            </ScrollView>
        </View>
    );
}
