import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export function ProfileScreen() {
    const { isDark } = useTheme();

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView className="flex-1 px-6 pt-16">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Profile
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                    Manage your account
                </Text>

                {/* Placeholder content */}
                <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 mb-4">
                    <Text className={`text-lg font-semibold ${textColor}`}>
                        Account Settings
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
                        Coming soon...
                    </Text>
                </View>

                <View className="bg-card-light dark:bg-card-dark rounded-2xl p-6 mb-4">
                    <Text className={`text-lg font-semibold ${textColor}`}>
                        My Listings
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
                        Coming soon...
                    </Text>
                </View>

                {/* Bottom padding for tab bar */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
