import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Pressable,
    ScrollView,
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface FilterBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function FilterBottomSheet({
    visible,
    onClose,
    title,
    children,
}: FilterBottomSheetProps) {
    const { isDark } = useTheme();
    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50 justify-end"
                onPress={onClose}
            >
                <Animated.View
                    entering={SlideInDown.springify()}
                    exiting={SlideOutDown.springify()}
                    className={`${cardBg} rounded-t-3xl max-h-[70%]`}
                    onStartShouldSetResponder={() => true}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    {/* Handle Bar - Visual only */}
                    <View className="items-center pt-3 pb-2">
                        <View className={`w-12 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <Text className={`text-xl font-bold ${textColor}`}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 items-center justify-center"
                        >
                            <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        className="px-6 py-4"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

// Price Range Filter Component
interface PriceFilterProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (minPrice?: number, maxPrice?: number) => void;
    currentMin?: number;
    currentMax?: number;
}

export function PriceFilterSheet({
    visible,
    onClose,
    onSelect,
    currentMin,
    currentMax,
}: PriceFilterProps) {
    const { isDark } = useTheme();
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    const priceRanges = [
        { label: 'Under MYR 1,000', min: 0, max: 1000 },
        { label: 'MYR 1,000 - 2,000', min: 1000, max: 2000 },
        { label: 'MYR 2,000 - 3,000', min: 2000, max: 3000 },
        { label: 'MYR 3,000 - 5,000', min: 3000, max: 5000 },
        { label: 'MYR 5,000 - 10,000', min: 5000, max: 10000 },
        { label: 'Above MYR 10,000', min: 10000, max: 100000000 },
    ];

    const handleSelect = (min: number, max: number) => {
        onSelect(min, max);
        onClose();
    };

    const handleClear = () => {
        onSelect(undefined, undefined);
        onClose();
    };

    return (
        <FilterBottomSheet visible={visible} onClose={onClose} title="Price Range">
            <View className="gap-3">
                {priceRanges.map((range, index) => {
                    const isSelected = currentMin === range.min && currentMax === range.max;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleSelect(range.min, range.max)}
                            className={`p-4 rounded-xl flex-row items-center justify-between ${isSelected
                                ? 'bg-primary/10 border-2 border-primary'
                                : isDark
                                    ? 'bg-gray-800 border border-gray-700'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <Text className={`font-medium text-base ${isSelected ? 'text-primary' : textColor}`}>
                                {range.label}
                            </Text>
                            {isSelected && (
                                <Ionicons name="checkmark-circle" size={24} color="#14B8A6" />
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Clear Button */}
                {(currentMin !== undefined || currentMax !== undefined) && (
                    <TouchableOpacity
                        onPress={handleClear}
                        className="mt-2 p-4 rounded-xl border-2 border-red-500/20 bg-red-500/5"
                    >
                        <Text className="text-red-500 font-semibold text-center text-base">
                            Clear Price Filter
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </FilterBottomSheet>
    );
}

// Bedrooms Filter Component
interface BedroomsFilterProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (bedrooms?: number) => void;
    currentValue?: number;
}

export function BedroomsFilterSheet({
    visible,
    onClose,
    onSelect,
    currentValue,
}: BedroomsFilterProps) {
    const { isDark } = useTheme();
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    const bedroomOptions = [1, 2, 3, 4, 5, 6];

    const handleSelect = (num: number) => {
        onSelect(num);
        onClose();
    };

    const handleClear = () => {
        onSelect(undefined);
        onClose();
    };

    return (
        <FilterBottomSheet visible={visible} onClose={onClose} title="Bedrooms">
            <View className="gap-3">
                <View className="flex-row flex-wrap gap-3">
                    {bedroomOptions.map((num) => {
                        const isSelected = currentValue === num;
                        return (
                            <TouchableOpacity
                                key={num}
                                onPress={() => handleSelect(num)}
                                className={`flex-1 min-w-[30%] p-5 rounded-xl items-center ${isSelected
                                    ? 'bg-primary'
                                    : isDark
                                        ? 'bg-gray-800 border border-gray-700'
                                        : 'bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <Ionicons
                                    name="bed"
                                    size={28}
                                    color={isSelected ? '#FFF' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text
                                    className={`mt-2 font-semibold text-lg ${isSelected ? 'text-white' : textColor
                                        }`}
                                >
                                    {num}+
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Clear Button */}
                {currentValue !== undefined && (
                    <TouchableOpacity
                        onPress={handleClear}
                        className="mt-2 p-4 rounded-xl border-2 border-red-500/20 bg-red-500/5"
                    >
                        <Text className="text-red-500 font-semibold text-center text-base">
                            Clear Bedrooms Filter
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </FilterBottomSheet>
    );
}

// Bathrooms Filter Component
interface BathroomsFilterProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (bathrooms?: number) => void;
    currentValue?: number;
}

export function BathroomsFilterSheet({
    visible,
    onClose,
    onSelect,
    currentValue,
}: BathroomsFilterProps) {
    const { isDark } = useTheme();
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    const bathroomOptions = [1, 2, 3, 4, 5];

    const handleSelect = (num: number) => {
        onSelect(num);
        onClose();
    };

    const handleClear = () => {
        onSelect(undefined);
        onClose();
    };

    return (
        <FilterBottomSheet visible={visible} onClose={onClose} title="Bathrooms">
            <View className="gap-3">
                <View className="flex-row flex-wrap gap-3">
                    {bathroomOptions.map((num) => {
                        const isSelected = currentValue === num;
                        return (
                            <TouchableOpacity
                                key={num}
                                onPress={() => handleSelect(num)}
                                className={`flex-1 min-w-[30%] p-5 rounded-xl items-center ${isSelected
                                    ? 'bg-primary'
                                    : isDark
                                        ? 'bg-gray-800 border border-gray-700'
                                        : 'bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <Ionicons
                                    name="water"
                                    size={28}
                                    color={isSelected ? '#FFF' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text
                                    className={`mt-2 font-semibold text-lg ${isSelected ? 'text-white' : textColor
                                        }`}
                                >
                                    {num}+
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Clear Button */}
                {currentValue !== undefined && (
                    <TouchableOpacity
                        onPress={handleClear}
                        className="mt-2 p-4 rounded-xl border-2 border-red-500/20 bg-red-500/5"
                    >
                        <Text className="text-red-500 font-semibold text-center text-base">
                            Clear Bathrooms Filter
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </FilterBottomSheet>
    );
}

// Property Type Filter Component
interface PropertyTypeFilterProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (typeId?: string) => void;
    currentValue?: string;
    propertyTypes: any[];
}

export function PropertyTypeFilterSheet({
    visible,
    onClose,
    onSelect,
    currentValue,
    propertyTypes,
}: PropertyTypeFilterProps) {
    const { isDark } = useTheme();
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    const handleSelect = (typeId: string) => {
        onSelect(typeId);
        onClose();
    };

    const handleClear = () => {
        onSelect(undefined);
        onClose();
    };

    return (
        <FilterBottomSheet visible={visible} onClose={onClose} title="Property Type">
            <View className="gap-3">
                {propertyTypes.map((type) => {
                    const isSelected = currentValue === type.id;
                    return (
                        <TouchableOpacity
                            key={type.id}
                            onPress={() => handleSelect(type.id)}
                            className={`p-4 rounded-xl flex-row items-center justify-between ${isSelected
                                ? 'bg-primary/10 border-2 border-primary'
                                : isDark
                                    ? 'bg-gray-800 border border-gray-700'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="home"
                                    size={24}
                                    color={isSelected ? '#14B8A6' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text className={`ml-3 font-medium text-base ${isSelected ? 'text-primary' : textColor}`}>
                                    {type.name}
                                </Text>
                            </View>
                            {isSelected && (
                                <Ionicons name="checkmark-circle" size={24} color="#14B8A6" />
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Clear Button */}
                {currentValue !== undefined && (
                    <TouchableOpacity
                        onPress={handleClear}
                        className="mt-2 p-4 rounded-xl border-2 border-red-500/20 bg-red-500/5"
                    >
                        <Text className="text-red-500 font-semibold text-center text-base">
                            Clear Type Filter
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </FilterBottomSheet>
    );
}
