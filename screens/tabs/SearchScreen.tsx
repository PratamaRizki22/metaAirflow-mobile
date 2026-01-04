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
    ImageBackground,
} from 'react-native';
import * as Location from 'expo-location';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
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
import { CollectionModal } from '../../components/collection';
import { useDebounce, useThemeColors } from '../../hooks';
import { propertyService, propertyTypeService, locationService, collectionService, Location as LocationData } from '../../services';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'house', label: 'House', icon: 'home-outline' },
    { id: 'apartment', label: 'Apartment', icon: 'business-outline' },
    { id: 'villa', label: 'Villa', icon: 'bed-outline' },
    { id: 'land', label: 'Land', icon: 'map-outline' },
];

// Default images for locations if no specific image is available
const LOCATION_IMAGES: { [key: string]: string } = {
    'Kuala Lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=500',
    'Selangor': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500',
    'Penang': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500',
    'Johor': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
    'Johor Bahru': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
    'Putrajaya': 'https://images.unsplash.com/photo-1508062878650-88b52897f298?w=500',
    'Melaka': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500',
    'Malacca': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500',
    'default': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500',
};

// Dummy locations for initial display
const DUMMY_LOCATIONS = [
    { name: 'Kuala Lumpur' },
    { name: 'Selangor' },
    { name: 'Penang' },
    { name: 'Johor Bahru' },
    { name: 'Putrajaya' },
    { name: 'Melaka' },
];

