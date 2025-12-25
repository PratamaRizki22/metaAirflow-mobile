import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { propertyService, propertyTypeService } from '../../services';

interface SearchFilters {
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyTypeId?: string;
    bedrooms?: number;
    bathrooms?: number;
    minArea?: number;
    maxArea?: number;
    amenities?: string[];
    sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';
}

interface AdvancedSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSearch: (filters: SearchFilters) => void;
    initialFilters?: SearchFilters;
}

export function AdvancedSearchModal({
    visible,
    onClose,
    onSearch,
    initialFilters = {},
}: AdvancedSearchModalProps) {
    const { isDark } = useTheme();
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';

    useEffect(() => {
        if (visible) {
            loadPropertyTypes();
        }
    }, [visible]);

    const loadPropertyTypes = async () => {
        try {
            const response = await propertyTypeService.getPropertyTypes();
            setPropertyTypes(response);
        } catch (error) {
            console.error('Error loading property types:', error);
        }
    };

    const handleReset = () => {
        setFilters({});
    };

    const handleApply = () => {
        onSearch(filters);
        onClose();
    };

    const bedroomOptions = [1, 2, 3, 4, 5];
    const bathroomOptions = [1, 2, 3, 4];
    const sortOptions = [
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Newest First', value: 'date_desc' },
        { label: 'Oldest First', value: 'date_asc' },
    ];

    const commonAmenities = [
        { id: 'wifi', label: 'WiFi', icon: 'wifi' },
        { id: 'parking', label: 'Parking', icon: 'car' },
        { id: 'pool', label: 'Pool', icon: 'water' },
        { id: 'gym', label: 'Gym', icon: 'barbell' },
        { id: 'ac', label: 'AC', icon: 'snow' },
        { id: 'kitchen', label: 'Kitchen', icon: 'restaurant' },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className={`flex-1 ${bgColor}`}>
                {/* Header */}
                <View className={`${cardBg} px-6 pt-16 pb-4 flex-row items-center justify-between`}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
                    </TouchableOpacity>
                    <Text className={`text-xl font-bold ${textColor}`}>
                        Advanced Search
                    </Text>
                    <TouchableOpacity onPress={handleReset}>
                        <Text className="text-primary font-semibold">Reset</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 py-4">
                    {/* Location */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="location" size={20} color={isDark ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
                            <Text className={`text-lg font-bold ${textColor}`}>Location</Text>
                        </View>
                        <View className="gap-3">
                            <TextInput
                                className={`${inputBg} ${borderColor} border rounded-xl px-4 py-3 ${textColor}`}
                                placeholder="City"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                value={filters.city}
                                onChangeText={(text) => setFilters({ ...filters, city: text })}
                            />
                            <TextInput
                                className={`${inputBg} ${borderColor} border rounded-xl px-4 py-3 ${textColor}`}
                                placeholder="State"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                value={filters.state}
                                onChangeText={(text) => setFilters({ ...filters, state: text })}
                            />
                        </View>
                    </View>

                    {/* Price Range */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="cash" size={20} color={isDark ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
                            <Text className={`text-lg font-bold ${textColor}`}>Price Range (MYR/month)</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TextInput
                                className={`flex-1 ${inputBg} ${borderColor} border rounded-xl px-4 py-3 ${textColor}`}
                                placeholder="Min"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={filters.minPrice?.toString()}
                                onChangeText={(text) =>
                                    setFilters({ ...filters, minPrice: text ? parseInt(text) : undefined })
                                }
                            />
                            <TextInput
                                className={`flex-1 ${inputBg} ${borderColor} border rounded-xl px-4 py-3 ${textColor}`}
                                placeholder="Max"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={filters.maxPrice?.toString()}
                                onChangeText={(text) =>
                                    setFilters({ ...filters, maxPrice: text ? parseInt(text) : undefined })
                                }
                            />
                        </View>
                    </View>

                    {/* Property Type */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="home" size={20} color={isDark ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
                            <Text className={`text-lg font-bold ${textColor}`}>Property Type</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-2">
                                {propertyTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() =>
                                            setFilters({
                                                ...filters,
                                                propertyTypeId:
                                                    filters.propertyTypeId === type.id ? undefined : type.id,
                                            })
                                        }
                                        className={`px-4 py-2 rounded-full ${filters.propertyTypeId === type.id
                                            ? 'bg-primary'
                                            : isDark
                                                ? 'bg-gray-700'
                                                : 'bg-gray-200'
                                            }`}
                                    >
                                        <Text
                                            className={`font-medium ${filters.propertyTypeId === type.id
                                                ? 'text-white'
                                                : isDark
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                                }`}
                                        >
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Bedrooms */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="bed" size={20} color={isDark ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
                            <Text className={`text-lg font-bold ${textColor}`}>Bedrooms</Text>
                        </View>
                        <View className="flex-row gap-2">
                            {bedroomOptions.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    onPress={() =>
                                        setFilters({
                                            ...filters,
                                            bedrooms: filters.bedrooms === num ? undefined : num,
                                        })
                                    }
                                    className={`flex-1 py-3 rounded-xl ${filters.bedrooms === num
                                        ? 'bg-primary'
                                        : isDark
                                            ? 'bg-gray-700'
                                            : 'bg-gray-200'
                                        }`}
                                >
                                    <Text
                                        className={`text-center font-semibold ${filters.bedrooms === num
                                            ? 'text-white'
                                            : isDark
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                            }`}
                                    >
                                        {num}+
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Bathrooms */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="water" size={20} color={isDark ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
                            <Text className={`text-lg font-bold ${textColor}`}>Bathrooms</Text>
                        </View>
                        <View className="flex-row gap-2">
                            {bathroomOptions.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    onPress={() =>
                                        setFilters({
                                            ...filters,
                                            bathrooms: filters.bathrooms === num ? undefined : num,
                                        })
                                    }
                                    className={`flex-1 py-3 rounded-xl ${filters.bathrooms === num
                                        ? 'bg-primary'
                                        : isDark
                                            ? 'bg-gray-700'
                                            : 'bg-gray-200'
                                        }`}
                                >
                                    <Text
                                        className={`text-center font-semibold ${filters.bathrooms === num
                                            ? 'text-white'
                                            : isDark
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                            }`}
                                    >
                                        {num}+
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Area Size */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="resize" size={20} color={isDark ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
                            <Text className={`text-lg font-bold ${textColor}`}>Area Size (sqm)</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TextInput
                                className={`flex-1 ${inputBg} ${borderColor} border rounded-xl px-4 py-3 ${textColor}`}
                                placeholder="Min"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={filters.minArea?.toString()}
                                onChangeText={(text) =>
                                    setFilters({ ...filters, minArea: text ? parseInt(text) : undefined })
                                }
                            />
                            <TextInput
                                className={`flex-1 ${inputBg} ${borderColor} border rounded-xl px-4 py-3 ${textColor}`}
                                placeholder="Max"
                                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                                value={filters.maxArea?.toString()}
                                onChangeText={(text) =>
                                    setFilters({ ...filters, maxArea: text ? parseInt(text) : undefined })
                                }
                            />
                        </View>
                    </View>

                    {/* Sort By */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="swap-vertical" size={20} color={isDark ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
                            <Text className={`text-lg font-bold ${textColor}`}>Sort By</Text>
                        </View>
                        <View className="gap-2">
                            {sortOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => setFilters({ ...filters, sortBy: option.value as any })}
                                    className={`p-4 rounded-xl flex-row items-center justify-between ${filters.sortBy === option.value
                                        ? 'bg-primary'
                                        : isDark
                                            ? 'bg-gray-700'
                                            : 'bg-gray-200'
                                        }`}
                                >
                                    <Text
                                        className={`font-medium ${filters.sortBy === option.value
                                            ? 'text-white'
                                            : isDark
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                    {filters.sortBy === option.value && (
                                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Bottom Padding */}
                    <View className="h-24" />
                </ScrollView>

                {/* Apply Button */}
                <View className={`${cardBg} px-6 py-4`}>
                    <TouchableOpacity
                        onPress={handleApply}
                        className="bg-primary py-4 rounded-xl"
                    >
                        <Text className="text-white text-center font-bold text-base">
                            Apply Filters
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
