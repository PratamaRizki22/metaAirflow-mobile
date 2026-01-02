import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, FlatList } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import { MAPTILER_API_KEY } from '@env';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useFavorites } from '../../contexts/FavoritesContext';
import LocationNotFound from '../../assets/locationNotFound.svg';
import { propertyService, propertyTypeService } from '../../services';
import * as Location from 'expo-location';
import {
    AdvancedSearchModal,
    PriceFilterSheet,
    BedroomsFilterSheet,
    BathroomsFilterSheet,
    PropertyTypeFilterSheet,
    FilterBar,
} from '../../components/search';
import { PropertyCard } from '../../components/property/PropertyCard';
import { DEFAULT_IMAGES } from '../../constants/images';

export const MapSearchScreen = ({ navigation, route }: any) => {
    const { bgColor, textColor } = useThemeColors();
    const { isFavorited, toggleFavorite } = useFavorites();
    const mapRef = useRef<React.ComponentRef<typeof MapLibreGL.MapView>>(null);
    const cameraRef = useRef<React.ComponentRef<typeof MapLibreGL.Camera>>(null);

    // Params from SearchInput
    const searchQuery = route.params?.searchQuery || '';

    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState<number[]>([100.3327, 5.4164]); // Default Penang

    // Filter States
    const [searchFilters, setSearchFilters] = useState<any>({});
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);

    // Filter Sheet Visibility States
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [showBedroomsFilter, setShowBedroomsFilter] = useState(false);
    const [showBathroomsFilter, setShowBathroomsFilter] = useState(false);
    const [showPropertyTypeFilter, setShowPropertyTypeFilter] = useState(false);

    // Load Property Types
    useEffect(() => {
        loadPropertyTypes();
    }, []);

    const loadPropertyTypes = async () => {
        try {
            const response = await propertyTypeService.getPropertyTypes();
            setPropertyTypes(response);
        } catch (error) {
            console.log('Failed to load property types', error);
        }
    };

    const [locationNotFound, setLocationNotFound] = useState(false);

    // 1. Fetch Location Coordinates from Search Query (Geocoding)
    const geocodeSearchQuery = async () => {
        if (!searchQuery) return;

        try {
            setLocationNotFound(false);
            // Use Expo Location to geocode the city name to lat/long
            const geocoded = await Location.geocodeAsync(searchQuery);
            if (geocoded && geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                setMapCenter([longitude, latitude]); // MapLibre uses [lng, lat]

                // Move Camera
                cameraRef.current?.setCamera({
                    centerCoordinate: [longitude, latitude],
                    zoomLevel: 13,
                    animationDuration: 1000,
                });
            } else {
                setLocationNotFound(true);
            }
        } catch (error) {
            console.log('Geocoding error:', error);
            setLocationNotFound(true);
        }
    };

    // 2. Fetch Real Properties from Backend
    const fetchProperties = async () => {
        if (locationNotFound) return;

        setLoading(true);
        try {
            // Build params object
            const params: any = {
                ...searchFilters
            };

            // Only add search param if it's not empty
            if (searchQuery) {
                params.search = searchQuery;
            }

            console.log('Fetching properties with params:', params);

            // Call Real Service with search query and filters
            const response = await propertyService.getMobileProperties(1, 50, params);
            console.log('API Response:', {
                success: response.success,
                propertiesCount: response.data?.properties?.length || 0,
                hasData: !!response.data
            });

            if (response.success && response.data.properties) {
                // Filter properties that have valid coordinates
                const validProperties = response.data.properties.filter(
                    (p: any) => p.latitude && p.longitude
                );

                console.log(`Loaded ${validProperties.length} valid properties`);
                console.log('Sample property coordinates:', validProperties[0] ? {
                    id: validProperties[0].id,
                    lat: validProperties[0].latitude,
                    lng: validProperties[0].longitude
                } : 'No properties');
                
                setListings(validProperties);

                // Auto-zoom to show all properties if we have them
                if (validProperties.length > 0) {
                    const coordinates = validProperties.map(p => [parseFloat(p.longitude), parseFloat(p.latitude)]);
                    
                    // Calculate bounds
                    const lngs = coordinates.map(c => c[0]);
                    const lats = coordinates.map(c => c[1]);
                    const minLng = Math.min(...lngs);
                    const maxLng = Math.max(...lngs);
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);

                    // Fit to bounds with padding
                    cameraRef.current?.fitBounds(
                        [minLng, minLat],
                        [maxLng, maxLat],
                        [50, 50, 50, 200], // padding: top, right, bottom, left
                        1000 // animation duration
                    );
                }
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchProperties();
    }, []);

    const handleClearFilters = () => {
        setSearchFilters({});
    };

    const handleFavoriteToggle = async (propertyId: string) => {
        try {
            console.log('MapSearchScreen: Toggle favorite for', propertyId);
            console.log('Before toggle, isFavorited:', isFavorited(propertyId));
            await toggleFavorite(propertyId);
            console.log('After toggle, isFavorited:', isFavorited(propertyId));
        } catch (error: any) {
            console.error('Toggle favorite error:', error);
        }
    };

    if (locationNotFound) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />

                {/* Header (Keep it visible so user can search again) */}
                <View style={[styles.topContainer, { zIndex: 10 }]}>
                    <View style={styles.searchBarWrapper}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.searchInputContainer}
                            onPress={() => navigation.navigate('SearchInput')}
                        >
                            <Ionicons name="search" size={20} color="#666" />
                            <Text style={styles.searchInputText} numberOfLines={1}>
                                {searchQuery || "Search location..."}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Not Found Content */}
                <View style={styles.notFoundContainer}>
                    <View style={styles.notFoundIconContainer}>
                        <LocationNotFound width={80} height={80} />
                    </View>

                    <Text style={styles.notFoundTitle}>The location does not exist</Text>
                    <Text style={styles.notFoundSubtitle}>
                        Please enable your location services for more optional result
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* MAP VIEW */}
            <MapLibreGL.MapView
                ref={mapRef}
                style={styles.map}
                mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY || 'CNmR4fJvRK89a2UaoY91'}`}
                logoEnabled={false}
                attributionEnabled={false}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    zoomLevel={13}
                    centerCoordinate={mapCenter}
                />

                {/* REAL PROPERTY MARKERS */}
                {listings.map((item) => {
                    console.log(`Marker ${item.id}: lat=${item.latitude}, lng=${item.longitude}`);
                    return (
                        <MapLibreGL.PointAnnotation
                            key={item.id}
                            id={`marker-${item.id}`}
                            coordinate={[parseFloat(item.longitude), parseFloat(item.latitude)]}
                            onSelected={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.markerPin} />
                                <Text style={styles.markerText}>
                                    {item.currencyCode} {item.price.toLocaleString()}
                                </Text>
                            </View>
                        </MapLibreGL.PointAnnotation>
                    );
                })}
            </MapLibreGL.MapView>

            {/* FLOATING UI: Top Search Bar */}
            <View style={styles.topContainer}>
                <View style={styles.searchBarWrapper}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.searchInputContainer}
                        onPress={() => navigation.navigate('SearchInput')} // Go back to search input
                    >
                        <Ionicons name="search" size={20} color="#666" />
                        <Text style={styles.searchInputText} numberOfLines={1}>
                            {searchQuery || "Search location..."}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowAdvancedSearch(true)}
                        accessibilityLabel="Filter Properties"
                    >
                        <Ionicons name="options-outline" size={24} color="#333" />
                        {Object.keys(searchFilters).length > 0 && (
                            <View style={styles.activeBadge} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Filter Bar */}
                <View style={styles.filterContainer}>
                    <FilterBar
                        searchFilters={searchFilters}
                        onShowPrice={() => setShowPriceFilter(true)}
                        onShowBedrooms={() => setShowBedroomsFilter(true)}
                        onShowBathrooms={() => setShowBathroomsFilter(true)}
                        onShowPropertyType={() => setShowPropertyTypeFilter(true)}
                        onShowAdvanced={() => setShowAdvancedSearch(true)}
                        onClearAll={handleClearFilters}
                        hasActiveFilters={Object.keys(searchFilters).length > 0}
                    />
                </View>
            </View>

            {/* Bottom Sheet List */}
            {listings.length > 0 && (
                <View style={styles.bottomSheetContainer}>
                    <View style={styles.bottomSheetHandle} />
                    <Text style={styles.bottomSheetHeader}>
                        Lebih dari {listings.length} rumah
                    </Text>

                    <FlatList
                        data={listings}
                        keyExtractor={(item) => `${item.id}-${isFavorited(item.id)}`}
                        renderItem={({ item }) => (
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
                                    type: item.propertyType?.name || 'Property',
                                    isFavorited: isFavorited(item.id),
                                }}
                                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
                                onFavoriteToggle={handleFavoriteToggle}
                                variant="compact"
                                style={{
                                    marginBottom: 16,
                                    width: '100%',
                                }}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
            )}

            {/* --- FILTER SHEETS --- */}

            <AdvancedSearchModal
                visible={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={(filters) => {
                    setSearchFilters(filters);
                }}
                initialFilters={searchFilters}
            />

            <PriceFilterSheet
                visible={showPriceFilter}
                onClose={() => setShowPriceFilter(false)}
                onSelect={(minPrice, maxPrice) => {
                    setSearchFilters({ ...searchFilters, minPrice, maxPrice });
                }}
                currentMin={searchFilters.minPrice}
                currentMax={searchFilters.maxPrice}
            />

            <BedroomsFilterSheet
                visible={showBedroomsFilter}
                onClose={() => setShowBedroomsFilter(false)}
                onSelect={(bedrooms) => {
                    setSearchFilters({ ...searchFilters, bedrooms });
                }}
                currentValue={searchFilters.bedrooms}
            />

            <BathroomsFilterSheet
                visible={showBathroomsFilter}
                onClose={() => setShowBathroomsFilter(false)}
                onSelect={(bathrooms) => {
                    setSearchFilters({ ...searchFilters, bathrooms });
                }}
                currentValue={searchFilters.bathrooms}
            />

            <PropertyTypeFilterSheet
                visible={showPropertyTypeFilter}
                onClose={() => setShowPropertyTypeFilter(false)}
                onSelect={(propertyTypeId) => {
                    setSearchFilters({ ...searchFilters, propertyTypeId });
                }}
                currentValue={searchFilters.propertyTypeId}
                propertyTypes={propertyTypes}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#007AFF',
        alignItems: 'center',
        minWidth: 80,
    },
    markerPin: {
        position: 'absolute',
        top: -8,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        backgroundColor: '#007AFF',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
    markerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxHeight: '45%', // Occupy up to 45% of screen
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    bottomSheetHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    topContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInputText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    filterButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#00D9A3',
        borderWidth: 2,
        borderColor: '#fff',
    },
    filterContainer: {
        marginBottom: 10,
    },
    notFoundContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#E6F7FF', // Light blue background
        marginTop: 60,
    },
    notFoundIconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F0F9FF',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 5,
        borderColor: '#fff',
    },
    notFoundTitle: {
        fontFamily: 'VisbyRound-Bold',
        fontSize: 18,
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    notFoundSubtitle: {
        fontFamily: 'VisbyRound-Regular',
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});
