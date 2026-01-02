import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { userService, LandlordProperty } from '../../services';
import { useThemeColors } from '../../hooks';
import { LoadingState, ErrorState } from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');

export default function LandlordPropertiesScreen({ route, navigation }: any) {
    const { landlordId, landlordName } = route.params;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<LandlordProperty[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const {
        bgColor,
        cardBg,
        textColor,
        secondaryTextColor,
        borderColor,
        isDark,
    } = useThemeColors();

    useEffect(() => {
        loadProperties();
    }, [landlordId]);

    const loadProperties = async (pageNum: number = 1) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await userService.getLandlordProperties(landlordId, pageNum, 20);

            if (pageNum === 1) {
                setProperties(response.data.properties);
            } else {
                setProperties(prev => [...prev, ...response.data.properties]);
            }

            const { page: currentPage, totalPages } = response.data.pagination;
            setHasMore(currentPage < totalPages);
            setPage(currentPage);

        } catch (error: any) {
            console.error('Load properties error:', error);
            Alert.alert('Error', error.message || 'Failed to load properties');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadProperties(page + 1);
        }
    };

    const handlePropertyPress = (propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    };

    const renderPropertyCard = ({ item }: { item: LandlordProperty }) => (
        <Animated.View
            entering={FadeInDown}
            style={{ marginBottom: 16 }}
        >
            <TouchableOpacity
                onPress={() => handlePropertyPress(item.id)}
                className={`${cardBg} rounded-2xl overflow-hidden`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                }}
            >
                <Image
                    source={{ uri: item.images[0] || 'https://via.placeholder.com/400x250' }}
                    style={{ width: '100%', height: 200 }}
                    resizeMode="cover"
                />
                <View className="p-4">
                    <Text className={`text-lg font-bold ${textColor} mb-2`} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                        <Text className={`ml-1 text-sm ${secondaryTextColor}`} numberOfLines={1}>
                            {item.city}, {item.state}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-primary text-lg font-bold">
                            RM {item.price.toLocaleString()}
                        </Text>
                        {item.averageRating && (
                            <View className="flex-row items-center">
                                <Ionicons name="star" size={16} color="#FBBF24" />
                                <Text className={`ml-1 text-sm font-semibold ${textColor}`}>
                                    {item.averageRating.toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="large" color="#10A0F7" />
            </View>
        );
    };

    const renderEmpty = () => (
        <View className={`${cardBg} p-8 rounded-2xl items-center mx-6 mt-6`}>
            <Ionicons name="home-outline" size={64} color="#9CA3AF" />
            <Text className={`text-lg ${textColor} font-semibold mt-4 mb-2`}>
                No Properties Found
            </Text>
            <Text className={`text-sm ${secondaryTextColor} text-center`}>
                This agent doesn't have any active listings at the moment.
            </Text>
        </View>
    );

    if (loading) {
        return <LoadingState message="Loading properties..." />;
    }

    return (
        <View className={`flex-1 ${bgColor}`} style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-6 py-4 border-b" style={{ borderColor: borderColor }}>
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-3"
                    >
                        <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#000'} />
                    </TouchableOpacity>
                    <Text className={`text-2xl font-bold ${textColor} flex-1`} numberOfLines={1}>
                        {landlordName}'s Properties
                    </Text>
                </View>
                <Text className={`text-sm ${secondaryTextColor} ml-9`}>
                    {properties.length} {properties.length === 1 ? 'property' : 'properties'} available
                </Text>
            </View>

            {/* Properties List */}
            <FlatList
                data={properties}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
