import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyCard } from '../../components/property';
import { DEFAULT_IMAGES } from '../../constants/images';
import { propertyService, collectionService } from '../../services';

export function LocationPropertiesScreen({ route, navigation }: any) {
    const { location } = route.params;
    const insets = useSafeAreaInsets();
    const { bgColor, textColor, secondaryTextColor } = useThemeColors();
    const { isFavorited, toggleFavorite } = useFavorites();
    const { isLoggedIn } = useAuth();

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [propertiesInCollections, setPropertiesInCollections] = useState<Set<string>>(new Set());
    const [collections, setCollections] = useState<any[]>([]);

    const loadProperties = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await propertyService.getMobileProperties(pageNum, 20, {
                city: location, // Filter by city instead of search
            });

            const newProperties = response.data.properties;

            if (reset) {
                setProperties(newProperties);
            } else {
                setProperties(prev => [...prev, ...newProperties]);
            }

            setHasMore(newProperties.length === 20);
        } catch (error: any) {
            console.error('Load properties error:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [location]);

    useEffect(() => {
        loadProperties(1, true);
        if (isLoggedIn) {
            loadCollections();
        }
    }, [location, isLoggedIn]);

    const loadCollections = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const response = await collectionService.getCollections();
            const collectionsData = response.data?.collections || [];
            setCollections(collectionsData);
            
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

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        loadProperties(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadProperties(nextPage, false);
        }
    };

    const handlePropertyPress = (propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    };

    const handleFavoriteToggle = async (propertyId: string) => {
        try {
            await toggleFavorite(propertyId);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to toggle favorite');
        }
    };

    const handleAddToCollection = useCallback((propertyId: string) => {
        if (!isLoggedIn) {
            Alert.alert('Login Required', 'Please login to add properties to collections');
            return;
        }
        
        if (propertiesInCollections.has(propertyId)) {
            Alert.alert(
                'Remove from Collection',
                'This property is already in a collection. Do you want to remove it?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const collectionsWithProperty = collections.filter(c => 
                                    c.propertyIds?.includes(propertyId)
                                );
                                
                                for (const collection of collectionsWithProperty) {
                                    await collectionService.removePropertyFromCollection(collection.id, propertyId);
                                }
                                
                                Alert.alert('Success', 'Property removed from collection(s)');
                                await loadCollections();
                            } catch (error: any) {
                                Alert.alert('Error', error.message || 'Failed to remove property from collection');
                            }
                        }
                    }
                ]
            );
        } else {
            navigation.navigate('Search');
        }
    }, [isLoggedIn, propertiesInCollections, collections, loadCollections, navigation]);

    const renderPropertyItem = ({ item, index }: any) => (
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
                    isInCollection: propertiesInCollections.has(item.id),
                }}
                onPress={() => handlePropertyPress(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onAddToCollection={handleAddToCollection}
            />
        </Animated.View>
    );

    if (loading) {
        return (
            <View className={`flex-1 ${bgColor} items-center justify-center`}>
                <ActivityIndicator size="large" color="#00D9A3" />
                <Text className={`mt-4 ${secondaryTextColor}`}>Loading properties...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View
                className={`${bgColor} border-b border-gray-200 dark:border-gray-700`}
                style={{ paddingTop: insets.top }}
            >
                <View className="flex-row items-center px-6 py-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color={textColor === 'text-white' ? '#FFF' : '#111827'} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            Popular in {location}
                        </Text>
                        <Text className={`text-sm ${secondaryTextColor}`}>
                            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                        </Text>
                    </View>
                </View>
            </View>

            {/* Properties List */}
            {properties.length > 0 ? (
                <FlatList
                    data={properties}
                    renderItem={renderPropertyItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingTop: 16,
                        paddingBottom: 100,
                    }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View className="py-4">
                                <ActivityIndicator size="small" color="#00D9A3" />
                            </View>
                        ) : null
                    }
                />
            ) : (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="home-outline" size={64} color="#9CA3AF" />
                    <Text className={`text-lg font-semibold mt-4 text-center ${textColor}`}>
                        No Properties Found
                    </Text>
                    <Text className={`text-sm mt-2 text-center ${secondaryTextColor}`}>
                        There are no property listings available in {location} at the moment.
                    </Text>
                </View>
            )}
        </View>
    );
}
