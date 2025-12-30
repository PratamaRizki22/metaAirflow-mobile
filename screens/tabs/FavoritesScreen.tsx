import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { favoriteService } from '../../services';
import { useThemeColors } from '../../hooks';
import { LoadingState, EmptyState } from '../../components/common';

export function FavoritesScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const { bgColor, textColor, cardBg } = useThemeColors();

    // Auto-load favorites when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadFavorites(isInitialLoad);
                if (isInitialLoad) {
                    setIsInitialLoad(false);
                }
            } else {
                setLoading(false);
            }
        }, [user, isInitialLoad])
    );

    const loadFavorites = async (isInitialLoad = false) => {
        try {
            // Only show full-screen loading on initial load
            if (isInitialLoad) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            console.log('=== Loading Favorites ===');
            const response = await favoriteService.getFavorites(1, 50);
            console.log('Favorites API response:', {
                success: response.success,
                hasData: !!response.data,
                favoritesCount: response.data?.favorites?.length || 0
            });

            if (response.data?.favorites) {
                console.log('First 2 favorites:', response.data.favorites.slice(0, 2).map((f: any) => ({
                    id: f.id,
                    hasProperty: !!f.property,
                    propertyId: f.property?.id,
                    propertyTitle: f.property?.title
                })));
            }

            setFavorites(response.data?.favorites || []);
        } catch (error: any) {
            console.error('Load favorites error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Don't show Alert to prevent infinite loop
            setFavorites([]); // Set empty array on error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadFavorites();
    };

    const handleRemoveFavorite = async (propertyId: string, title: string) => {
        Alert.alert(
            'Remove Favorite',
            `Remove "${title}" from favorites?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await favoriteService.toggleFavorite(propertyId);
                            Alert.alert('Success', 'Removed from favorites');
                            loadFavorites();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const handlePropertyPress = (propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    };

    if (loading) {
        return <LoadingState message="Loading favorites..." />;
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <View className="px-6 pt-16 pb-4">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Favorites
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}
                </Text>
            </View>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 100,
                    flexGrow: 1,
                    justifyContent: favorites.length === 0 ? 'center' : 'flex-start'
                }}
                renderItem={({ item }) => {
                    console.log('Rendering favorite item:', item);
                    const property = item.property;
                    console.log('Property from item:', property);

                    // Skip if property is undefined or missing required fields
                    if (!property || !property.id) {
                        console.log('Skipping item - property invalid:', { hasProperty: !!property, hasId: !!property?.id });
                        return null;
                    }

                    return (
                        <TouchableOpacity
                            onPress={() => handlePropertyPress(property.id)}
                            className={`${cardBg} rounded-2xl mb-4 overflow-hidden`}
                        >
                            {/* Property Image */}
                            {property.images && property.images.length > 0 ? (
                                <Image
                                    source={{ uri: property.images[0] }}
                                    style={{ width: '100%', height: 200 }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-[200px] bg-gray-300 justify-center items-center">
                                    <Text className="text-gray-500">No Image</Text>
                                </View>
                            )}

                            {/* Property Info */}
                            <View className="p-4">
                                <Text className={`text-lg font-bold mb-1 ${textColor}`}>
                                    {property.title || 'Property'}
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                    {property.city || ''}{property.city && property.state ? ', ' : ''}{property.state || ''}
                                </Text>
                                <Text className="text-primary-light dark:text-primary-dark font-bold text-base mb-2">
                                    RM {property.price?.toLocaleString() || '0'}/month
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                    {property.bedrooms || 0} beds • {property.bathrooms || 0} baths • {property.areaSqm || 0} m²
                                </Text>

                                {/* Remove Button */}
                                <TouchableOpacity
                                    onPress={() => handleRemoveFavorite(property.id, property.title || 'Property')}
                                    className="mt-3 bg-red-500 py-2 px-4 rounded-lg"
                                >
                                    <Text className="text-white text-center font-semibold">
                                        Remove from Favorites
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <EmptyState
                        icon="heart-outline"
                        title="No Favorites Yet"
                        message="Start exploring properties and tap the heart icon to save your favorites here"
                        actionLabel="Explore Properties"
                        onAction={() => navigation.navigate('Home')}
                    />
                }
            />
        </View>
    );
}
