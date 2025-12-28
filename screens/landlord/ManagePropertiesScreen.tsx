import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { propertyService, reviewService } from '../../services';
import { useThemeColors } from '../../hooks';
import { LoadingState, EmptyState, useCustomAlert } from '../../components/common';
import { StarRating } from '../../components/review';

export default function ManagePropertiesScreen({ navigation }: any) {
    const { bgColor, cardBg, textColor, secondaryTextColor, borderColor } = useThemeColors();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showAlert, AlertComponent } = useCustomAlert();

    useFocusEffect(
        useCallback(() => {
            loadProperties();
        }, [])
    );

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getMyProperties(1, 50);
            setProperties(response.data.properties);
        } catch (error: any) {
            showAlert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadProperties();
        setRefreshing(false);
    };

    const handleDeleteProperty = (propertyId: string, title: string) => {
        showAlert(
            'Delete Property',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await propertyService.deleteProperty(propertyId);
                            showAlert('Success', 'Property deleted');
                            loadProperties();
                        } catch (error: any) {
                            showAlert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string }> = {
            'ACTIVE': { bg: 'bg-green-500', text: 'Active' },
            'PENDING_REVIEW': { bg: 'bg-yellow-500', text: 'Pending' },
            'INACTIVE': { bg: 'bg-gray-500', text: 'Inactive' },
            'REJECTED': { bg: 'bg-red-500', text: 'Rejected' },
        };

        const config = statusConfig[status] || { bg: 'bg-gray-500', text: status };

        return (
            <View className={`${config.bg} px-2 py-1 rounded`}>
                <Text className="text-white text-xs font-bold">{config.text}</Text>
            </View>
        );
    };

    // Property Card Component with Rating
    const PropertyCardWithRating = ({ item, index }: any) => {
        const [rating, setRating] = useState<any>(null);
        const [loadingRating, setLoadingRating] = useState(true);

        useEffect(() => {
            loadRating();
        }, []);

        const loadRating = async () => {
            try {
                const result = await reviewService.getPropertyRating(item.id);
                setRating(result.data);
            } catch (error) {
                console.log('No rating for property:', item.id);
            } finally {
                setLoadingRating(false);
            }
        };

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100)}
                className={`${cardBg} p-4 rounded-2xl mb-3 border ${borderColor}`}
            >
                {/* Title & Status */}
                <View className="flex-row justify-between items-start mb-2">
                    <Text className={`text-lg font-bold flex-1 mr-2 ${textColor}`}>
                        {item.title}
                    </Text>
                    {getStatusBadge(item.status)}
                </View>

                {/* Rating */}
                {!loadingRating && rating && rating.totalReviews > 0 && (
                    <View className="flex-row items-center mb-2">
                        <StarRating rating={rating.averageRating} size={14} />
                        <Text className={`ml-2 text-sm ${secondaryTextColor}`}>
                            {rating.averageRating.toFixed(1)} ({rating.totalReviews} {rating.totalReviews === 1 ? 'review' : 'reviews'})
                        </Text>
                    </View>
                )}

                {/* Location */}
                <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                    <Text className={`ml-1 ${secondaryTextColor}`}>
                        {item.city}, {item.state}
                    </Text>
                </View>

                {/* Price */}
                <Text className="text-xl font-bold text-primary mb-2">
                    MYR {item.price.toLocaleString()}/month
                </Text>

                {/* Property Info */}
                <View className="flex-row items-center mb-4">
                    <View className="flex-row items-center mr-4">
                        <Ionicons name="bed-outline" size={16} color="#9CA3AF" />
                        <Text className={`ml-1 ${secondaryTextColor}`}>{item.bedrooms}</Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                        <Ionicons name="water-outline" size={16} color="#9CA3AF" />
                        <Text className={`ml-1 ${secondaryTextColor}`}>{item.bathrooms}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="resize-outline" size={16} color="#9CA3AF" />
                        <Text className={`ml-1 ${secondaryTextColor}`}>{item.areaSqm} m²</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
                        className="flex-1 bg-blue-500 py-3 rounded-xl"
                    >
                        <Text className="text-white text-center font-semibold">View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('EditProperty', { propertyId: item.id })}
                        className="flex-1 bg-green-500 py-3 rounded-xl"
                    >
                        <Text className="text-white text-center font-semibold">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleDeleteProperty(item.id, item.title)}
                        className="flex-1 bg-red-500 py-3 rounded-xl"
                    >
                        <Text className="text-white text-center font-semibold">Delete</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    if (loading) {
        return <LoadingState message="Loading your properties..." />;
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <FlatList
                data={properties}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListHeaderComponent={
                    <View className="px-6 pt-16 pb-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className={`text-3xl font-bold ${textColor}`}>
                                My Properties
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('CreateProperty')}
                                className="bg-primary px-4 py-2 rounded-xl flex-row items-center"
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text className="text-white font-semibold ml-1">Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <View className="px-6 mb-3">
                        <PropertyCardWithRating item={item} index={index} />
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ height: Dimensions.get('window').height - 200, justifyContent: 'center' }}>
                        <EmptyState
                            icon="home-outline"
                            title="No Properties Yet"
                            message="Start by adding your first property to rent out"
                            actionLabel="Add Your First Property"
                            onAction={() => navigation.navigate('CreateProperty')}
                        />
                    </View>
                }
            />

            {/* Custom Alert */}
            <AlertComponent />
        </View>
    );
}
