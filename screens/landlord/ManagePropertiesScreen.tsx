import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { propertyService, reviewService } from '../../services';
import { useThemeColors } from '../../hooks';
import { LoadingState, EmptyState, useCustomAlert, Button, Text, TabBarBottomSpacer } from '../../components/common';
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
        const statusConfig: Record<string, { bg: string; text: string; color: string }> = {
            'ACTIVE': { bg: '#10B981', text: 'Active', color: '#ECFDF5' },
            'PENDING_REVIEW': { bg: '#F59E0B', text: 'Pending', color: '#FFFBEB' },
            'INACTIVE': { bg: '#6B7280', text: 'Inactive', color: '#F3F4F6' },
            'REJECTED': { bg: '#EF4444', text: 'Rejected', color: '#FEF2F2' },
        };

        const config = statusConfig[status] || { bg: '#6B7280', text: status, color: '#F3F4F6' };

        return (
            <View style={{ backgroundColor: config.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>{config.text}</Text>
            </View>
        );
    };

    // Enhanced Property Card Component with Image
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
            <View
                className={`${cardBg} rounded-2xl p-4 mb-4 border ${borderColor}`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                {/* Title & Status */}
                <View className="flex-row justify-between items-start mb-3">
                    <Text
                        className={`text-lg flex-1 mr-2 ${textColor}`}
                        style={{ fontFamily: 'VisbyRound-Bold' }}
                    >
                        {item.title}
                    </Text>
                    {getStatusBadge(item.status)}
                </View>

                {/* Location */}
                <View className="flex-row items-center mb-3">
                    <Ionicons name="location" size={16} color="#EF4444" />
                    <Text className={`ml-1 text-sm ${secondaryTextColor}`}>
                        {item.city}, {item.state}
                    </Text>
                </View>

                {/* Price */}
                <View className="bg-primary/10 px-4 py-3 rounded-xl mb-3">
                    <Text className={`text-xs ${secondaryTextColor} mb-1`}>Monthly Rent</Text>
                    <Text
                        className="text-primary text-2xl"
                        style={{ fontFamily: 'VisbyRound-Bold' }}
                    >
                        RM {item.price.toLocaleString()}
                    </Text>
                </View>

                {/* Property Info */}
                <View className="flex-row mb-4">
                    <View className="flex-1 items-center">
                        <Ionicons name="bed-outline" size={20} color="#00D9A3" />
                        <Text className={`mt-1 text-sm font-semibold ${textColor}`}>{item.bedrooms}</Text>
                        <Text className={`text-xs ${secondaryTextColor}`}>Beds</Text>
                    </View>
                    <View className="flex-1 items-center">
                        <Ionicons name="water-outline" size={20} color="#10B981" />
                        <Text className={`mt-1 text-sm font-semibold ${textColor}`}>{item.bathrooms}</Text>
                        <Text className={`text-xs ${secondaryTextColor}`}>Baths</Text>
                    </View>
                    <View className="flex-1 items-center">
                        <Ionicons name="resize-outline" size={20} color="#F59E0B" />
                        <Text className={`mt-1 text-sm font-semibold ${textColor}`}>{item.areaSqm}</Text>
                        <Text className={`text-xs ${secondaryTextColor}`}>m²</Text>
                    </View>
                </View>

                {/* Reviews Info */}
                {!loadingRating && rating && rating.totalReviews > 0 && (
                    <View className="flex-row items-center justify-between mb-3 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        <View className="flex-row items-center">
                            <Ionicons name="star" size={16} color="#F59E0B" />
                            <Text className={`ml-1 text-sm font-semibold ${textColor}`}>
                                {rating.averageRating.toFixed(1)}
                            </Text>
                            <Text className={`ml-1 text-xs ${secondaryTextColor}`}>
                                ({rating.totalReviews} reviews)
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id, scrollToReviews: true })}
                            className="flex-row items-center"
                        >
                            <Text className="text-primary text-xs font-semibold mr-1">View Reviews</Text>
                            <Ionicons name="chevron-forward" size={14} color="#00D9A3" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                    <Button
                        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                    >
                        View
                    </Button>

                    <Button
                        onPress={() => navigation.navigate('EditProperty', { propertyId: item.id })}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                    >
                        Edit
                    </Button>

                    <TouchableOpacity
                        onPress={() => handleDeleteProperty(item.id, item.title)}
                        className="bg-error-light/10 border border-error-light/30 px-4 py-3 rounded-xl"
                    >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return <LoadingState message="Loading your properties..." />;
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView className="flex-1">
                <View className="px-6 pt-16 pb-6">
                    {/* Header */}
                    <Text
                        className={`text-3xl mb-2 ${textColor}`}
                        style={{ fontFamily: 'VisbyRound-Bold' }}
                    >
                        My Properties
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                        Manage your rental listings
                    </Text>
                </View>


                {loading ? (
                    <LoadingState message="Loading your properties..." />
                ) : properties.length === 0 ? (
                    <View style={{ height: Dimensions.get('window').height - 300, justifyContent: 'center' }}>
                        <EmptyState
                            icon="home-outline"
                            title="No Properties Yet"
                            message="Start by adding your first property to rent out"
                            actionLabel="Add Your First Property"
                            onAction={() => navigation.navigate('CreateProperty')}
                        />
                    </View>
                ) : (
                    <View className="px-6">
                        {properties.map((item, index) => (
                            <PropertyCardWithRating key={item.id} item={item} index={index} />
                        ))}
                    </View>
                )}

                {/* Bottom padding for tab bar */}
                <TabBarBottomSpacer />
            </ScrollView>

            {/* Custom Alert */}
            <AlertComponent />
        </View>
    );
}
