import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks';
import { useFavorites } from '../../contexts/FavoritesContext';
import { PropertyCard } from '../../components/property';
import { DEFAULT_IMAGES } from '../../constants/images';
import { propertyService } from '../../services';

export function TopRatedPropertiesScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { bgColor, textColor, secondaryTextColor } = useThemeColors();
    const { isFavorited, toggleFavorite } = useFavorites();

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadProperties = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await propertyService.getMobileProperties(pageNum, 20, {
                sortBy: 'rating', // Sort by rating for top rated
            });

            const newProperties = response.data.properties;
            const pagination = response.data.pagination;

            if (reset) {
                setProperties(newProperties);
            } else {
                setProperties(prev => [...prev, ...newProperties]);
            }

            // Robust pagination check using server metadata
            if (pagination) {
                setHasMore(pagination.page < pagination.totalPages);
            } else {
                // Fallback logic
                setHasMore(newProperties.length === 20);
            }
        } catch (error: any) {
            console.error('Load properties error:', error);
            setHasMore(false); // Stop pagination on error
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadProperties(1, true);
    }, []);

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
        await toggleFavorite(propertyId);
    };


    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="small" color="#0891b2" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="star-outline" size={64} color="#9CA3AF" />
                <Text className={`text-lg font-semibold ${textColor} mt-4`}>
                    Tidak Ada Properti
                </Text>
                <Text className={`${secondaryTextColor} mt-2 text-center px-6`}>
                    Belum ada properti dengan rating tinggi saat ini
                </Text>
            </View>
        );
    };

    return (
        <View className={`flex-1 ${bgColor}`} style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="mr-4 p-2 -ml-2"
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name="arrow-back" 
                        size={24} 
                        color={textColor === 'text-gray-900' ? '#111827' : '#FFF'} 
                    />
                </TouchableOpacity>
                <Text className={`text-xl font-bold ${textColor}`}>
                    Rekomendasi Terbaik
                </Text>
            </View>

            {/* Properties List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#0891b2" />
                </View>
            ) : (
                <FlatList
                    key={'grid-2'} // Unique key for grid layout 2 columns
                    data={properties}
                    renderItem={({ item, index }) => (
                        <Animated.View
                            entering={FadeInDown.delay(index * 50).springify()}
                            style={{
                                width: (require('react-native').Dimensions.get('window').width - 48 - 16) / 2, // Calculated width: (Screen - Padding - Gap) / 2
                                marginBottom: 16
                            }}
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
                                    isFeatured: item.isFeatured || false,
                                    isFavorited: isFavorited(item.id),
                                    rating: item.averageRating,
                                }}
                                variant="compact"
                                style={{ width: '100%' }}
                                onPress={() => handlePropertyPress(item.id)}
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        </Animated.View>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}
                    columnWrapperStyle={{ gap: 16 }} // Increased gap for better spacing
                    numColumns={2} // 2 Columns
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#0891b2"
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
