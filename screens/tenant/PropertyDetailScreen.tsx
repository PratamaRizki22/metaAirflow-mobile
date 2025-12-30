import React, { useState, useEffect, useRef } from 'react';
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
    Image,
    FlatList,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAPTILER_API_KEY } from '@env';
import { propertyService, favoriteService, bookingService, reviewService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors } from '../../hooks';
import { LoadingState, ErrorState, Button } from '../../components/common';

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [hasCompletedBooking, setHasCompletedBooking] = useState(false);
    const [propertyRating, setPropertyRating] = useState<any>(null);

    const flatListRef = useRef<FlatList>(null);
    const { width: screenWidth } = Dimensions.get('window');
    const insets = useSafeAreaInsets();

    // Configure MapLibre
    MapLibreGL.setAccessToken(null);

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
            console.log('Property images:', response.data?.images);
            console.log('Images count:', response.data?.images?.length || 0);
            setProperty(response.data);

            // Check if favorited (only if logged in and propertyId is valid)
            if (isLoggedIn && propertyId && typeof propertyId === 'string') {
                try {
                    const favStatus = await favoriteService.isFavorited(propertyId);
                    setIsFavorited(favStatus);
                } catch (favError) {
                    // Silently fail - favorite status is not critical
                    console.log('Failed to check favorite status:', favError);
                }

                // Check if user has completed booking
                try {
                    const bookingsResponse = await bookingService.getBookings(1, 100, 'COMPLETED');
                    const hasBooking = bookingsResponse.data.bookings.some(
                        (booking: any) => booking.property?.id === propertyId
                    );
                    setHasCompletedBooking(hasBooking);
                } catch (bookingError) {
                    // Silently fail
                    console.log('Failed to check booking history:', bookingError);
                    setHasCompletedBooking(false);
                }
            }

            // Load property rating
            try {
                const ratingData = await reviewService.getPropertyRating(propertyId);
                console.log('Property rating data:', ratingData);
                if (ratingData.success && ratingData.data) {
                    setPropertyRating(ratingData.data);
                }
            } catch (ratingError) {
                console.log('Failed to load rating:', ratingError);
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

        if (!property || !property.id) {
            Alert.alert('Error', 'Property information is not available');
            return;
        }

        navigation.navigate('CreateBooking', {
            propertyId: property.id,
            propertyTitle: property.title || 'Property',
            price: property.price || 0,
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

        if (!hasCompletedBooking) {
            Alert.alert(
                'Booking Required',
                'You can only rate properties you have stayed at. Please complete a booking first.',
                [{ text: 'OK' }]
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
                {/* Image Gallery */}
                {property.images && property.images.length > 0 ? (
                    <View className="relative">
                        <FlatList
                            ref={flatListRef}
                            data={property.images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(event) => {
                                const index = Math.round(
                                    event.nativeEvent.contentOffset.x / screenWidth
                                );
                                setCurrentImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                            renderItem={({ item }) => {
                                console.log('Rendering image:', item);
                                return (
                                    <Image
                                        source={{ uri: item }}
                                        style={{ width: screenWidth, height: 300 }}
                                        resizeMode="cover"
                                        onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
                                        onLoad={() => console.log('Image loaded successfully:', item)}
                                    />
                                );
                            }}
                            keyExtractor={(item, index) => `image-${index}`}
                        />

                        {/* Image Counter */}
                        <View className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded-full">
                            <Text className="text-white text-sm font-semibold">
                                {currentImageIndex + 1} / {property.images.length}
                            </Text>
                        </View>

                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="absolute top-4 left-4 w-10 h-10 bg-black/60 rounded-full items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        {/* Pagination Dots */}
                        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                            {property.images.map((_: any, index: number) => (
                                <View
                                    key={`dot-${index}`}
                                    className={`h-2 rounded-full ${index === currentImageIndex
                                        ? 'w-6 bg-white'
                                        : 'w-2 bg-white/50'
                                        }`}
                                />
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="relative">
                        <View
                            style={{ width: screenWidth, height: 300 }}
                            className="bg-gray-300 dark:bg-gray-700 justify-center items-center"
                        >
                            <Ionicons name="image-outline" size={80} color="#9CA3AF" />
                            <Text className="text-gray-500 dark:text-gray-400 mt-4">No images available</Text>
                        </View>

                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="absolute top-4 left-4 w-10 h-10 bg-black/60 rounded-full items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                )}

                <Animated.View entering={FadeIn} className="p-6">
                    {/* Title & Location */}
                    <View className="mb-6">
                        <Text className={`text-3xl font-bold mb-3 ${textColor}`}>
                            {property.title || 'Property Details'}
                        </Text>

                        {/* Rating Display */}
                        {(() => {
                            // Priority: propertyRating from reviewService > property.averageRating > calculate from ratings array
                            const avgRating = propertyRating?.averageRating ||
                                property.averageRating ||
                                (property.ratings && property.ratings.length > 0
                                    ? property.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / property.ratings.length
                                    : null);
                            const reviewCount = propertyRating?.totalReviews ||
                                property._count?.ratings ||
                                property.ratings?.length ||
                                0;

                            if (avgRating && reviewCount > 0) {
                                return (
                                    <View className="flex-row items-center mb-3">
                                        <Ionicons name="star" size={20} color="#FBBF24" />
                                        <Text className="text-lg font-bold text-yellow-500 ml-1">
                                            {avgRating.toFixed(1)}
                                        </Text>
                                        <Text className={`ml-2 ${secondaryTextColor}`}>
                                            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                                        </Text>
                                    </View>
                                );
                            }
                            return null;
                        })()}

                        {/* Location */}
                        <View className="flex-row items-center">
                            <Ionicons name="location" size={18} color="#00D9A3" />
                            <Text className={`ml-2 text-base ${secondaryTextColor}`}>
                                {[property.address, property.city, property.state].filter(Boolean).join(', ') || 'Location not available'}
                            </Text>
                        </View>
                    </View>

                    {/* Map Location */}
                    {property.latitude && property.longitude && (
                        <Animated.View
                            entering={FadeInDown.delay(200)}
                            className={`${cardBg} p-5 rounded-2xl mb-6 border ${borderColor}`}
                        >
                            <Text className={`text-lg font-bold mb-3 ${textColor}`}>Location</Text>
                            <View className="h-48 rounded-xl overflow-hidden">
                                <MapLibreGL.MapView
                                    style={{ flex: 1 }}
                                >
                                    <MapLibreGL.RasterSource
                                        id="maptiler-source"
                                        tileUrlTemplates={[`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY || 'CNmR4fJvRK89a2UaoY91'}`]}
                                        tileSize={256}
                                    >
                                        <MapLibreGL.RasterLayer id="maptiler-layer" sourceID="maptiler-source" />
                                    </MapLibreGL.RasterSource>
                                    <MapLibreGL.Camera
                                        centerCoordinate={[property.longitude, property.latitude]}
                                        zoomLevel={15}
                                    />
                                    <MapLibreGL.PointAnnotation
                                        id="property-location"
                                        coordinate={[property.longitude, property.latitude]}
                                    >
                                        <View className="bg-primary w-6 h-6 rounded-full border-2 border-white" />
                                    </MapLibreGL.PointAnnotation>
                                </MapLibreGL.MapView>
                            </View>
                        </Animated.View>
                    )}

                    {/* Price */}
                    <Animated.View
                        entering={FadeInDown.delay(100)}
                        className={`${cardBg} p-5 rounded-2xl mb-6 border ${borderColor}`}
                    >
                        <Text className={`text-sm ${secondaryTextColor} mb-2`}>Price per month</Text>
                        <Text className="text-3xl font-bold text-primary">
                            RM {property.price?.toLocaleString() || '0'}
                        </Text>
                    </Animated.View>

                    {/* Property Info Cards */}
                    <Animated.View
                        entering={FadeInDown.delay(200)}
                        className="flex-row gap-3 mb-6"
                    >
                        <View className={`flex-1 ${cardBg} p-4 rounded-xl items-center border ${borderColor}`}>
                            <Ionicons name="bed" size={24} color="#00D9A3" />
                            <Text className={`text-xl font-bold mt-2 ${textColor}`}>
                                {property.bedrooms || 0}
                            </Text>
                            <Text className={`text-sm ${secondaryTextColor}`}>Bedrooms</Text>
                        </View>
                        <View className={`flex-1 ${cardBg} p-4 rounded-xl items-center border ${borderColor}`}>
                            <Ionicons name="water" size={24} color="#00D9A3" />
                            <Text className={`text-xl font-bold mt-2 ${textColor}`}>
                                {property.bathrooms || 0}
                            </Text>
                            <Text className={`text-sm ${secondaryTextColor}`}>Bathrooms</Text>
                        </View>
                        <View className={`flex-1 ${cardBg} p-4 rounded-xl items-center border ${borderColor}`}>
                            <Ionicons name="resize" size={24} color="#00D9A3" />
                            <Text className={`text-xl font-bold mt-2 ${textColor}`}>
                                {property.areaSqm || 0}
                            </Text>
                            <Text className={`text-sm ${secondaryTextColor}`}>m²</Text>
                        </View>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View entering={FadeInDown.delay(300)} className="mb-6">
                        <Text className={`text-xl font-bold mb-3 ${textColor}`}>Description</Text>
                        <Text className={`text-base leading-6 ${secondaryTextColor}`}>
                            {property.description || 'No description available'}
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


                    {/* Reviews Section - Always Visible */}
                    <Animated.View entering={FadeInDown.delay(600)} className="mb-6">
                        <Text className={`text-xl font-bold mb-4 ${textColor}`}>Reviews</Text>

                        {/* Review Form */}
                        {isLoggedIn && hasCompletedBooking && (
                            <View className={`${cardBg} p-4 rounded-xl mb-4 border ${borderColor}`}>
                                <Text className={`text-base font-semibold mb-3 ${textColor}`}>Write a Review</Text>

                                {/* Star Rating Selector */}
                                <View className="flex-row items-center mb-3">
                                    <Text className={`text-sm mr-3 ${secondaryTextColor}`}>Rating:</Text>
                                    <View className="flex-row">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => setRating(star)}
                                                className="mx-1"
                                            >
                                                <Ionicons
                                                    name={star <= rating ? 'star' : 'star-outline'}
                                                    size={28}
                                                    color={star <= rating ? '#FBBF24' : '#D1D5DB'}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Review Text Input */}
                                <TextInput
                                    value={review}
                                    onChangeText={setReview}
                                    placeholder="Share your experience..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                    className={`${cardBg} border ${borderColor} rounded-xl p-3 mb-3 ${textColor}`}
                                    style={{ textAlignVertical: 'top', minHeight: 80 }}
                                />

                                {/* Submit Button */}
                                <Button
                                    onPress={handleSubmitRating}
                                    variant="primary"
                                    loading={submittingRating}
                                    fullWidth
                                >
                                    Submit Review
                                </Button>
                            </View>
                        )}

                        {/* Login/Booking Required Message */}
                        {!isLoggedIn && (
                            <View className={`${cardBg} p-4 rounded-xl mb-4 border ${borderColor}`}>
                                <Text className={`text-sm ${secondaryTextColor} text-center`}>
                                    Please login to write a review
                                </Text>
                            </View>
                        )}

                        {isLoggedIn && !hasCompletedBooking && (
                            <View className={`${cardBg} p-4 rounded-xl mb-4 border ${borderColor}`}>
                                <Text className={`text-sm ${secondaryTextColor} text-center`}>
                                    You can only review properties you have stayed at
                                </Text>
                            </View>
                        )}

                        {/* Existing Reviews */}
                        {property.ratings && property.ratings.length > 0 ? (
                            <View>
                                <Text className={`text-base font-semibold mb-3 ${textColor}`}>
                                    {property.ratings.length} Review{property.ratings.length > 1 ? 's' : ''}
                                </Text>
                                {property.ratings.map((ratingItem: any) => (
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
                                        {ratingItem.comment && (
                                            <Text className={`${secondaryTextColor}`}>{ratingItem.comment}</Text>
                                        )}
                                        <Text className={`text-xs ${secondaryTextColor} mt-2`}>
                                            {new Date(ratingItem.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className={`${cardBg} p-6 rounded-xl items-center border ${borderColor}`}>
                                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                                <Text className={`text-base font-semibold mt-3 ${textColor}`}>
                                    No Reviews Yet
                                </Text>
                                <Text className={`text-sm ${secondaryTextColor} text-center mt-1`}>
                                    Be the first to review this property!
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                </Animated.View>

                {/* Bottom Padding */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Fixed Bottom Action Buttons */}
            <View
                className={`absolute bottom-0 left-0 right-0 ${cardBg} px-6 border-t ${borderColor}`}
                style={{
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom, 16),
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

                    {/* Book Now Button */}
                    <Button
                        onPress={handleBookNow}
                        variant="primary"
                        className="flex-1"
                        size="lg"
                    >
                        Book Now
                    </Button>
                </View>
            </View>
        </View>
    );
}
