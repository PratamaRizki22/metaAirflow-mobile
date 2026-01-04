import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '../../services';
import { useUserLocation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

export default function ExploreScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        city: '',
        minPrice: 0,
        maxPrice: 100000000,
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
    });

    const { requestLocation, loading: loadingLocation } = useUserLocation();

    // Load properties on mount
    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async (lat?: number, lng?: number, forceRefresh = false) => {
        try {
            // Don't show loading spinner if we have cached data (unless force refresh)
            if (properties.length === 0 || forceRefresh) {
                setLoading(true);
            }
            setIsReady(false);

            const queryFilters = {
                ...filters,
                search: searchQuery || undefined,
            };

            // Inject coordinates if provided
            if (lat && lng) {
                Object.assign(queryFilters, { latitude: lat, longitude: lng });
            }

            const response = await propertyService.getMobileProperties(1, 20, queryFilters);
            setProperties(response.data.properties);
        } catch (error: any) {
            console.error('ExploreScreen - Get mobile properties error:', error);
            // Don't clear existing data on error, just show error message
            if (properties.length === 0) {
                setProperties([]);
            }
        } finally {
            setLoading(false);
            setIsReady(true);
        }
    };

    const handleNearbySearch = async () => {
        const userLoc = await requestLocation();
        if (userLoc) {
            setFilters(prev => ({
                ...prev,
                latitude: userLoc.latitude,
                longitude: userLoc.longitude
            }));
            // Immediately reload with new coordinates
            loadProperties(userLoc.latitude, userLoc.longitude);
        }
    };

    const handleSearch = () => {
        loadProperties();
    };

    const handlePropertyPress = (propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProperties(filters.latitude, filters.longitude, true);
        setRefreshing(false);
    }, [filters.latitude, filters.longitude]);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';

    // Show loading only on first load
    if (loading && properties.length === 0) {
        return (
            <View className={`flex-1 justify-center items-center ${bgColor}`}>
                <ActivityIndicator size="large" color="#00D9A3" />
                <Text className={`mt-4 ${textColor}`} style={{ fontFamily: 'VisbyRound-Medium' }}>
                    Loading properties...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Explore Properties
            </Text>

            {/* Search Bar */}
            <View style={{ marginBottom: 15 }}>
                <TextInput
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 10,
                    }}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        onPress={handleSearch}
                        style={{ flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                            Search
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleNearbySearch}
                        disabled={loadingLocation}
                        style={{
                            flex: 1,
                            backgroundColor: '#34C759',
                            padding: 12,
                            borderRadius: 8,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 5
                        }}
                    >
                        <Ionicons name="location" size={18} color="white" />
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                            {loadingLocation ? 'Locating...' : 'Nearby'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Property List */}
            <FlatList
                data={properties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handlePropertyPress(item.id)}
                        style={{
                            padding: 15,
                            backgroundColor: '#f9f9f9',
                            marginBottom: 10,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                            {item.title}
                        </Text>
                        <Text style={{ color: '#666', marginBottom: 5 }}>
                            {item.city}, {item.state}
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>
                            RM {item.price.toLocaleString()}/month
                        </Text>
                        <Text style={{ color: '#666', marginTop: 5 }}>
                            {item.bedrooms} beds • {item.bathrooms} baths • {item.areaSqm} m²
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                        No properties found
                    </Text>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#00D9A3']}
                        tintColor="#00D9A3"
                    />
                }
                // Performance optimizations
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={5}
            />
        </View>
    );
}
