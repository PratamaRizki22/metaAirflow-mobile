import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { PropertyCard } from '../../components/property/PropertyCard';
import { DEFAULT_IMAGES } from '../../constants/images';

export function AllWishlistScreen({ navigation, route }: any) {
    const { isDark } = useTheme();
    const { toggleFavorite, isFavorited } = useFavorites();
    const { favorites = [] } = route.params || {};

    const handleFavoriteToggle = async (propertyId: string) => {
        try {
            await toggleFavorite(propertyId);
        } catch (error: any) {
            console.error('Toggle favorite error:', error);
        }
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
                
                <Text className={`text-xl font-['VisbyRound-Bold'] ml-4 ${textColor}`}>
                    All Wishlist ({favorites.length})
                </Text>
            </View>

            {/* Properties List */}
            <FlatList
                data={favorites}
                keyExtractor={(item) => `${item.id}-${isFavorited(item.property?.id)}`}
                renderItem={({ item }) => (
                    <PropertyCard
                        property={{
                            id: item.property?.id || item.id,
                            title: item.property?.title || 'Property',
                            price: item.property?.price || 0,
                            location: `${item.property?.city || ''}, ${item.property?.state || ''}`,
                            bedrooms: item.property?.bedrooms || 0,
                            bathrooms: item.property?.bathrooms || 0,
                            area: item.property?.areaSqm || item.property?.area || 0,
                            image: item.property?.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                            type: item.property?.propertyType?.name || 'Property',
                            isFavorited: isFavorited(item.property?.id || item.id),
                            rating: item.property?.averageRating || 0,
                        }}
                        onPress={() => navigation.navigate('PropertyDetail', { 
                            propertyId: item.property?.id || item.id 
                        })}
                        onFavoriteToggle={handleFavoriteToggle}
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
        </View>
    );
}
