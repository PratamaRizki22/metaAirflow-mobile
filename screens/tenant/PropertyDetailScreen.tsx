import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    TextInput,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { propertyService, favoriteService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors } from '../../hooks';
import { LoadingState, ErrorState } from '../../components/common';

export default function PropertyDetailScreen({ route, navigation }: any) {
    const { propertyId } = route.params;
    const { isLoggedIn } = useAuth();

    const [property, setProperty] = useState<any>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    const {
        bgColor,
        cardBg,
        textColor,
        secondaryTextColor,
        borderColor,
        isDark
    } = useThemeColors();

    useEffect(() => {
        loadPropertyDetail();
    }, [propertyId]);

    const loadPropertyDetail = async () => {
        try {
            setLoading(true);

            // Load property detail
            const response = await propertyService.getPropertyById(propertyId);
            setProperty(response.data);

            // Check if favorited (only if logged in)
            if (isLoggedIn) {
                const favStatus = await favoriteService.isFavorited(propertyId);
                setIsFavorited(favStatus);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load property details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isLoggedIn) {
            Alert.alert(
                'Login Required',
                'Please login to save favorites',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') },
                ]
            );
            return;
        }

        try {
            const result = await favoriteService.toggleFavorite(propertyId);
            setIsFavorited(result.isFavorited);
            Alert.alert('Success', result.message);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleBookNow = () => {
        if (!isLoggedIn) {
            Alert.alert(
                'Login Required',
                'Please login to book this property',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') },
                ]
            );
            return;
        }

        navigation.navigate('CreateBooking', {
            propertyId: property.id,
            propertyTitle: property.title,
            price: property.price,
        });
    };

    const handleRateProperty = () => {
        if (!isLoggedIn) {
            Alert.alert(
                'Login Required',
                'Please login to rate this property',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') },
                ]
            );
            return;
        }
        setShowRatingModal(true);
    };

    const handleSubmitRating = async () => {
        if (rating < 1 || rating > 5) {
            Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5');
            return;
        }

        try {
            setSubmittingRating(true);
            await propertyService.rateProperty(propertyId, rating, review || undefined);
            Alert.alert('Success', 'Thank you for your rating!');
            setShowRatingModal(false);
            setRating(5);
            setReview('');
            loadPropertyDetail(); // Reload to show updated rating
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmittingRating(false);
        }
    };

    // Loading State
    if (loading) {
        return <LoadingState message="Loading property details..." />;
    }

    // Error State
    if (!property) {
        return (
            <ErrorState
                title="Property Not Found"
                message="The property you're looking for doesn't exist or has been removed."
                actionLabel="Go Back"
                onAction={() => navigation.goBack()}
            />
        );
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeIn} className="p-6">
                    {/* Title & Location */}
                    <View className="mb-6">
                        <Text className={`text-3xl font-bold mb-3 ${textColor}`}>
                            {property.title}
                        </Text>

                        {/* Rating Display */}
                        {property.averageRating && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="star" size={20} color="#FBBF24" />
                                <Text className="text-lg font-bold text-yellow-500 ml-1">
                                    {property.averageRating.toFixed(1)}
                                </Text>
                                <Text className={`ml-2 ${secondaryTextColor}`}>
                                    ({property._count?.ratings || 0} reviews)
                                </Text>
                            </View>
                        )}

                        {/* Location */}
                        <View className="flex-row items-center">
                            <Ionicons name="location" size={18} color="#14B8A6" />
                            <Text className={`ml-2 text-base ${secondaryTextColor}`}>
                                {property.address}, {property.city}, {property.state}
                            </Text>
                        </View>
                    </View>

                    {/* Price */}
                    <Animated.View
                        entering={FadeInDown.delay(100)}
                        className={`${cardBg} p-5 rounded-2xl mb-6 border ${borderColor}`}
                    >
                        <Text className={`text-sm mb-1 ${secondaryTextColor}`}>Price per month</Text>
                        <Text className="text-3xl font-bold text-primary">
                            MYR {property.price.toLocaleString()}
                        </Text>
                    </Animated.View>

                    {/* Property Info Cards */}
                    <Animated.View
                        entering={FadeInDown.delay(200)}
                        className="flex-row gap-3 mb-6"
                    >
                        <View className={`flex-1 ${cardBg} p-4 rounded-xl items-center border ${borderColor}`}>
                            <Ionicons name="bed" size={24} color="#14B8A6" />
                            <Text className={`text-xl font-bold mt-2 ${textColor}`}>
                                {property.bedrooms}
                            </Text>
                            <Text className={`text-sm ${secondaryTextColor}`}>Bedrooms</Text>
                        </View>
                        <View className={`flex-1 ${cardBg} p-4 rounded-xl items-center border ${borderColor}`}>
                            <Ionicons name="water" size={24} color="#14B8A6" />
                            <Text className={`text-xl font-bold mt-2 ${textColor}`}>
                                {property.bathrooms}
                            </Text>
                            <Text className={`text-sm ${secondaryTextColor}`}>Bathrooms</Text>
                        </View>
                        <View className={`flex-1 ${cardBg} p-4 rounded-xl items-center border ${borderColor}`}>
                            <Ionicons name="resize" size={24} color="#14B8A6" />
                            <Text className={`text-xl font-bold mt-2 ${textColor}`}>
                                {property.areaSqm}
                            </Text>
                            <Text className={`text-sm ${secondaryTextColor}`}>m²</Text>
                        </View>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View entering={FadeInDown.delay(300)} className="mb-6">
                        <Text className={`text-xl font-bold mb-3 ${textColor}`}>Description</Text>
                        <Text className={`text-base leading-6 ${secondaryTextColor}`}>
                            {property.description}
                        </Text>
                    </Animated.View>

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(400)} className="mb-6">
                            <Text className={`text-xl font-bold mb-3 ${textColor}`}>Amenities</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {property.amenities.map((amenity: any) => (
                                    <View
                                        key={amenity.id}
                                        className={`${cardBg} px-4 py-2 rounded-full border ${borderColor}`}
                                    >
                                        <Text className={`${textColor}`}>• {amenity.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>
                    )}

                    {/* Owner Info */}
                    {property.owner && (
                        <Animated.View
                            entering={FadeInDown.delay(500)}
                            className={`${cardBg} p-5 rounded-2xl mb-6 border ${borderColor}`}
                        >
                            <Text className={`text-xl font-bold mb-3 ${textColor}`}>Property Owner</Text>
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                                    <Text className="text-white text-xl font-bold">
                                        {property.owner.firstName?.[0]}{property.owner.lastName?.[0]}
                                    </Text>
                                </View>
                                <View className="ml-3">
                                    <Text className={`text-lg font-semibold ${textColor}`}>
                                        {property.owner.firstName} {property.owner.lastName}
                                    </Text>
                                    <Text className={`${secondaryTextColor}`}>Property Owner</Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}

                    {/* Reviews Section */}
                    {property.ratings && property.ratings.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(600)} className="mb-6">
                            <Text className={`text-xl font-bold mb-3 ${textColor}`}>Recent Reviews</Text>
                            {property.ratings.slice(0, 3).map((ratingItem: any) => (
                                <View
                                    key={ratingItem.id}
                                    className={`${cardBg} p-4 rounded-xl mb-3 border ${borderColor}`}
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className={`font-bold ${textColor}`}>
                                            {ratingItem.user?.firstName} {ratingItem.user?.lastName}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="star" size={16} color="#FBBF24" />
                                            <Text className="text-yellow-500 font-bold ml-1">
                                                {ratingItem.rating}
                                            </Text>
                                        </View>
                                    </View>
                                    {ratingItem.review && (
                                        <Text className={`${secondaryTextColor}`}>{ratingItem.review}</Text>
                                    )}
                                </View>
                            ))}
                        </Animated.View>
                    )}
                </Animated.View>

                {/* Bottom Padding */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Fixed Bottom Action Buttons */}
            <View
                className={`absolute bottom-0 left-0 right-0 ${cardBg} px-6 py-4 border-t ${borderColor}`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 10,
                }}
            >
                <View className="flex-row gap-3">
                    {/* Favorite Button */}
                    <TouchableOpacity
                        onPress={handleToggleFavorite}
                        className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${isFavorited ? 'border-red-500 bg-red-500/10' : `border-gray-300 ${cardBg}`
                            }`}
                    >
                        <Ionicons
                            name={isFavorited ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isFavorited ? '#EF4444' : '#9CA3AF'}
                        />
                    </TouchableOpacity>

                    {/* Rate Button */}
                    <TouchableOpacity
                        onPress={handleRateProperty}
                        className={`w-14 h-14 rounded-2xl items-center justify-center border-2 border-yellow-500 bg-yellow-500/10`}
                    >
                        <Ionicons name="star" size={24} color="#FBBF24" />
                    </TouchableOpacity>

                    {/* Book Now Button */}
                    <TouchableOpacity
                        onPress={handleBookNow}
                        className="flex-1"
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#14B8A6', '#0D9488']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-14 rounded-2xl items-center justify-center"
                        >
                            <Text className="text-white text-lg font-bold">Book Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Rating Modal */}
            <Modal
                visible={showRatingModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRatingModal(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center"
                    onPress={() => setShowRatingModal(false)}
                >
                    <Pressable
                        className={`${cardBg} rounded-3xl w-11/12 max-w-md`}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="p-6">
                            {/* Modal Header */}
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className={`text-2xl font-bold ${textColor}`}>
                                    Rate This Property
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowRatingModal(false)}
                                    className="w-8 h-8 items-center justify-center"
                                >
                                    <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                                </TouchableOpacity>
                            </View>

                            {/* Star Rating Selector */}
                            <Text className={`text-base mb-3 ${textColor}`}>Your Rating:</Text>
                            <View className="flex-row justify-center mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        className="mx-1"
                                    >
                                        <Ionicons
                                            name={star <= rating ? 'star' : 'star-outline'}
                                            size={40}
                                            color={star <= rating ? '#FBBF24' : '#D1D5DB'}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Review Text */}
                            <Text className={`text-base mb-3 ${textColor}`}>Review (Optional):</Text>
                            <TextInput
                                value={review}
                                onChangeText={setReview}
                                placeholder="Share your experience..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                className={`${cardBg} border ${borderColor} rounded-xl p-4 mb-6 ${textColor}`}
                                style={{ textAlignVertical: 'top' }}
                            />

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSubmitRating}
                                disabled={submittingRating}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#14B8A6', '#0D9488']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="py-4 rounded-xl items-center"
                                >
                                    <Text className="text-white text-lg font-bold">
                                        {submittingRating ? 'Submitting...' : 'Submit Rating'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
