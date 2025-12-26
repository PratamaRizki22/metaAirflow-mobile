import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { StarRating, ReviewCard } from '../../components/review';
import { reviewService } from '../../services';
import { EmptyState } from '../../components/common';

export default function ReviewsListScreen({ route, navigation }: any) {
    const { propertyId, propertyTitle } = route.params;
    const { bgColor, textColor, cardBg } = useThemeColors();

    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    useEffect(() => {
        loadReviews();
        loadRating();
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewService.getPropertyReviews(propertyId, 1, 50);
            setReviews(response.data.reviews);
            setAverageRating(response.data.averageRating);
            setTotalReviews(response.data.totalReviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadRating = async () => {
        try {
            const response = await reviewService.getPropertyRating(propertyId);
            setRatingDistribution(response.data.ratingDistribution);
        } catch (error) {
            console.error('Error loading rating:', error);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadReviews();
        loadRating();
    };

    const getRatingPercentage = (count: number) => {
        if (totalReviews === 0) return 0;
        return Math.round((count / totalReviews) * 100);
    };

    if (loading) {
        return (
            <View className={`flex-1 ${bgColor} justify-center items-center`}>
                <ActivityIndicator size="large" color="#14B8A6" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View className="px-6 pt-16 pb-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mb-4"
                >
                    <Ionicons name="arrow-back" size={24} color={textColor === 'text-text-primary-dark' ? '#F1F5F9' : '#1E293B'} />
                </TouchableOpacity>
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Reviews
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    {propertyTitle}
                </Text>
            </View>

            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                ListHeaderComponent={
                    <View>
                        {/* Rating Summary */}
                        <View className={`${cardBg} p-6 rounded-2xl mb-4`}>
                            <View className="flex-row items-center mb-4">
                                <View className="items-center mr-8">
                                    <Text className={`text-5xl font-bold ${textColor}`}>
                                        {averageRating.toFixed(1)}
                                    </Text>
                                    <StarRating rating={averageRating} size={20} />
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                                        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                                    </Text>
                                </View>

                                {/* Rating Distribution */}
                                <View className="flex-1">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <View key={star} className="flex-row items-center mb-1">
                                            <Text className={`text-xs w-3 ${textColor}`}>{star}</Text>
                                            <Ionicons name="star" size={12} color="#FFB800" style={{ marginLeft: 4, marginRight: 8 }} />
                                            <View className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <View
                                                    style={{
                                                        width: `${getRatingPercentage(ratingDistribution[star as keyof typeof ratingDistribution])}%`,
                                                        backgroundColor: '#14B8A6',
                                                        height: '100%',
                                                    }}
                                                />
                                            </View>
                                            <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark ml-2 w-8 text-right">
                                                {ratingDistribution[star as keyof typeof ratingDistribution]}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Reviews Header */}
                        {reviews.length > 0 && (
                            <Text className={`text-lg font-bold mb-3 ${textColor}`}>
                                All Reviews ({totalReviews})
                            </Text>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <ReviewCard
                        rating={item.rating}
                        comment={item.comment}
                        userName={`${item.user.firstName} ${item.user.lastName}`}
                        date={item.createdAt}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState
                        icon="chatbubbles-outline"
                        title="No Reviews Yet"
                        message="Be the first to review this property"
                    />
                }
            />
        </View>
    );
}
