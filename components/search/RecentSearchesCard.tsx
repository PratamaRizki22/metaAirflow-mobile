import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../../hooks';

interface RecentSearchItem {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
}

const SEARCH_HISTORY_KEY = 'search_history';

export const RecentSearchesCard = ({ onPress, onSeeAll, style }: { onPress: (item: RecentSearchItem) => void, onSeeAll?: () => void, style?: ViewStyle }) => {
    const { bgColor, textColor, secondaryTextColor, isDark } = useThemeColors();
    const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

    // Card background should be white/themed
    const cardBg = isDark ? 'bg-surface-dark' : 'bg-white';

    const loadHistory = async () => {
        try {
            const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
            if (history) {
                const parsed = JSON.parse(history);
                // Limit to top 2 for the card
                setRecentSearches(parsed.slice(0, 2));
            }
        } catch (error) {
            console.log('Failed to load history in card', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    if (recentSearches.length === 0) {
        return null;
    }

    return (
        <View
            className={`rounded-2xl p-4 ${cardBg} mx-6 mb-6`}
            style={[{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
            }, style]}
        >
            <View className="flex-row justify-between items-center mb-4">
                <Text className={`text-base font-bold ${textColor}`}>Recent Searches</Text>
                <TouchableOpacity onPress={onSeeAll}>
                    <Text className="text-[#10A0F7] font-semibold text-sm">See All</Text>
                </TouchableOpacity>
            </View>

            {recentSearches.map((item, index) => (
                <TouchableOpacity
                    key={item.id}
                    onPress={() => onPress(item)}
                    className={`flex-row items-center py-3 ${index !== recentSearches.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                >
                    <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Ionicons name={item.icon || 'time-outline'} size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    </View>
                    <View className="flex-1">
                        <Text className={`font-semibold text-sm ${textColor}`}>{item.title}</Text>
                        <Text className={`text-xs ${secondaryTextColor}`} numberOfLines={1}>{item.subtitle || 'Recent search'}</Text>
                    </View>
                    <Ionicons name="navigate-outline" size={16} color="#10A0F7" />
                </TouchableOpacity>
            ))}
        </View>
    );
};
