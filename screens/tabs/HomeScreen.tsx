import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    FlatList,
    ListRenderItem,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { PropertyCard, Property } from '../../components/property';

// Mock data - nanti diganti dengan data dari API
const MOCK_PROPERTIES: Property[] = [
    {
        id: '1',
        title: 'Modern Minimalist House in BSD',
        price: 2500000000,
        location: 'BSD City, Tangerang',
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        type: 'house',
        isFeatured: true,
    },
    {
        id: '2',
        title: 'Luxury Apartment with City View',
        price: 1800000000,
        location: 'Sudirman, Jakarta Selatan',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        type: 'apartment',
        isFeatured: true,
    },
    {
        id: '3',
        title: 'Tropical Villa with Private Pool',
        price: 4500000000,
        location: 'Canggu, Bali',
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        type: 'villa',
    },
    {
        id: '4',
        title: 'Cozy Studio Apartment',
        price: 650000000,
        location: 'Kemang, Jakarta Selatan',
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        type: 'apartment',
    },
    {
        id: '5',
        title: 'Strategic Land for Investment',
        price: 3200000000,
        location: 'Sentul City, Bogor',
        bedrooms: 0,
        bathrooms: 0,
        area: 500,
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        type: 'land',
    },
];

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'house', label: 'House', icon: 'home-outline' },
    { id: 'apartment', label: 'Apartment', icon: 'business-outline' },
    { id: 'villa', label: 'Villa', icon: 'bed-outline' },
    { id: 'land', label: 'Land', icon: 'map-outline' },
];

export function HomeScreen() {
    const { isDark } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const secondaryTextColor = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';

    // Memoized callbacks
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const handlePropertyPress = useCallback((propertyId: string) => {
        // Handle property press - navigate to detail screen
    }, []);

    // Memoized filtered properties
    const filteredProperties = useMemo(() => {
        return MOCK_PROPERTIES.filter((property) => {
            const matchesCategory = selectedCategory === 'all' || property.type === selectedCategory;
            const matchesSearch =
                searchQuery === '' ||
                property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.location.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    // Memoized featured properties
    const featuredProperties = useMemo(() => {
        return MOCK_PROPERTIES.filter((p) => p.isFeatured);
    }, []);

    // Memoized renderItem for FlatList
    const renderPropertyItem: ListRenderItem<Property> = useCallback(({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(100 * index).springify()}
            style={{ marginBottom: 16 }}
        >
            <PropertyCard
                property={item}
                onPress={() => handlePropertyPress(item.id)}
            />
        </Animated.View>
    ), [handlePropertyPress]);

    const keyExtractor = useCallback((item: Property) => item.id, []);

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={isDark ? ['#0F172A', '#1E293B'] : ['#F0FDFA', '#FFFFFF']}
                    className="px-6 pt-16 pb-6"
                >
                    <Animated.View entering={FadeInDown.delay(100).springify()}>
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-1">
                                <Text className={`text-base ${secondaryTextColor}`}>
                                    Welcome back,
                                </Text>
                                <Text className={`text-2xl font-bold ${textColor}`}>
                                    Find Your Dream Home
                                </Text>
                            </View>
                            <TouchableOpacity
                                className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-surface-dark' : 'bg-white'
                                    }`}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            >
                                <Ionicons
                                    name="notifications-outline"
                                    size={24}
                                    color="#14B8A6"
                                />
                                <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-3 ${isDark ? 'bg-surface-dark' : 'bg-white'
                                }`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <Ionicons name="search-outline" size={22} color="#9CA3AF" />
                            <TextInput
                                placeholder="Search location, property..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                className={`flex-1 ml-3 text-base ${textColor}`}
                            />
                            {searchQuery !== '' && (
                                <TouchableOpacity onPress={handleClearSearch}>
                                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </LinearGradient>

                {/* Categories */}
                <Animated.View
                    entering={FadeInRight.delay(200).springify()}
                    className="px-6 mb-6"
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row gap-3"
                    >
                        {CATEGORIES.map((category, index) => {
                            const isSelected = selectedCategory === category.id;
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    onPress={() => setSelectedCategory(category.id)}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={
                                            isSelected
                                                ? ['#14B8A6', '#0D9488']
                                                : isDark
                                                    ? ['#1E293B', '#1E293B']
                                                    : ['#FFFFFF', '#FFFFFF']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="flex-row items-center px-5 py-3 rounded-full mr-3"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: isSelected ? 0.2 : 0.05,
                                            shadowRadius: 4,
                                            elevation: isSelected ? 4 : 2,
                                        }}
                                    >
                                        <Ionicons
                                            name={category.icon as any}
                                            size={20}
                                            color={
                                                isSelected
                                                    ? '#FFFFFF'
                                                    : isDark
                                                        ? '#9CA3AF'
                                                        : '#6B7280'
                                            }
                                        />
                                        <Text
                                            className={`ml-2 font-semibold ${isSelected
                                                ? 'text-white'
                                                : isDark
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                                }`}
                                        >
                                            {category.label}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {/* Featured Properties */}
                {featuredProperties.length > 0 && selectedCategory === 'all' && (
                    <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
                        <View className="flex-row items-center justify-between px-6 mb-4">
                            <Text className={`text-xl font-bold ${textColor}`}>
                                Featured Properties
                            </Text>
                            <TouchableOpacity>
                                <Text className="text-primary font-semibold">See All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="px-6"
                            contentContainerStyle={{ gap: 16 }}
                        >
                            {featuredProperties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    variant="compact"
                                    onPress={() => handlePropertyPress(property.id)}
                                />
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* All Properties */}
                <Animated.View entering={FadeInDown.delay(400).springify()} className="px-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            {selectedCategory === 'all' ? 'All Properties' : `${CATEGORIES.find(c => c.id === selectedCategory)?.label} Properties`}
                        </Text>
                        <Text className={secondaryTextColor}>
                            {filteredProperties.length} found
                        </Text>
                    </View>

                    <FlatList
                        data={filteredProperties}
                        renderItem={renderPropertyItem}
                        keyExtractor={keyExtractor}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-12">
                                <Ionicons name="home-outline" size={64} color="#9CA3AF" />
                                <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                                    No Properties Found
                                </Text>
                                <Text className={`text-sm mt-2 ${secondaryTextColor}`}>
                                    Try adjusting your search or filters
                                </Text>
                            </View>
                        }
                        initialNumToRender={5}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={true}
                    />
                </Animated.View>

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
