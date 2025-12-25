import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export function LandlordInboxScreen() {
    const { isDark } = useTheme();

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="px-6 pt-16 pb-6">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Inbox
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                    Pesan dari tenant Anda
                </Text>

                {/* Empty State */}
                <View className={`${cardBg} p-12 rounded-2xl items-center mt-8`}>
                    <Ionicons
                        name="chatbubbles-outline"
                        size={64}
                        color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <Text className={`text-lg font-semibold mt-6 ${textColor}`}>
                        Belum Ada Pesan
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
                        Pesan dari tenant akan muncul di sini
                    </Text>
                </View>

                {/* Coming Soon Badge */}
                <View className="mt-6 bg-blue-500/10 p-4 rounded-xl">
                    <Text className="text-blue-600 dark:text-blue-400 text-center font-medium">
                        💬 Fitur messaging akan segera hadir
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
