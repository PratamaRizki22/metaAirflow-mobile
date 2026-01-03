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
    'Penang': 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=500',
    'Johor': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
    'Johor Bahru': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
    'Putrajaya': 'https://images.unsplash.com/photo-1549471053-4c46a2e13919?w=500',
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
    const [popularProperties, setPopularProperties] = useState<any[]>([]); // Properties from user location
    const [topRatedProperties, setTopRatedProperties] = useState<any[]>([]); // Top rated from all locations

    // Filter bottom sheet states
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [showBedroomsFilter, setShowBedroomsFilter] = useState(false);
    const [showBathroomsFilter, setShowBathroomsFilter] = useState(false);
    const [showPropertyTypeFilter, setShowPropertyTypeFilter] = useState(false);
    const [showLocationFilter, setShowLocationFilter] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [popularLocations, setPopularLocations] = useState<LocationData[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
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
    const [collections, setCollections] = useState<any[]>([]);
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [showCreateCollection, setShowCreateCollection] = useState(false);

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

    const loadPopularLocations = async () => {
        try {
            setLocationsLoading(true);
            const locations = await locationService.getPopularLocations(10);
            setPopularLocations(locations || []);
            
            // Create a map of location counts
            const counts: { [key: string]: number } = {};
            if (locations && Array.isArray(locations)) {
                locations.forEach(loc => {
                    counts[loc.name] = loc.propertyCount;
                });
            }
            setLocationCounts(counts);
        } catch (error) {
            console.error('Error loading popular locations:', error);
            setPopularLocations([]);
            setLocationCounts({});
        } finally {
            setLocationsLoading(false);
        }
    };

    // Load locations when modal is opened
    const handleOpenLocationFilter = () => {
        setShowLocationFilter(true);
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

    // Debug collections state
    useEffect(() => {
        console.log('Collections state updated:', collections.length, 'collections');
        if (collections.length > 0) {
            console.log('First collection:', collections[0]);
        }
    }, [collections]);

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
                // Prioritize Region (state/province) over City
                const state = address[0].region || address[0].city || address[0].country;
                if (state) {
                    setUserLocationName(state);
                }
            }
        } catch (error) {
            console.log('Error fetching location:', error);
            // Keep default "Area Around You"
        }
    };

    const loadRecentlyViewedProperties = async () => {
        if (!isLoggedIn) {
            setRecentlyViewedProperties([]);
            return;
        }

        try {
            const response = await propertyService.getRecentlyViewedProperties(5);
            if (response.success && response.data.properties) {
                setRecentlyViewedProperties(response.data.properties);
            }
        } catch (error) {
            // Silent fail - recently viewed is optional
            console.log('Failed to load recently viewed properties:', error);
            setRecentlyViewedProperties([]);
        }
    };

    const loadFeaturedProperties = async () => {
        try {
            // Load properties from user's location
            const locationResponse = await propertyService.getMobileProperties(1, 3, {
                city: userLocationName,
                sortBy: 'rating',
            });

            if (locationResponse.success && locationResponse.data.properties) {
                setPopularProperties(locationResponse.data.properties);
            } else {
                setPopularProperties([]);
            }

            // Always load top rated properties from all locations
            const topRatedResponse = await propertyService.getMobileProperties(1, 3, {
                sortBy: 'rating',
            });

            if (topRatedResponse.success && topRatedResponse.data.properties) {
                setTopRatedProperties(topRatedResponse.data.properties);
            } else {
                setTopRatedProperties([]);
            }
        } catch (error) {
            console.log('Failed to load featured properties:', error);
            setPopularProperties([]);
            setTopRatedProperties([]);
        }
    };

    // Load property types and location on mount
    useEffect(() => {
        loadPropertyTypes();
        loadPopularLocations(); // Load counts on mount
        getUserLocation();
        if (isLoggedIn) {
            loadRecentlyViewedProperties();
        }
    }, [isLoggedIn]);

    // Load featured properties when location changes
    useEffect(() => {
        if (userLocationName && userLocationName !== 'Area Around You') {
            loadFeaturedProperties();
        }
    }, [userLocationName]);

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

    const loadCollections = useCallback(async () => {
        if (!isLoggedIn) return;
        setLoadingCollections(true);
        try {
            const response = await collectionService.getCollections();
            console.log('Collections response:', JSON.stringify(response, null, 2));
            const collectionsData = response.data?.collections || [];
            console.log('Collections data:', collectionsData);
            setCollections(collectionsData);
        } catch (error) {
            console.error('Failed to load collections:', error);
        } finally {
            setLoadingCollections(false);
        }
    }, [isLoggedIn]);

    const handleAddToCollection = useCallback((propertyId: string) => {
        if (!isLoggedIn) {
            Alert.alert('Login Required', 'Please login to add properties to collections');
            return;
        }
        setSelectedPropertyForCollection(propertyId);
        setShowCollectionModal(true);
        loadCollections();
    }, [isLoggedIn, loadCollections]);

    const handleSelectCollection = useCallback(async (collectionId: string) => {
        if (!selectedPropertyForCollection) {
            console.log('No property selected for collection');
            return;
        }
        console.log('Adding property to collection:', {
            collectionId,
            propertyId: selectedPropertyForCollection
        });
        try {
            const response = await collectionService.addPropertyToCollection(collectionId, selectedPropertyForCollection);
            console.log('Add to collection response:', response);
            Alert.alert('Success', 'Property added to collection');
            setShowCollectionModal(false);
            setSelectedPropertyForCollection(null);
            // Reload collections to update the count
            await loadCollections();
        } catch (error: any) {
            console.error('Add to collection error:', error);
            Alert.alert('Error', error.message || 'Failed to add property to collection');
        }
    }, [selectedPropertyForCollection, loadCollections]);

    const handleCreateCollection = useCallback(async () => {
        if (!newCollectionName.trim()) {
            Alert.alert('Error', 'Please enter a collection name');
            return;
        }
        try {
            const response = await collectionService.createCollection(newCollectionName.trim());
            setNewCollectionName('');
            setShowCreateCollection(false);
            await loadCollections();
            if (selectedPropertyForCollection && response.data?.id) {
                await handleSelectCollection(response.data.id);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create collection');
        }
    }, [newCollectionName, selectedPropertyForCollection, loadCollections, handleSelectCollection]);

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
                }}
                onPress={() => handlePropertyPress(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onAddToCollection={handleAddToCollection}
            />
        </Animated.View>
    ), [handlePropertyPress, handleFavoriteToggle, handleAddToCollection, isFavorited]);

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
                        {recentlyViewedProperties.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingLeft: 24, paddingRight: 24, gap: 16, paddingBottom: 8 }}
                            >
                                {recentlyViewedProperties.map((property) => (
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
                                        }}
                                        variant="compact"
                                        onPress={() => handlePropertyPress(property.id)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <View className="px-6 py-8 bg-gray-100 dark:bg-gray-800 mx-6 rounded-2xl">
                                <View className="flex-row items-center">
                                    <Ionicons 
                                        name="information-circle-outline" 
                                        size={24} 
                                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                                    />
                                    <Text className={`ml-3 font-normal ${secondaryTextColor} flex-1`}>
                                        No properties viewed yet
                                    </Text>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>


                {/* Popular / Featured Section Title */}
                {selectedCategory === 'all' && (
                    <View className="px-6 mb-4 mt-6">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            Popular Property in Your Location
                        </Text>
                    </View>
                )}

                {/* Featured Properties List or Empty State */}
                {selectedCategory === 'all' && (
                    <>
                        {featuredProperties.length > 0 ? (
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
                                                area: Number(property.areaSqm),
                                                image: property.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                                                type: property.propertyType?.name?.toLowerCase() || 'house',
                                                isFeatured: true,
                                                isFavorited: isFavorited(property.id),
                                            }}
                                            variant="compact"
                                            onPress={() => handlePropertyPress(property.id)}
                                            onFavoriteToggle={handleFavoriteToggle}
                                            onAddToCollection={handleAddToCollection}
                                        />
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        ) : (
                            <Animated.View entering={FadeInDown.delay(300).springify()} className="mx-6 mb-6 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
                                <View className="flex-row items-center">
                                    <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
                                    <Text className={`ml-3 flex-1 font-normal ${secondaryTextColor}`}>
                                        Tidak ada properti di sekitar wilayah Anda saat ini
                                    </Text>
                                </View>
                            </Animated.View>
                        )}
                    </>
                )}

                {/* Top Rated Section - Rekomendasi Terbaik */}
                {selectedCategory === 'all' && topRatedProperties.length > 0 && (
                    <>
                        <TouchableOpacity
                            className="flex-row items-center px-6 mb-4 mt-6"
                            onPress={() => navigation.navigate('TopRatedProperties')}
                        >
                            <Text className={`text-xl font-bold ${textColor} mr-1`}>
                                Rekomendasi Terbaik
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

                {/* Explore Popular Locations */}
                <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-6">
                    <View className="px-6 mb-4">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            Explore Popular Locations
                        </Text>
                    </View>

                    {locationsLoading ? (
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
                                    style={{ width: 120 }}
                                >
                                    <ImageBackground
                                        source={{ uri: LOCATION_IMAGES[location.name] || LOCATION_IMAGES.default }}
                                        className="w-full h-32 rounded-2xl overflow-hidden"
                                        imageStyle={{ borderRadius: 16 }}
                                    >
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                                            className="flex-1 justify-end p-3"
                                        >
                                            <Text className="text-white font-bold text-sm" numberOfLines={1}>
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
            <Modal
                visible={showCollectionModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowCollectionModal(false);
                    setSelectedPropertyForCollection(null);
                    setShowCreateCollection(false);
                    setNewCollectionName('');
                }}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View
                        className={`rounded-t-3xl ${isDark ? 'bg-surface-dark' : 'bg-white'} px-6 py-6`}
                        style={{
                            maxHeight: '70%',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 20,
                        }}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className={`text-xl font-bold ${textColor}`}>
                                {showCreateCollection ? 'Create Collection' : 'Add to Collection'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowCollectionModal(false);
                                    setSelectedPropertyForCollection(null);
                                    setShowCreateCollection(false);
                                    setNewCollectionName('');
                                }}
                            >
                                <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        {showCreateCollection ? (
                            /* Create New Collection Form */
                            <View className="mb-4">
                                <Text className={`text-sm font-medium mb-2 ${secondaryTextColor}`}>
                                    Collection Name
                                </Text>
                                <TextInput
                                    value={newCollectionName}
                                    onChangeText={setNewCollectionName}
                                    placeholder="Enter collection name"
                                    placeholderTextColor="#9CA3AF"
                                    className={`px-4 py-3 rounded-xl border ${
                                        isDark
                                            ? 'bg-gray-800 border-gray-700 text-white'
                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                                    autoFocus
                                />
                                <View className="flex-row gap-3 mt-4">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowCreateCollection(false);
                                            setNewCollectionName('');
                                        }}
                                        className={`flex-1 py-3 rounded-xl border ${
                                            isDark ? 'border-gray-700' : 'border-gray-200'
                                        }`}
                                    >
                                        <Text className={`text-center font-semibold ${textColor}`}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleCreateCollection}
                                        className="flex-1 py-3 rounded-xl bg-primary"
                                    >
                                        <Text className="text-center font-semibold text-white">
                                            Create
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* Create New Collection Button */}
                                <TouchableOpacity
                                    onPress={() => setShowCreateCollection(true)}
                                    className={`flex-row items-center p-4 rounded-xl mb-4 border-2 border-dashed ${
                                        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
                                    }`}
                                >
                                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                                        <Ionicons name="add" size={24} color="#00D9A3" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`text-base font-semibold ${textColor}`}>
                                            Create New Collection
                                        </Text>
                                        <Text className={`text-sm ${secondaryTextColor}`}>
                                            Organize your favorites
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Collections List */}
                                {(() => {
                                    console.log('Rendering collections list. Loading:', loadingCollections, 'Count:', collections.length);
                                    return null;
                                })()}
                                {loadingCollections ? (
                                    <View className="py-12 items-center">
                                        <ActivityIndicator size="large" color="#00D9A3" />
                                        <Text className={`mt-2 ${secondaryTextColor}`}>Loading collections...</Text>
                                    </View>
                                ) : collections.length > 0 ? (
                                    <View style={{ maxHeight: 400 }}>
                                        <ScrollView
                                            showsVerticalScrollIndicator={true}
                                            nestedScrollEnabled={true}
                                        >
                                            {collections.map((collection) => {
                                                console.log('Rendering collection:', collection.name);
                                                return (
                                                    <TouchableOpacity
                                                        key={collection.id}
                                                        onPress={() => {
                                                            console.log('Collection tapped:', collection.id);
                                                            handleSelectCollection(collection.id);
                                                        }}
                                                        className={`flex-row items-center p-4 rounded-xl mb-3 ${
                                                            isDark ? 'bg-gray-800' : 'bg-gray-50'
                                                        }`}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                                                            <Ionicons name="folder" size={24} color="#00D9A3" />
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className={`text-base font-semibold ${textColor}`}>
                                                                {collection.name}
                                                            </Text>
                                                            <Text className={`text-sm ${secondaryTextColor}`}>
                                                                {collection._count?.favorites || 0} properties
                                                            </Text>
                                                        </View>
                                                        <Ionicons
                                                            name="chevron-forward"
                                                            size={20}
                                                            color={isDark ? '#9CA3AF' : '#6B7280'}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                ) : (
                                    <View className="items-center justify-center py-12">
                                        <Ionicons name="folder-outline" size={64} color="#9CA3AF" />
                                        <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                                            No Collections Yet
                                        </Text>
                                        <Text className={`text-sm mt-2 ${secondaryTextColor} text-center`}>
                                            Create a collection to organize{'\n'}your favorite properties
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
