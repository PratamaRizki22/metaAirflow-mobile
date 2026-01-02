import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FilterBarProps {
    searchFilters: any;
    onShowPrice: () => void;
    onShowBedrooms: () => void;
    onShowBathrooms: () => void;
    onShowPropertyType: () => void;
    onShowAdvanced: () => void;
    onClearAll: () => void;
    hasActiveFilters: boolean;
}

export function FilterBar({
    searchFilters,
    onShowPrice,
    onShowBedrooms,
    onShowBathrooms,
    onShowPropertyType,
    onShowAdvanced,
    onClearAll,
    hasActiveFilters
}: FilterBarProps) {
    const { isDark, cardBg } = useThemeColors();

    const getFilterChipStyle = (isActive: boolean) => {
        if (isActive) {
            return 'bg-primary/10 border-primary';
        }
        return isDark ? 'bg-surface-dark border-gray-700' : 'bg-white border-gray-300';
    };

    const getIconColor = (isActive: boolean) => {
        if (isActive) {
            return '#00D9A3';
        }
        return isDark ? '#9CA3AF' : '#6B7280';
    };

    const getTextColor = (isActive: boolean) => {
        if (isActive) {
            return 'text-primary';
        }
        return isDark ? 'text-gray-300' : 'text-gray-700';
    };

    return (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2"
                contentContainerStyle={{ paddingRight: 24 }}
            >
                {/* Price Filter Chip */}
                <TouchableOpacity
                    onPress={onShowPrice}
                    className={`flex-row items-center px-4 py-2.5 rounded-full border ${getFilterChipStyle(!!(searchFilters.minPrice || searchFilters.maxPrice))}`}
                >
                    <Ionicons
                        name="cash-outline"
                        size={18}
                        color={getIconColor(!!(searchFilters.minPrice || searchFilters.maxPrice))}
                    />
                    <Text className={`ml-1.5 font-medium text-sm ${getTextColor(!!(searchFilters.minPrice || searchFilters.maxPrice))}`}>
                        Price
                    </Text>
                    {(searchFilters.minPrice || searchFilters.maxPrice) && (
                        <View className="ml-1 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                </TouchableOpacity>

                {/* Bedrooms Filter Chip */}
                <TouchableOpacity
                    onPress={onShowBedrooms}
                    className={`flex-row items-center px-4 py-2.5 rounded-full border ${getFilterChipStyle(!!searchFilters.bedrooms)}`}
                >
                    <Ionicons
                        name="bed-outline"
                        size={18}
                        color={getIconColor(!!searchFilters.bedrooms)}
                    />
                    <Text className={`ml-1.5 font-medium text-sm ${getTextColor(!!searchFilters.bedrooms)}`}>
                        {searchFilters.bedrooms ? `${searchFilters.bedrooms}+ Beds` : 'Bedrooms'}
                    </Text>
                </TouchableOpacity>

                {/* Bathrooms Filter Chip */}
                <TouchableOpacity
                    onPress={onShowBathrooms}
                    className={`flex-row items-center px-4 py-2.5 rounded-full border ${getFilterChipStyle(!!searchFilters.bathrooms)}`}
                >
                    <Ionicons
                        name="water-outline"
                        size={18}
                        color={getIconColor(!!searchFilters.bathrooms)}
                    />
                    <Text className={`ml-1.5 font-medium text-sm ${getTextColor(!!searchFilters.bathrooms)}`}>
                        {searchFilters.bathrooms ? `${searchFilters.bathrooms}+ Baths` : 'Bathrooms'}
                    </Text>
                </TouchableOpacity>

                {/* Property Type Filter Chip */}
                <TouchableOpacity
                    onPress={onShowPropertyType}
                    className={`flex-row items-center px-4 py-2.5 rounded-full border ${getFilterChipStyle(!!searchFilters.propertyTypeId)}`}
                >
                    <Ionicons
                        name="home-outline"
                        size={18}
                        color={getIconColor(!!searchFilters.propertyTypeId)}
                    />
                    <Text className={`ml-1.5 font-medium text-sm ${getTextColor(!!searchFilters.propertyTypeId)}`}>
                        Type
                    </Text>
                    {searchFilters.propertyTypeId && (
                        <View className="ml-1 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                </TouchableOpacity>

                {/* Clear All Filters Button */}
                {hasActiveFilters && (
                    <TouchableOpacity
                        onPress={onClearAll}
                        className={`flex-row items-center px-4 py-2.5 rounded-full border-2 ${isDark
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-red-50 border-red-200'
                            }`}
                    >
                        <Ionicons
                            name="close-circle"
                            size={18}
                            color="#EF4444"
                        />
                        <Text className="ml-1.5 font-semibold text-sm text-red-500">
                            Clear All
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </Animated.View>
    );
}
