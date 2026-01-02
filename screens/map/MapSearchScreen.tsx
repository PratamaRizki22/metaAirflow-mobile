import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAPTILER_API_KEY } from '@env';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useFavorites } from '../../contexts/FavoritesContext';
import { propertyTypeService } from '../../services';
import {
    AdvancedSearchModal,
    PriceFilterSheet,
    BedroomsFilterSheet,
    BathroomsFilterSheet,
    PropertyTypeFilterSheet,
    FilterBar,
} from '../../components/search';
import {
    MapMarker,
    CenterMarker,
    MapSearchHeader,
    MapBottomSheet,
    LocationNotFoundView,
} from '../../components/map';
import { useMapSearch } from '../../hooks/useMapSearch';

// Constants
const DEFAULT_MAP_CENTER: [number, number] = [100.3327, 5.4164]; // Penang
const DEFAULT_MAPTILER_KEY = 'CNmR4fJvRK89a2UaoY91';

export const MapSearchScreen = ({ navigation, route }: any) => {
    const { bgColor, textColor } = useThemeColors();
    const { isFavorited, toggleFavorite } = useFavorites();
    
    // Refs
    const mapRef = useRef<React.ComponentRef<typeof MapLibreGL.MapView>>(null);
    const cameraRef = useRef<React.ComponentRef<typeof MapLibreGL.Camera>>(null);

    // Route params
    const searchQuery = route.params?.searchQuery || '';

    // State
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_MAP_CENTER);
    const [locationNotFound, setLocationNotFound] = useState(false);
    
    // Filter States
    const [searchFilters, setSearchFilters] = useState<any>({});
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
    
    // Filter Sheet Visibility
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [showBedroomsFilter, setShowBedroomsFilter] = useState(false);
    const [showBathroomsFilter, setShowBathroomsFilter] = useState(false);
    const [showPropertyTypeFilter, setShowPropertyTypeFilter] = useState(false);

    // Custom hook for map search logic
    const { geocodeSearchQuery, fetchProperties } = useMapSearch({
        searchQuery,
        searchFilters,
        setMapCenter,
        setLocationNotFound,
        setListings,
        setLoading,
        cameraRef,
    });

    // Load property types on mount
    useEffect(() => {
        loadPropertyTypes();
    }, []);

    // Geocode search query when it changes
    useEffect(() => {
        if (searchQuery) {
            console.log('🔍 Geocoding location:', searchQuery);
            geocodeSearchQuery().then(() => {
                // Fetch properties after geocoding
                fetchProperties();
            });
        }
    }, [searchQuery]); // Removed geocodeSearchQuery from deps to avoid infinite loop

    // Initial load
    useEffect(() => {
        if (!searchQuery) {
            fetchProperties();
        }
    }, []);

    // Fetch when filters change
    useEffect(() => {
        if (Object.keys(searchFilters).length > 0) {
            fetchProperties();
        }
    }, [searchFilters]);

    const loadPropertyTypes = async () => {
        try {
            const response = await propertyTypeService.getPropertyTypes();
            setPropertyTypes(response);
        } catch (error) {
            console.log('Failed to load property types', error);
        }
    };

    const handleClearFilters = useCallback(() => {
        setSearchFilters({});
    }, []);

    const handleFavoriteToggle = useCallback(async (propertyId: string) => {
        try {
            await toggleFavorite(propertyId);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to toggle favorite');
        }
    }, [toggleFavorite]);

    const handlePropertyPress = useCallback((propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    }, [navigation]);

    const handleBackPress = useCallback(() => {
        // Go back to previous screen (MainTabs with Search screen)
        navigation.goBack();
    }, [navigation]);

    const handleSearchPress = useCallback(() => {
        navigation.navigate('SearchInput');
    }, [navigation]);

    const handleFilterPress = useCallback(() => {
        setShowAdvancedSearch(true);
    }, []);

    const handlePriceFilterSelect = useCallback((minPrice?: number, maxPrice?: number) => {
        setSearchFilters((prev: any) => ({ ...prev, minPrice, maxPrice }));
    }, []);

    const handleBedroomsFilterSelect = useCallback((bedrooms?: number) => {
        setSearchFilters((prev: any) => ({ ...prev, bedrooms }));
    }, []);

    const handleBathroomsFilterSelect = useCallback((bathrooms?: number) => {
        setSearchFilters((prev: any) => ({ ...prev, bathrooms }));
    }, []);

    const handlePropertyTypeFilterSelect = useCallback((propertyTypeId?: string) => {
        setSearchFilters((prev: any) => ({ ...prev, propertyTypeId }));
    }, []);

    const handleAdvancedSearchApply = useCallback((filters: any) => {
        setSearchFilters(filters);
    }, []);

    // Render markers
    const renderMarkers = useCallback(() => {
        return listings.map((item) => {
            const lng = parseFloat(item.longitude);
            const lat = parseFloat(item.latitude);
            
            if (isNaN(lng) || isNaN(lat)) {
                console.warn(`Invalid coordinates for property ${item.id}`);
                return null;
            }
            
            return (
                <MapMarker
                    key={item.id}
                    id={item.id}
                    coordinate={[lng, lat]}
                    price={item.price}
                    currencyCode={item.currencyCode}
                    onPress={() => handlePropertyPress(item.id)}
                />
            );
        });
    }, [listings, handlePropertyPress]);

    // Location not found view
    if (locationNotFound) {
        return (
            <LocationNotFoundView
                searchQuery={searchQuery}
                onBackPress={handleBackPress}
                onSearchPress={handleSearchPress}
            />
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Map View */}
            <MapLibreGL.MapView
                ref={mapRef}
                style={styles.map}
                mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY || DEFAULT_MAPTILER_KEY}`}
                logoEnabled={false}
                attributionEnabled={false}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    zoomLevel={13}
                    centerCoordinate={mapCenter}
                />

                {/* Center Point Marker */}
                {searchQuery && <CenterMarker coordinate={mapCenter} />}

                {/* Property Markers */}
                {renderMarkers()}
            </MapLibreGL.MapView>

            {/* Header */}
            <View style={styles.topContainer}>
                <MapSearchHeader
                    searchQuery={searchQuery}
                    hasActiveFilters={Object.keys(searchFilters).length > 0}
                    onBackPress={handleBackPress}
                    onSearchPress={handleSearchPress}
                    onFilterPress={handleFilterPress}
                />

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

            {/* Bottom Sheet */}
            <MapBottomSheet
                listings={listings}
                isFavorited={isFavorited}
                onPropertyPress={handlePropertyPress}
                onFavoriteToggle={handleFavoriteToggle}
            />

            {/* Filter Modals */}
            <AdvancedSearchModal
                visible={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={handleAdvancedSearchApply}
                initialFilters={searchFilters}
            />

            <PriceFilterSheet
                visible={showPriceFilter}
                onClose={() => setShowPriceFilter(false)}
                onSelect={handlePriceFilterSelect}
                currentMin={searchFilters.minPrice}
                currentMax={searchFilters.maxPrice}
            />

            <BedroomsFilterSheet
                visible={showBedroomsFilter}
                onClose={() => setShowBedroomsFilter(false)}
                onSelect={handleBedroomsFilterSelect}
                currentValue={searchFilters.bedrooms}
            />

            <BathroomsFilterSheet
                visible={showBathroomsFilter}
                onClose={() => setShowBathroomsFilter(false)}
                onSelect={handleBathroomsFilterSelect}
                currentValue={searchFilters.bathrooms}
            />

            <PropertyTypeFilterSheet
                visible={showPropertyTypeFilter}
                onClose={() => setShowPropertyTypeFilter(false)}
                onSelect={handlePropertyTypeFilterSelect}
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
    topContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    filterContainer: {
        marginBottom: 10,
    },
});
