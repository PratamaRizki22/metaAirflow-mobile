import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

export default function GetHelpScreen() {
    const { bgColor, textColor, cardBg, secondaryTextColor, isDark, borderColor } = useThemeColors();

    const HeroSection = () => (
        <View className="items-center py-8 mb-6">
            <View className={`w-24 h-24 rounded-full ${isDark ? 'bg-primary/20' : 'bg-primary/10'} items-center justify-center mb-4`}>
                <Ionicons name="chatbubbles-outline" size={48} color="#00D9A3" />
            </View>
            <Text
                className={`text-2xl text-center ${textColor}`}
                style={{ fontFamily: 'VisbyRound-Bold' }}
            >
                How can we help?
            </Text>
            <Text className={`text-center mt-2 ${secondaryTextColor} px-8`}>
                Our team is here to support you with any questions or issues.
            </Text>
        </View>
    );

    const ContactItem = ({ icon, title, subtitle, onPress, color }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className={`${cardBg} p-5 rounded-2xl mb-4 flex-row items-center border ${borderColor}`}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: `${color}20` }}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View className="flex-1">
                <Text
                    className={`text-lg mb-1 ${textColor}`}
                    style={{ fontFamily: 'VisbyRound-Bold' }}
                >
                    {title}
                </Text>
                <Text className={`text-sm ${secondaryTextColor}`}>{subtitle}</Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-800 p-2 rounded-full">
                <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
            </View>
        </TouchableOpacity>
    );

    const FaqItem = ({ question, answer }: any) => (
        <View className={`${cardBg} p-5 rounded-2xl mb-4 border ${borderColor}`}>
            <View className="flex-row items-start mb-2">
                <Ionicons name="help-circle" size={20} color="#00D9A3" style={{ marginRight: 8, marginTop: 2 }} />
                <Text
                    className={`flex-1 text-base ${textColor}`}
                    style={{ fontFamily: 'VisbyRound-Bold' }}
                >
                    {question}
                </Text>
            </View>
            <Text className={`text-sm leading-5 ${secondaryTextColor} pl-8`}>
                {answer}
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
                <HeroSection />

                <Text
                    className={`text-lg mb-4 ${secondaryTextColor} font-semibold uppercase tracking-wider`}
                    style={{ fontSize: 12 }}
                >
                    Contact Options
                </Text>

                <ContactItem
                    icon="chatbubbles"
                    title="Live Chat"
                    subtitle="Typical reply time: 5 mins"
                    onPress={() => { }}
                    color="#00D9A3"
                />

                <ContactItem
                    icon="mail"
                    title="Email Support"
                    subtitle="support@rentverse.com"
                    onPress={() => Linking.openURL('mailto:support@rentverse.com')}
                    color="#3B82F6"
                />

                <ContactItem
                    icon="call"
                    title="Phone Support"
                    subtitle="+60 123-456-7890"
                    onPress={() => Linking.openURL('tel:+601234567890')}
                    color="#F59E0B"
                />

                <Text
                    className={`text-lg mt-8 mb-4 ${secondaryTextColor} font-semibold uppercase tracking-wider`}
                    style={{ fontSize: 12 }}
                >
                    Frequently Asked Questions
                </Text>

                <FaqItem
                    question="How do I book a property?"
                    answer="Browse our verified listings, select your preferred dates, and tap 'Book Now'. Follow the secure payment instructions to complete your reservation instantly."
                />

                <FaqItem
                    question="What is the cancellation policy?"
                    answer="Cancellation policies vary by host. You can find the specific policy for each property on its details page and in your booking confirmation."
                />

                <FaqItem
                    question="Is my payment secure?"
                    answer="Yes, all transactions are processed securely through Stripe. We do not store your full card details on our servers."
                />

            </ScrollView>
        </View>
    );
}
