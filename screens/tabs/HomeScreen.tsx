import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    FlatList,
    ListRenderItem,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { PropertyCard, Property } from '../../components/property';
import {
    AdvancedSearchModal,
    PriceFilterSheet,
    BedroomsFilterSheet,
    BathroomsFilterSheet,
    PropertyTypeFilterSheet,
    SortDropdown,
} from '../../components/search';
import { DEFAULT_IMAGES } from '../../constants/images';
import { PropertyCardSkeleton } from '../../components/common/Skeleton';
import { IconButton, ChipButton } from '../../components/common';
import { useDebounce, useThemeColors } from '../../hooks';
import { propertyService, propertyTypeService } from '../../services';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'house', label: 'House', icon: 'home-outline' },
    { id: 'apartment', label: 'Apartment', icon: 'business-outline' },
    { id: 'villa', label: 'Villa', icon: 'bed-outline' },
    { id: 'land', label: 'Land', icon: 'map-outline' },
];

export function HomeScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { unreadCount } = useNotifications();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchFilters, setSearchFilters] = useState<any>({});
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);

    // Filter bottom sheet states
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [showBedroomsFilter, setShowBedroomsFilter] = useState(false);
    const [showBathroomsFilter, setShowBathroomsFilter] = useState(false);
    const [showPropertyTypeFilter, setShowPropertyTypeFilter] = useState(false);

    // Sort state
    const [sortBy, setSortBy] = useState('latest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce search query to reduce API calls
    const debouncedSearch = useDebounce(searchQuery, 500);

    const { bgColor, textColor, secondaryTextColor } = useThemeColors();

    // Load property types on mount
    useEffect(() => {
        loadPropertyTypes();
    }, []);

    const loadPropertyTypes = async () => {
        try {
            const response = await propertyTypeService.getPropertyTypes();
            setPropertyTypes(response);
        } catch (error) {
            // Silent fail - property types are optional for browsing
            setPropertyTypes([]);
        }
    };

    // Load properties when filters change (NOT search query)
    useEffect(() => {
        setPage(1);
        setProperties([]);
        setHasMore(true);
        loadProperties(1, true);
    }, [searchFilters]); // Removed debouncedSearch - search only on Enter/manual trigger

    const loadProperties = async (pageNum: number = page, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setError(null); // Clear previous errors
            } else {
                setLoadingMore(true);
            }

            const response = await propertyService.getMobileProperties(pageNum, 20, {
                search: searchQuery || undefined, // Use searchQuery directly for manual search
                ...searchFilters,
            });

            const newProperties = response.data.properties;

            if (reset) {
                setProperties(newProperties);
            } else {
                setProperties(prev => [...prev, ...newProperties]);
            }

            // Check if there are more properties
            setHasMore(newProperties.length === 20);
            setError(null); // Clear error on success
        } catch (error: any) {
            // Silent fail - only set error state for UI display
            // No console.error to prevent spam
            if (reset) {
                setError(error.message || 'Failed to load properties');
            }
            // Don't retry automatically - user must manually refresh
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Memoized callbacks
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        await loadProperties(1, true);
        setRefreshing(false);
    }, [debouncedSearch, searchFilters]);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadProperties(nextPage, false);
        }
    }, [loadingMore, hasMore, loading, page]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        // Reload properties without search query
        setPage(1);
        loadProperties(1, true);
    }, []);

    const handleSearch = useCallback(() => {
        setPage(1);
        loadProperties(1, true);
    }, [searchQuery]); // Depend on searchQuery instead of debouncedSearch

    const handlePropertyPress = useCallback((propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    }, [navigation]);

    const clearAllFilters = useCallback(() => {
        setSearchFilters({});
        setSearchQuery('');
        setSelectedCategory('all');
        setPage(1);
        loadProperties(1, true);
    }, []);

    // Memoized filtered properties
    const filteredProperties = useMemo(() => {
        return properties.filter((property) => {
            // Map backend propertyType to category
            const propertyTypeMap: any = {
                'APARTMENT': 'apartment',
                'HOUSE': 'house',
                'VILLA': 'villa',
                'LAND': 'land',
                'CONDOMINIUM': 'apartment',
                'STUDIO': 'apartment',
            };

            const propertyCategory = propertyTypeMap[property.propertyType?.name?.toUpperCase()] || 'house';
            const matchesCategory = selectedCategory === 'all' || propertyCategory === selectedCategory;

            return matchesCategory;
        });
    }, [selectedCategory, properties]);

    // Memoized featured properties (top 3 with highest ratings or newest)
    const featuredProperties = useMemo(() => {
        return properties
            .sort((a, b) => {
                // Sort by rating first, then by date
                if (a.averageRating && b.averageRating) {
                    return b.averageRating - a.averageRating;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 3);
    }, [properties]);

    // Memoized renderItem for FlatList
    const renderPropertyItem: ListRenderItem<any> = useCallback(({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(100 * index).springify()}
            style={{ marginBottom: 16 }}
        >
            <PropertyCard
                property={{
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    location: `${item.city}, ${item.state}`,
                    bedrooms: item.bedrooms,
                    bathrooms: item.bathrooms,
                    area: item.areaSqm,
                    image: item.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                    type: item.propertyType?.name?.toLowerCase() || 'house',
                }}
                onPress={() => handlePropertyPress(item.id)}
            />
        </Animated.View>
    ), [handlePropertyPress]);

    const keyExtractor = useCallback((item: any) => item.id, []);

    if (loading) {
        return (
            <View className={`flex-1 ${bgColor}`}>
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Header Skeleton */}
                    <View className="px-6 pt-16 pb-6">
                        <View className="mb-6">
                            <View className={`h-6 w-32 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                            <View className={`h-8 w-48 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </View>
                        <View className={`h-12 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </View>

                    {/* Property Cards Skeleton */}
                    <View className="px-6">
                        <PropertyCardSkeleton />
                        <PropertyCardSkeleton />
                        <PropertyCardSkeleton />
                    </View>
                </ScrollView>
            </View>
        );
    }

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
                                {unreadCount > 0 && (
                                    <View className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                                        <Text className="text-white text-xs font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar with Sort */}
                        <View className="flex-row gap-3 mb-3">
                            <View
                                className={`flex-1 flex-row items-center rounded-2xl px-5 py-4 ${isDark ? 'bg-surface-dark' : 'bg-white'
                                    }`}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <Ionicons name="search-outline" size={24} color="#9CA3AF" />
                                <TextInput
                                    placeholder="Search location, property..."
                                    placeholderTextColor="#9CA3AF"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleSearch}
                                    className={`flex-1 ml-3 text-lg ${textColor}`}
                                />
                                {searchQuery !== '' && (
                                    <TouchableOpacity onPress={handleClearSearch} className="mr-3">
                                        <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}

                                {/* Sort Dropdown */}
                                <View className="relative">
                                    <TouchableOpacity
                                        onPress={() => {
                                            console.log('Sort button clicked, current state:', showSortDropdown);
                                            setShowSortDropdown(!showSortDropdown);
                                        }}
                                        className={`flex-row items-center px-2 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'
                                            }`}
                                    >
                                        <Ionicons name="swap-vertical" size={20} color="#14B8A6" />
                                        <Ionicons
                                            name={showSortDropdown ? "chevron-up" : "chevron-down"}
                                            size={14}
                                            color="#9CA3AF"
                                            style={{ marginLeft: 2 }}
                                        />
                                    </TouchableOpacity>


                                    {/* Dropdown Modal */}

                                </View>
                            </View>
                        </View>

                        {/* Filter Chips - Google Style */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row gap-2"
                            contentContainerStyle={{ paddingRight: 24 }}
                        >
                            {/* Price Filter Chip */}
                            <TouchableOpacity
                                onPress={() => setShowPriceFilter(true)}
                                className={`flex-row items-center px-4 py-2.5 rounded-full border ${searchFilters.minPrice || searchFilters.maxPrice
                                    ? 'bg-primary/10 border-primary'
                                    : isDark
                                        ? 'bg-surface-dark border-gray-700'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                <Ionicons
                                    name="cash-outline"
                                    size={18}
                                    color={searchFilters.minPrice || searchFilters.maxPrice ? '#14B8A6' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text className={`ml-1.5 font-medium text-sm ${searchFilters.minPrice || searchFilters.maxPrice
                                    ? 'text-primary'
                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Price
                                </Text>
                                {(searchFilters.minPrice || searchFilters.maxPrice) && (
                                    <View className="ml-1 w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                            </TouchableOpacity>

                            {/* Bedrooms Filter Chip */}
                            <TouchableOpacity
                                onPress={() => setShowBedroomsFilter(true)}
                                className={`flex-row items-center px-4 py-2.5 rounded-full border ${searchFilters.bedrooms
                                    ? 'bg-primary/10 border-primary'
                                    : isDark
                                        ? 'bg-surface-dark border-gray-700'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                <Ionicons
                                    name="bed-outline"
                                    size={18}
                                    color={searchFilters.bedrooms ? '#14B8A6' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text className={`ml-1.5 font-medium text-sm ${searchFilters.bedrooms
                                    ? 'text-primary'
                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    {searchFilters.bedrooms ? `${searchFilters.bedrooms}+ Beds` : 'Bedrooms'}
                                </Text>
                            </TouchableOpacity>

                            {/* Bathrooms Filter Chip */}
                            <TouchableOpacity
                                onPress={() => setShowBathroomsFilter(true)}
                                className={`flex-row items-center px-4 py-2.5 rounded-full border ${searchFilters.bathrooms
                                    ? 'bg-primary/10 border-primary'
                                    : isDark
                                        ? 'bg-surface-dark border-gray-700'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                <Ionicons
                                    name="water-outline"
                                    size={18}
                                    color={searchFilters.bathrooms ? '#14B8A6' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text className={`ml-1.5 font-medium text-sm ${searchFilters.bathrooms
                                    ? 'text-primary'
                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    {searchFilters.bathrooms ? `${searchFilters.bathrooms}+ Baths` : 'Bathrooms'}
                                </Text>
                            </TouchableOpacity>

                            {/* Property Type Filter Chip */}
                            <TouchableOpacity
                                onPress={() => setShowPropertyTypeFilter(true)}
                                className={`flex-row items-center px-4 py-2.5 rounded-full border ${searchFilters.propertyTypeId
                                    ? 'bg-primary/10 border-primary'
                                    : isDark
                                        ? 'bg-surface-dark border-gray-700'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                <Ionicons
                                    name="home-outline"
                                    size={18}
                                    color={searchFilters.propertyTypeId ? '#14B8A6' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text className={`ml-1.5 font-medium text-sm ${searchFilters.propertyTypeId
                                    ? 'text-primary'
                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Type
                                </Text>
                                {searchFilters.propertyTypeId && (
                                    <View className="ml-1 w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                            </TouchableOpacity>

                            {/* More Filters Chip */}
                            <TouchableOpacity
                                onPress={() => setShowAdvancedSearch(true)}
                                className={`flex-row items-center px-4 py-2.5 rounded-full border ${Object.keys(searchFilters).length > 0
                                    ? 'bg-primary/10 border-primary'
                                    : isDark
                                        ? 'bg-surface-dark border-gray-700'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                <Ionicons
                                    name="options-outline"
                                    size={18}
                                    color={Object.keys(searchFilters).length > 0 ? '#14B8A6' : isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text className={`ml-1.5 font-medium text-sm ${Object.keys(searchFilters).length > 0
                                    ? 'text-primary'
                                    : isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    More Filters
                                </Text>
                                {Object.keys(searchFilters).length > 0 && (
                                    <View className="ml-1.5 px-1.5 py-0.5 bg-primary rounded-full">
                                        <Text className="text-white text-xs font-bold">
                                            {Object.keys(searchFilters).length}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Clear All Filters Button */}
                            {(Object.keys(searchFilters).length > 0 || searchQuery || selectedCategory !== 'all') && (
                                <TouchableOpacity
                                    onPress={clearAllFilters}
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
                                    property={{
                                        id: property.id,
                                        title: property.title,
                                        price: property.price,
                                        location: `${property.city}, ${property.state}`,
                                        bedrooms: property.bedrooms,
                                        bathrooms: property.bathrooms,
                                        area: property.areaSqm,
                                        image: property.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                                        type: property.propertyType?.name?.toLowerCase() || 'house',
                                        isFeatured: true,
                                    }}
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
                        // Pagination
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            loadingMore && !error ? (
                                <View className="py-4">
                                    <ActivityIndicator size="small" color="#14B8A6" />
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            !loading ? (
                                error ? (
                                    <View className="items-center justify-center py-12 px-6">
                                        <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
                                        <Text className={`text-lg font-semibold mt-4 text-center ${textColor}`}>
                                            Connection Error
                                        </Text>
                                        <Text className={`text-sm mt-2 text-center ${secondaryTextColor}`}>
                                            {error}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setPage(1);
                                                loadProperties(1, true);
                                            }}
                                            disabled={loading}
                                            className="mt-6"
                                        >
                                            <LinearGradient
                                                colors={loading ? ['#9CA3AF', '#6B7280'] : ['#14B8A6', '#0D9488']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                className="px-6 py-3 rounded-xl flex-row items-center justify-center"
                                            >
                                                {loading ? (
                                                    <>
                                                        <ActivityIndicator size="small" color="#FFF" />
                                                        <Text className="text-white font-semibold ml-2">Loading...</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ionicons name="refresh" size={20} color="#FFF" />
                                                        <Text className="text-white font-semibold ml-2">Try Again</Text>
                                                    </>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View className="items-center justify-center py-12">
                                        <Ionicons name="home-outline" size={64} color="#9CA3AF" />
                                        <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                                            No Properties Found
                                        </Text>
                                        <Text className={`text-sm mt-2 ${secondaryTextColor}`}>
                                            Try adjusting your search or filters
                                        </Text>
                                    </View>
                                )
                            ) : null
                        }
                        // Performance optimizations
                        initialNumToRender={5}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                        // getItemLayout for better scroll performance
                        getItemLayout={(data, index) => ({
                            length: 280, // Approximate card height
                            offset: 280 * index,
                            index,
                        })}
                    />
                </Animated.View>

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Advanced Search Modal */}
            <AdvancedSearchModal
                visible={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={(filters) => {
                    setSearchFilters(filters);
                    loadProperties();
                }}
                initialFilters={searchFilters}
            />

            {/* Price Filter Bottom Sheet */}
            <PriceFilterSheet
                visible={showPriceFilter}
                onClose={() => setShowPriceFilter(false)}
                onSelect={(minPrice, maxPrice) => {
                    setSearchFilters({ ...searchFilters, minPrice, maxPrice });
                }}
                currentMin={searchFilters.minPrice}
                currentMax={searchFilters.maxPrice}
            />

            {/* Bedrooms Filter Bottom Sheet */}
            <BedroomsFilterSheet
                visible={showBedroomsFilter}
                onClose={() => setShowBedroomsFilter(false)}
                onSelect={(bedrooms) => {
                    setSearchFilters({ ...searchFilters, bedrooms });
                }}
                currentValue={searchFilters.bedrooms}
            />

            {/* Bathrooms Filter Bottom Sheet */}
            <BathroomsFilterSheet
                visible={showBathroomsFilter}
                onClose={() => setShowBathroomsFilter(false)}
                onSelect={(bathrooms) => {
                    setSearchFilters({ ...searchFilters, bathrooms });
                }}
                currentValue={searchFilters.bathrooms}
            />

            {/* Property Type Filter Bottom Sheet */}
            <PropertyTypeFilterSheet
                visible={showPropertyTypeFilter}
                onClose={() => setShowPropertyTypeFilter(false)}
                onSelect={(propertyTypeId) => {
                    setSearchFilters({ ...searchFilters, propertyTypeId });
                }}
                currentValue={searchFilters.propertyTypeId}
                propertyTypes={propertyTypes}
            />

            {/* Sort Dropdown */}
            <SortDropdown
                visible={showSortDropdown}
                onClose={() => setShowSortDropdown(false)}
                onSelect={(sortBy) => setSortBy(sortBy)}
                currentValue={sortBy}
                isDark={isDark}
            />
        </View>
    );
}
