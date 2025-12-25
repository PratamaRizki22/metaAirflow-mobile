import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { favoriteService } from '../../services';
import { LoginPrompt } from '../../components/auth';
import { useThemeColors } from '../../hooks';
import { LoadingState, EmptyState } from '../../components/common';

export function FavoritesScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { bgColor, textColor, cardBg } = useThemeColors();

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const response = await favoriteService.getFavorites(1, 50);
            setFavorites(response.data.favorites);
        } catch (error: any) {
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

    // Show login prompt if user is not authenticated
    if (!user) {
        return (
            <View className={`flex-1 ${bgColor}`}>
                <View className="px-6 pt-16 pb-4">
                    <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                        Favorites
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                        Save your favorite properties
                    </Text>
                </View>
                <View className="px-6">
                    <LoginPrompt
                        variant="inline"
                        title="Login to View Favorites"
                        message="Sign in to save and view your favorite properties"
                        onLoginPress={() => navigation.navigate('Profile')}
                    />
                </View>
            </View>
        );
    }

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
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const property = item.property;
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
                                    {property.title}
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                    {property.city}, {property.state}
                                </Text>
                                <Text className="text-primary-light dark:text-primary-dark font-bold text-base mb-2">
                                    Rp {property.price?.toLocaleString()}/month
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                    {property.bedrooms} beds • {property.bathrooms} baths • {property.areaSqm} m²
                                </Text>

                                {/* Remove Button */}
                                <TouchableOpacity
                                    onPress={() => handleRemoveFavorite(property.id, property.title)}
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
