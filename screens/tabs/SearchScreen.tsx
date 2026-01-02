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
    Platform,
} from 'react-native';
import * as Location from 'expo-location';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { PropertyCard, Property } from '../../components/property';
import {
    AdvancedSearchModal,
    PriceFilterSheet,
    BedroomsFilterSheet,
    BathroomsFilterSheet,
    PropertyTypeFilterSheet,
    SortDropdown,
    FilterBar,
    RecentSearchesCard,
} from '../../components/search';
import { DEFAULT_IMAGES } from '../../constants/images';
import { PropertyCardSkeleton } from '../../components/common/Skeleton';
import { IconButton, ChipButton, TabBarBottomSpacer } from '../../components/common';
import { HomeBackground } from '../../components/common/HomeBackground';
import { useDebounce, useThemeColors } from '../../hooks';
import { propertyService, propertyTypeService } from '../../services';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'house', label: 'House', icon: 'home-outline' },
    { id: 'apartment', label: 'Apartment', icon: 'business-outline' },
    { id: 'villa', label: 'Villa', icon: 'bed-outline' },
    { id: 'land', label: 'Land', icon: 'map-outline' },
];

export function SearchScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { unreadCount } = useNotifications();
    const { isFavorited, toggleFavorite } = useFavorites();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocationName, setUserLocationName] = useState('Area Around You'); // Default dynamic text
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

    const loadPropertyTypes = async () => {
        try {
            const response = await propertyTypeService.getPropertyTypes();
            setPropertyTypes(response);
        } catch (error) {
            // Silent fail - property types are optional for browsing
            setPropertyTypes([]);
        }
    };

    // Component lifecycle logging for memory management verification
    useEffect(() => {
        console.log('🟢 [TENANT MODE] SearchScreen MOUNTED - Memory allocated');

        return () => {
            console.log('🔴 [TENANT MODE] SearchScreen UNMOUNTED - Memory released');
            console.log('   → Properties data cleared from memory');
            console.log('   → Search state cleared from memory');
        };
    }, []);

    // Load property types on mount
    const getUserLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUserLocationName('Malaysia'); // Fallback
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address && address.length > 0) {
                // Prioritize City, then Region, then Country
                const city = address[0].city || address[0].region || address[0].country;
                if (city) {
                    setUserLocationName(city);
                }
            }
        } catch (error) {
            console.log('Error fetching location:', error);
            // Keep default "Area Around You"
        }
    };

    // Load property types and location on mount
    useEffect(() => {
        loadPropertyTypes();
        getUserLocation();
    }, []);

    const loadProperties = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
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
    }, [searchQuery, searchFilters]);

    // Load properties when filters change (NOT search query)
    useEffect(() => {
        setPage(1);
        setProperties([]);
        setHasMore(true);
        loadProperties(1, true);
    }, [searchFilters]); // ✅ Removed loadProperties from dependencies

    // Memoized callbacks
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        await loadProperties(1, true);
        setRefreshing(false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadProperties(nextPage, false);
        }
    }, [loadingMore, hasMore, loading, page]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        // Reload properties without search query
        setPage(1);
        loadProperties(1, true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = useCallback(() => {
        setPage(1);
        loadProperties(1, true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePropertyPress = useCallback((propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    }, [navigation]);

    const handleFavoriteToggle = useCallback(async (propertyId: string) => {
        try {
            await toggleFavorite(propertyId);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update favorite');
        }
    }, [toggleFavorite]);

    const clearAllFilters = useCallback(() => {
        setSearchFilters({});
        setSearchQuery('');
        setSelectedCategory('all');
        setPage(1);
        loadProperties(1, true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                    isFavorited: isFavorited(item.id),
                }}
                onPress={() => handlePropertyPress(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
            />
        </Animated.View>
    ), [handlePropertyPress, handleFavoriteToggle, isFavorited]);

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
                {/* Header with Custom Background */}
                <View className="relative">
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: -1 }}>
                        <HomeBackground />
                    </View>
                    <View className="px-6 pt-16 pb-10">
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <View className="flex-row items-center justify-between mb-6">
                                <View className="flex-1">
                                    <View className="bg-white/20 px-3 py-1 rounded-lg self-start mb-2">
                                        <Text className="text-white text-xs font-bold">ENG v</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    className={`w-10 h-10 rounded-full items-center justify-center bg-white/20`}
                                >
                                    <Ionicons
                                        name="notifications-outline"
                                        size={20}
                                        color="#FFF"
                                    />
                                    {unreadCount > 0 && (
                                        <View className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                                            <Text className="text-white text-[10px] font-bold">
                                                {unreadCount}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Search Button (Navigates to SearchInput) */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('SearchInput')}
                                activeOpacity={0.9}
                                className={`flex-row items-center rounded-2xl px-5 py-4 ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <Ionicons name="search-outline" size={24} color="#9CA3AF" />
                                <Text className={`ml-3 text-lg text-gray-400 flex-1`}>
                                    Search location...
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>

                {/* Recent Searches & Content */}
                <View style={{ marginTop: -20 }}>
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <RecentSearchesCard
                            onPress={(item) => navigation.navigate('MapSearchInfo', { searchQuery: item.title })}
                            onSeeAll={() => navigation.navigate('SearchInput')}
                        />
                    </Animated.View>


                </View>

                {/* Popular / Featured Section Title */}
                {selectedCategory === 'all' && (
                    <TouchableOpacity
                        className="flex-row items-center px-6 mb-4 mt-6"
                        onPress={() => navigation.navigate('MapSearchInfo', { searchQuery: userLocationName })}
                    >
                        <Text className={`text-xl font-bold ${textColor} mr-1`}>
                            Popular in {userLocationName}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFF' : '#111827'} />
                    </TouchableOpacity>
                )}

                {/* Featured Properties List */}
                {featuredProperties.length > 0 && selectedCategory === 'all' && (
                    <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="px-6"
                            contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
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
                                        isFavorited: isFavorited(property.id),
                                    }}
                                    variant="compact"
                                    onPress={() => handlePropertyPress(property.id)}
                                    onFavoriteToggle={handleFavoriteToggle}
                                />
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* All Properties */}
                <Animated.View entering={FadeInDown.delay(400).springify()} className="px-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            {selectedCategory === 'all' ? '' : `${CATEGORIES.find(c => c.id === selectedCategory)?.label} Properties`}
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
                                    <ActivityIndicator size="small" color="#00D9A3" />
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
                                                colors={loading ? ['#9CA3AF', '#6B7280'] : ['#10A0F7', '#01E8AD']}
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
                <TabBarBottomSpacer />
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
