import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

export default function PrivacyPolicyScreen() {
    const { bgColor, cardBg, textColor, secondaryTextColor, isDark, borderColor } = useThemeColors();

    const Section = ({ title, content }: any) => (
        <View className={`${cardBg} p-5 rounded-2xl mb-4 border ${borderColor}`}>
            <View className="flex-row items-center mb-2">
                <Ionicons name="shield-checkmark-outline" size={20} color="#0EA5E9" style={{ marginRight: 8 }} />
                <Text
                    className={`text-lg flex-1 ${textColor}`}
                    style={{ fontFamily: 'VisbyRound-Bold' }}
                >
                    {title}
                </Text>
            </View>
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
                        <Ionicons name="lock-closed-outline" size={40} color="#00D9A3" />
                    </View>
                    <Text
                        className={`text-2xl text-center ${textColor}`}
                        style={{ fontFamily: 'VisbyRound-Bold' }}
                    >
                        Privacy Policy
                    </Text>
                    <Text className={`text-center mt-1 ${secondaryTextColor}`}>
                        Your data security is our priority
                    </Text>
                    <Text className={`text-center mt-1 text-xs ${secondaryTextColor}`}>
                        Last updated: January 2026
                    </Text>
                </View>

                <Section
                    title="1. Information We Collect"
                    content="We collect information you provide directly to us, such as when you create an account, make a booking, or contact support."
                />

                <Section
                    title="2. How We Use Your Information"
                    content="We use your information to provide, maintain, and improve our services, process transactions, and communicate with you."
                />

                <Section
                    title="3. Information Sharing"
                    content="We may share your information with hosts to facilitate your bookings. We do not sell your personal information to third parties."
                />

                <Section
                    title="4. Data Security"
                    content="We implement appropriate technical and organizational measures to protect your personal information against unauthorized access or disclosure."
                />
            </ScrollView>
        </View>
    );
}
