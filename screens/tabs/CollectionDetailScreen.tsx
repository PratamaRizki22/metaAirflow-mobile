import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { PropertyCard } from '../../components/property/PropertyCard';
import { DEFAULT_IMAGES } from '../../constants/images';
import { favoriteService, collectionService } from '../../services';

export function CollectionDetailScreen({ navigation, route }: any) {
    const { isDark } = useTheme();
    const { toggleFavorite, isFavorited } = useFavorites();
    const { collectionId, collectionName } = route.params || {};
    
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCollectionProperties = useCallback(async () => {
        if (!collectionId) return;
        
        try {
            setLoading(true);
            // Get all favorites with collectionId filter
            const response = await favoriteService.getFavorites();
            
            // Filter properties that belong to this collection
            const collectionProperties = response.data.favorites.filter(
                (fav: any) => fav.collectionId === collectionId
            );
            
            setProperties(collectionProperties);
        } catch (error) {
            console.error('Load collection properties error:', error);
            Alert.alert('Error', 'Failed to load collection properties');
        } finally {
            setLoading(false);
        }
    }, [collectionId]);

    useFocusEffect(
        useCallback(() => {
            loadCollectionProperties();
        }, [loadCollectionProperties])
    );

    const handleFavoriteToggle = async (propertyId: string) => {
        try {
            await toggleFavorite(propertyId);
            // Reload to update the list
            await loadCollectionProperties();
        } catch (error: any) {
            console.error('Toggle favorite error:', error);
        }
    };

    const handleRemoveFromCollection = async (propertyId: string) => {
        Alert.alert(
            'Remove from Collection',
            'Are you sure you want to remove this property from the collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await collectionService.removePropertyFromCollection(collectionId, propertyId);
                            Alert.alert('Success', 'Property removed from collection');
                            await loadCollectionProperties();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to remove property');
                        }
                    }
                }
            ]
        );
    };

    const bgColor = isDark ? 'bg-background-dark' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View className="px-6 pt-12 pb-4 flex-row items-center">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
                
                <Text className={`text-xl font-['VisbyRound-Bold'] ml-4 ${textColor} flex-1`} numberOfLines={1}>
                    {collectionName || 'Collection'} ({properties.length})
                </Text>
            </View>

            {/* Loading State */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#00D9A3" />
                </View>
            ) : properties.length === 0 ? (
                /* Empty State */
                <View className="flex-1 items-center justify-center px-8">
                    <View className={`w-32 h-32 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Ionicons 
                            name="bookmarks-outline" 
                            size={64} 
                            color={isDark ? '#00D9A3' : '#00BF8F'} 
                        />
                    </View>
                    
                    <Text className={`text-2xl font-bold text-center ${textColor}`}>
                        Collection is Empty
                    </Text>
                    
                    <Text className={`text-base mt-3 text-center leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Start building your dream property collection! Tap the bookmark icon on any property to add it here.
                    </Text>
                    
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Search')}
                        className="mt-8 bg-primary px-8 py-4 rounded-full flex-row items-center"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="search" size={20} color="white" />
                        <Text className="text-white font-bold ml-2 text-base">
                            Browse Properties
                        </Text>
                    </TouchableOpacity>
                    
                    <View className={`mt-8 p-4 rounded-2xl flex-row items-start ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                        <Ionicons 
                            name="information-circle" 
                            size={24} 
                            color={isDark ? '#60A5FA' : '#3B82F6'} 
                            style={{ marginTop: 2 }}
                        />
                        <Text className={`ml-3 flex-1 text-sm leading-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Organize your favorite properties into collections for easy comparison and quick access
                        </Text>
                    </View>
                </View>
            ) : (
                /* Properties List */
                <FlatList
                    data={properties}
                    keyExtractor={(item) => `${item.id}-${item.property?.id}`}
                    renderItem={({ item }) => (
                        <PropertyCard
                            property={{
                                id: item.property?.id || item.propertyId,
                                title: item.property?.title || 'Property',
                                price: item.property?.price || 0,
                                location: `${item.property?.city || ''}, ${item.property?.state || ''}`,
                                bedrooms: item.property?.bedrooms || 0,
                                bathrooms: item.property?.bathrooms || 0,
                                area: item.property?.areaSqm || item.property?.area || 0,
                                image: item.property?.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                                type: item.property?.propertyType?.name?.toLowerCase() || 'house',
                                isFavorited: isFavorited(item.property?.id || item.propertyId),
                                isInCollection: true,
                                rating: item.property?.averageRating || 0,
                            }}
                            onPress={() => navigation.navigate('PropertyDetail', { 
                                propertyId: item.property?.id || item.propertyId 
                            })}
                            onFavoriteToggle={handleFavoriteToggle}
                            onAddToCollection={() => handleRemoveFromCollection(item.property?.id || item.propertyId)}
                            variant="default"
                            style={{
                                marginBottom: 16,
                                marginHorizontal: 24,
                            }}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ 
                        paddingBottom: 100,
                        paddingTop: 10,
                    }}
                />
            )}
        </View>
    );
}