export function SearchScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { unreadCount } = useNotifications();
    const { isFavorited, toggleFavorite } = useFavorites();
    const { isLoggedIn } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocationName, setUserLocationName] = useState('Area Around You'); // Default dynamic text
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchFilters, setSearchFilters] = useState<any>({});
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
    const [recentlyViewedProperties, setRecentlyViewedProperties] = useState<any[]>([]);
    const [popularProperties, setPopularProperties] = useState<any[]>([]); // Nearby properties based on distance
    const [topRatedProperties, setTopRatedProperties] = useState<any[]>([]); // Top rated from all locations

    // Filter bottom sheet states
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [showBedroomsFilter, setShowBedroomsFilter] = useState(false);
    const [showBathroomsFilter, setShowBathroomsFilter] = useState(false);
    const [showPropertyTypeFilter, setShowPropertyTypeFilter] = useState(false);
    const [showLocationFilter, setShowLocationFilter] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [popularLocations, setPopularLocations] = useState<LocationData[]>([]);
    const [locationCounts, setLocationCounts] = useState<{ [key: string]: number }>({});

    // Sort state
    const [sortBy, setSortBy] = useState('latest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Collection modal states
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedPropertyForCollection, setSelectedPropertyForCollection] = useState<string | null>(null);
    const [propertiesInCollections, setPropertiesInCollections] = useState<Set<string>>(new Set());

    // Debounce search query to reduce API calls
    const debouncedSearch = useDebounce(searchQuery, 500);

    const { bgColor, textColor, secondaryTextColor } = useThemeColors();

    // Load all initial data in one go
    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                propertyTypesData,
                popularLocationsData,
                userLocationData,
                recentlyViewedData,
                collectionsData
            ] = await Promise.all([
                propertyTypeService.getPropertyTypes().catch(() => []),
                locationService.getPopularLocations(10).catch(() => []),
                getUserLocationAsync(),
                isLoggedIn ? propertyService.getRecentlyViewedProperties(5).catch(() => ({ success: false, data: { properties: [] } })) : Promise.resolve({ success: false, data: { properties: [] } }),
                isLoggedIn ? collectionService.getCollections().catch(() => ({ data: { collections: [] } })) : Promise.resolve({ data: { collections: [] } })
            ]);

            // Set property types
            setPropertyTypes(propertyTypesData || []);

            // Set popular locations and counts
            setPopularLocations(popularLocationsData || []);
            const counts: { [key: string]: number } = {};
            if (popularLocationsData && Array.isArray(popularLocationsData)) {
                popularLocationsData.forEach(loc => {
                    counts[loc.name] = loc.propertyCount;
                });
            }
            setLocationCounts(counts);

            // Set user location
            if (userLocationData) {
                setUserLocationName(userLocationData);
            }

            // Set recently viewed
            if (recentlyViewedData.success && recentlyViewedData.data.properties) {
                setRecentlyViewedProperties(recentlyViewedData.data.properties);
            }

            // Set collections and build property ID set
            // For SearchScreen, we only need to know which properties are in ANY collection
            // to show the bookmark icon state correctly.
            const collectionsArray = collectionsData.data?.collections || [];
            const propertyIdSet = new Set<string>();
            collectionsArray.forEach((collection: any) => {
                if (collection.propertyIds && Array.isArray(collection.propertyIds)) {
                    collection.propertyIds.forEach((id: string) => propertyIdSet.add(id));
                }
            });
            setPropertiesInCollections(propertyIdSet);

            // After user location is set, load featured properties
            if (userLocationData && userLocationData !== 'Area Around You') {
                await loadFeaturedProperties(userLocationData);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getUserLocationAsync = async (): Promise<string> => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return 'Malaysia'; // Fallback
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address && address.length > 0) {
                const state = address[0].region || address[0].city || address[0].country;
                if (state) {
                    return state;
                }
            }
            return 'Area Around You';
        } catch (error) {
            console.log('Error fetching location:', error);
            return 'Area Around You';
        }
    };

    const loadFeaturedProperties = async (locationName?: string) => {
        try {
            // Get user's current coordinates for nearby search
            let userCoords: { latitude: number; longitude: number } | null = null;

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    userCoords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    };
                    console.log('User coordinates for nearby search:', userCoords);
                }
            } catch (error) {
                console.log('Could not get user location for nearby search:', error);
            }

            // Load both in parallel
            const [nearbyResponse, topRatedResponse] = await Promise.all([
                // Fetch nearby properties if we have coordinates, otherwise fallback to city
                userCoords
                    ? propertyService.getNearbyProperties(
                        userCoords.latitude,
                        userCoords.longitude,
                        50, // 50km radius (increased for better results)
                        5   // limit 5 properties (maximum)
                    ).then(response => {
                        console.log('Nearby properties response:', response);
                        return response;
                    }).catch(error => {
                        console.error('Nearby properties error:', error);
                        return { success: false, data: { properties: [] } };
                    })
                    : propertyService.getMobileProperties(1, 5, {
                        city: locationName || userLocationName,
                        sortBy: 'rating',
                    }).catch(() => ({ success: false, data: { properties: [] } })),
                // Top rated from all locations
                propertyService.getMobileProperties(1, 3, {
                    sortBy: 'rating',
                }).catch(() => ({ success: false, data: { properties: [] } }))
            ]);

            // Set nearby/popular properties
            if (nearbyResponse.success && nearbyResponse.data.properties && nearbyResponse.data.properties.length > 0) {
                console.log('Setting popular properties:', nearbyResponse.data.properties.length);
                setPopularProperties(nearbyResponse.data.properties);
            } else {
                console.log('No nearby properties found, trying fallback...');
                // Fallback: try to get any properties sorted by rating
                try {
                    const fallbackResponse = await propertyService.getMobileProperties(1, 5, {
                        sortBy: 'rating',
                    });
                    if (fallbackResponse.success && fallbackResponse.data.properties) {
                        console.log('Fallback properties loaded:', fallbackResponse.data.properties.length);
                        setPopularProperties(fallbackResponse.data.properties);
                    } else {
                        setPopularProperties([]);
                    }
                } catch (error) {
                    console.error('Fallback properties error:', error);
                    setPopularProperties([]);
                }
            }

            // Set top rated properties from all locations
            if (topRatedResponse.success && topRatedResponse.data.properties) {
                setTopRatedProperties(topRatedResponse.data.properties);
            } else {
                setTopRatedProperties([]);
            }
        } catch (error) {
            console.error('Failed to load featured properties:', error);
            setPopularProperties([]);
            setTopRatedProperties([]);
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



    // Load all initial data on mount
    useEffect(() => {
        loadInitialData();
    }, [isLoggedIn]); // Only reload when login status changes

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
        // Reload both initial data and properties
        await Promise.all([
            loadInitialData(),
            loadProperties(1, true)
        ]);
        setPage(1);
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

    const loadCollections = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const response = await collectionService.getCollections();
            const collectionsData = response.data?.collections || [];
            // setCollections(collectionsData); // Keep this line to update the collections state

            // Build set of all property IDs in any collection
            const propertyIdSet = new Set<string>();
            collectionsData.forEach((collection: any) => {
                if (collection.propertyIds && Array.isArray(collection.propertyIds)) {
                    collection.propertyIds.forEach((id: string) => propertyIdSet.add(id));
                }
            });
            setPropertiesInCollections(propertyIdSet);
        } catch (error) {
            console.error('Failed to load collections:', error);
        }
    }, [isLoggedIn]);

    const handleAddToCollection = useCallback(async (propertyId: string) => {
        if (!isLoggedIn) {
            Alert.alert('Login Required', 'Please login to add properties to collections');
            return;
        }

        // Check if property is already in any collection using our Set
        // Note: This simple check might need refinement if you want to know WHICH collection
        // But for the search screen, we mainly care if it IS bookmarked or not.
        // If we want to allow adding to MULTIPLE collections, we should just show the modal directly.

        // For now, let's just open the modal to let user manage it
        setSelectedPropertyForCollection(propertyId);
        setShowCollectionModal(true);
    }, [isLoggedIn]);

    const handleCollectionSelected = useCallback(async (collectionId: string) => {
        if (!selectedPropertyForCollection) return;

        try {
            await collectionService.addPropertyToCollection(collectionId, selectedPropertyForCollection);
            Alert.alert('Success', 'Property added to collection');
            setShowCollectionModal(false);
            setSelectedPropertyForCollection(null);
            // Reload collections to update the bookmark icons
            await loadCollections();
        } catch (error: any) {
            console.error('Add to collection error:', error);
            Alert.alert('Error', error.message || 'Failed to add property to collection');
        }
    }, [selectedPropertyForCollection, loadCollections]);

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

    // Use popularProperties from state (loaded via API)
    const featuredProperties = popularProperties;

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
                    area: Number(item.areaSqm),
                    image: item.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                    type: item.propertyType?.name?.toLowerCase() || 'house',
                    isFavorited: isFavorited(item.id),
                    isInCollection: propertiesInCollections.has(item.id),
                    rating: item.averageRating || 0,
                }}
                onPress={() => handlePropertyPress(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onAddToCollection={handleAddToCollection}
            />
        </Animated.View>
    ), [handlePropertyPress, handleFavoriteToggle, handleAddToCollection, isFavorited, propertiesInCollections]);

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
                                <Text className={`ml-3 text-lg font-normal text-gray-400 flex-1`}>
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

                    {/* Last Viewed Section */}
                    <Animated.View entering={FadeInDown.delay(250).springify()} className="mt-6">
                        <View className="px-6 mb-4">
                            <Text className={`text-xl font-bold ${textColor}`}>
                                Last Viewed
                            </Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 24, gap: 16, paddingBottom: 8 }}
                        >
                            {recentlyViewedProperties.length > 0 ? (
                                recentlyViewedProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={{
                                            id: property.id,
                                            title: property.title,
                                            price: property.price,
                                            location: `${property.city}, ${property.state}`,
                                            bedrooms: property.bedrooms,
                                            bathrooms: property.bathrooms,
                                            area: Number(property.areaSqm),
                                            image: property.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                                            type: property.propertyType?.name?.toLowerCase() || 'house',
                                            isFavorited: isFavorited(property.id),
                                            isInCollection: propertiesInCollections.has(property.id),
                                            rating: property.averageRating || 0,
                                        }}
                                        variant="compact"
                                        onPress={() => handlePropertyPress(property.id)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onAddToCollection={handleAddToCollection}
                                    />
                                ))
                            ) : (
                                <View
                                    className={`rounded-2xl overflow-hidden ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                                    style={{
                                        width: 200,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 4,
                                    }}
                                >
                                    <View className={`w-full h-32 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} items-center justify-center`}>
                                        <Ionicons
                                            name="eye-off-outline"
                                            size={40}
                                            color={isDark ? '#4B5563' : '#D1D5DB'}
                                        />
                                    </View>
                                    <View className="p-3">
                                        <Text className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            No properties yet
                                        </Text>
                                        <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Start exploring to see your recently viewed properties here
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>
                </View>


                {/* Top Rated Section - Best Recommendations */}
                {selectedCategory === 'all' && topRatedProperties.length > 0 && (
                    <>
                        <TouchableOpacity
                            className="flex-row items-center px-6 mb-4 mt-6"
                            onPress={() => navigation.navigate('TopRatedProperties')}
                        >
                            <Text className={`text-xl font-bold ${textColor} mr-1`}>
                                Best Recommendations
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFF' : '#111827'} />
                        </TouchableOpacity>
                        <Animated.View entering={FadeInDown.delay(350).springify()}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingLeft: 24, paddingRight: 24, gap: 16, paddingBottom: 8 }}
                            >
                                {topRatedProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={{
                                            id: property.id,
                                            title: property.title,
                                            price: property.price,
                                            location: `${property.city}, ${property.state}`,
                                            bedrooms: property.bedrooms,
                                            bathrooms: property.bathrooms,
                                            area: Number(property.areaSqm),
                                            image: property.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                                            type: property.propertyType?.name?.toLowerCase() || 'house',
                                            isFeatured: true,
                                            isFavorited: isFavorited(property.id),
                                            isInCollection: propertiesInCollections.has(property.id),
                                            rating: property.averageRating || 0,
                                        }}
                                        variant="compact"
                                        onPress={() => handlePropertyPress(property.id)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onAddToCollection={handleAddToCollection}
                                    />
                                ))}
                            </ScrollView>
                        </Animated.View>
                    </>
                )}

                {/* Popular / Featured Section Title */}
                {selectedCategory === 'all' && (
                    <View className="px-6 mb-4 mt-6">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            Popular Nearby Properties
                        </Text>
                    </View>
                )}

                {/* Featured Properties List or Empty State */}
                {selectedCategory === 'all' && (
                    <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 24, gap: 16, paddingBottom: 8 }}
                        >
                            {featuredProperties.length > 0 ? (
                                featuredProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={{
                                            id: property.id,
                                            title: property.title,
                                            price: property.price,
                                            location: `${property.city}, ${property.state}`,
                                            bedrooms: property.bedrooms,
                                            bathrooms: property.bathrooms,
                                            area: Number(property.areaSqm),
                                            image: property.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                                            type: property.propertyType?.name?.toLowerCase() || 'house',
                                            isFeatured: true,
                                            isFavorited: isFavorited(property.id),
                                            isInCollection: propertiesInCollections.has(property.id),
                                            rating: property.averageRating || 0,
                                        }}
                                        variant="compact"
                                        onPress={() => handlePropertyPress(property.id)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onAddToCollection={handleAddToCollection}
                                    />
                                ))
                            ) : (
                                <View
                                    className={`rounded-2xl overflow-hidden ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                                    style={{
                                        width: 200,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 4,
                                    }}
                                >
                                    <View className={`w-full h-32 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} items-center justify-center`}>
                                        <Ionicons
                                            name="home-outline"
                                            size={40}
                                            color={isDark ? '#4B5563' : '#D1D5DB'}
                                        />
                                    </View>
                                    <View className="p-3">
                                        <Text className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            No properties nearby
                                        </Text>
                                        <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            There are no properties around your area at this time
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* Explore Popular Locations */}
                <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-6">
                    <View className="px-6 mb-4">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            Explore Popular Locations
                        </Text>
                    </View>

                    {loading ? (
                        <View className="px-6">
                            <ActivityIndicator size="small" color="#00D9A3" />
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
                            className="mb-4"
                        >
                            {DUMMY_LOCATIONS.map((location, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setSelectedLocation(location.name);
                                        setShowLocationFilter(true);
                                    }}
                                    className="mr-4"
                                    style={{ width: 160 }}
                                >
                                    <ImageBackground
                                        source={{ uri: LOCATION_IMAGES[location.name] || LOCATION_IMAGES.default }}
                                        className="w-full h-56 rounded-2xl overflow-hidden"
                                        imageStyle={{ borderRadius: 16 }}
                                    >
                                        <LinearGradient
                                            colors={['rgba(1, 232, 173, 0)', 'rgba(1, 232, 173, 0.4)', 'rgba(16, 160, 247, 0.6)']}
                                            locations={[0, 0.4, 1]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            className="flex-1 justify-end p-4"
                                        >
                                            <Text className="text-white font-bold text-base" numberOfLines={1}>
                                                {location.name}
                                            </Text>
                                        </LinearGradient>
                                    </ImageBackground>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
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

            {/* Location Filter Bottom Sheet */}
            <Modal
                visible={showLocationFilter}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLocationFilter(false)}
            >
                <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={() => setShowLocationFilter(false)}
                    />
                    <View
                        className={`rounded-t-3xl ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                        style={{
                            height: '80%',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 20,
                        }}
                    >
                        {/* Header */}
                        <View className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <View className="flex-row items-center justify-between">
                                <Text className={`text-xl font-bold ${textColor}`}>
                                    Properties in {selectedLocation}
                                </Text>
                                <TouchableOpacity onPress={() => setShowLocationFilter(false)}>
                                    <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Properties List */}
                        <ScrollView
                            className="flex-1 px-6 pt-4"
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {loading ? (
                                <View className="items-center py-8">
                                    <ActivityIndicator size="large" color="#00D9A3" />
                                </View>
                            ) : filteredProperties.filter(p => p.state === selectedLocation).length > 0 ? (
                                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    {filteredProperties.filter(p => p.state === selectedLocation).map((property, index) => (
                                        <View key={property.id} style={{ width: '48%', marginBottom: 8 }}>
                                            <PropertyCard
                                                property={{
                                                    id: property.id,
                                                    title: property.title,
                                                    location: `${property.city}, ${property.state}`,
                                                    price: property.price,
                                                    rating: property.averageRating || 0,
                                                    image: property.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                                                    bedrooms: property.bedrooms,
                                                    bathrooms: property.bathrooms,
                                                    area: Number(property.areaSqm),
                                                    type: property.propertyType?.name?.toLowerCase() || 'house',
                                                    isFeatured: false,
                                                    isFavorited: isFavorited(property.id),
                                                    isInCollection: propertiesInCollections.has(property.id),
                                                }}
                                                variant="compact"
                                                style={{ width: '100%' }}
                                                onPress={() => {
                                                    setShowLocationFilter(false);
                                                    handlePropertyPress(property.id);
                                                }}
                                                onFavoriteToggle={handleFavoriteToggle}
                                                onAddToCollection={handleAddToCollection}
                                            />
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View className="items-center justify-center py-12">
                                    <Ionicons name="home-outline" size={64} color="#9CA3AF" />
                                    <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                                        No Properties Found
                                    </Text>
                                    <Text className={`text-sm font-normal mt-2 ${secondaryTextColor}`}>
                                        Try selecting another location
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Collection Selection Modal */}
            <CollectionModal
                visible={showCollectionModal}
                onClose={() => {
                    setShowCollectionModal(false);
                    setSelectedPropertyForCollection(null);
                }}
                onCollectionSelected={handleCollectionSelected}
                onCollectionCreated={loadCollections}
                selectedPropertyId={selectedPropertyForCollection}
            />
        </View>
    );
}
