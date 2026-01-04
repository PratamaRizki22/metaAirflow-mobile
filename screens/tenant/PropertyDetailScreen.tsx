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
    Linking,
    Platform,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { MAPTILER_API_KEY } from '@env';
import { propertyService, favoriteService, bookingService, reviewService, messageService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useThemeColors } from '../../hooks';
import { LoadingState, ErrorState, Button } from '../../components/common';
import { getImageSource, getApiBaseUrl, getImageFilename } from '../../utils/imageUtils';

export default function PropertyDetailScreen({ route, navigation }: any) {
    const { propertyId } = route.params;
    const { isLoggedIn, user } = useAuth();
    const { isFavorited: isInFavorites, toggleFavorite } = useFavorites();

    const [property, setProperty] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [hasCompletedBooking, setHasCompletedBooking] = useState(false);
    const [propertyRating, setPropertyRating] = useState<any>(null);

    // Location popup state
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

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

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    // Get user's current location
    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission is required to show distance');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            // Calculate distance
            if (property?.latitude && property?.longitude) {
                const dist = calculateDistance(
                    location.coords.latitude,
                    location.coords.longitude,
                    property.latitude,
                    property.longitude
                );
                setDistance(dist);
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    // Open Google Maps with directions
    const openDirections = () => {
        if (!property?.latitude || !property?.longitude) {
            Alert.alert('Error', 'Property location not available');
            return;
        }

        const destination = `${property.latitude},${property.longitude}`;
        const label = encodeURIComponent(property.title || 'Property');

        let url = '';
        if (Platform.OS === 'ios') {
            url = `maps://app?daddr=${destination}&q=${label}`;
        } else {
            url = `google.navigation:q=${destination}`;
        }

        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                Linking.openURL(url);
            } else {
                // Fallback to browser
                const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`;
                Linking.openURL(browserUrl);
            }
        });
    };


    useEffect(() => {
        loadPropertyDetail();
    }, [propertyId]);

    const loadPropertyDetail = async () => {
        try {
            setLoading(true);

            // Load all data in parallel
            const [propertyResponse, bookingsResponse, ratingResponse] = await Promise.all([
                propertyService.getPropertyById(propertyId),
                isLoggedIn ? bookingService.getBookings(1, 100, 'COMPLETED').catch(() => ({ data: { bookings: [] } })) : Promise.resolve({ data: { bookings: [] } }),
                reviewService.getPropertyRating(propertyId).catch(() => ({ success: false, data: null }))
            ]);

            // Set property data
            console.log('Property images:', propertyResponse.data?.images);
            console.log('Images count:', propertyResponse.data?.images?.length || 0);
            setProperty(propertyResponse.data);

            // Check if user has completed booking
            if (isLoggedIn && propertyId && typeof propertyId === 'string') {
                const hasBooking = bookingsResponse.data.bookings.some(
                    (booking: any) => booking.property?.id === propertyId
                );
                setHasCompletedBooking(hasBooking);
            }

            // Set property rating
            console.log('Property rating data:', ratingResponse);
            if (ratingResponse.success && ratingResponse.data) {
                setPropertyRating(ratingResponse.data);
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load property details');
        } finally {
            setLoading(false);
        }
    };



    const handleToggleFavorite = async () => {
        console.log('Toggle favorite clicked, isLoggedIn:', isLoggedIn);

        if (!isLoggedIn) {
            Alert.alert(
                'Login Required',
                'Please login to save favorites',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Auth') },
                ]
            );
            return;
        }

        try {
            console.log('Calling toggleFavorite from context for propertyId:', propertyId);
            await toggleFavorite(propertyId);
            console.log('Toggle favorite success');
        } catch (error: any) {
            console.error('Toggle favorite error:', error);
            Alert.alert('Error', error.message || 'Failed to update favorite');
        }
    };

    const handleBookNow = () => {
        if (!isLoggedIn) {
            Alert.alert(
                'Login Required',
                'Please login to book this property',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Auth') },
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

    const handleChatOwner = async () => {
        if (!isLoggedIn) {
            Alert.alert(
                'Login Required',
                'Please login to chat with the owner',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Auth') },
                ]
            );
            return;
        }

        try {
            // Check if user is the owner
            if (user?.id === property.ownerId) {
                Alert.alert('Error', 'You cannot chat with yourself');
                return;
            }

            const response = await messageService.createConversation(propertyId);

            if (response.success && response.data) {
                const conversation = response.data;

                // Auto-send context bubble content if context has changed
                try {
                    const history = await messageService.getMessages(conversation.id, 1, 1);
                    const lastMsg = history.data.messages.length > 0 ? history.data.messages[0] : null;

                    let shouldSendCard = true;

                    // Check if the last message is already about this property to avoid duplicates
                    if (lastMsg && ((lastMsg.type as string).toUpperCase() === 'SYSTEM')) {
                        try {
                            const content = JSON.parse(lastMsg.content);
                            if (content.propertyId === property.id) {
                                shouldSendCard = false;
                            }
                        } catch (e) {
                            // Content not JSON, ignore
                        }
                    }

                    if (shouldSendCard) {
                        // Create structured property enquiry data for Rich Card rendering
                        const propertyCardData = {
                            title: property.title,
                            price: property.price,
                            image: property.images && property.images.length > 0 ? property.images[0] : null,
                            propertyId: property.id,
                            address: `${property.city || ''}, ${property.state || ''}`,
                            status: property.status // Send dynamic status
                        };

                        const messageContent = JSON.stringify(propertyCardData);

                        // Send as SYSTEM message (so we can render it specially as a Card)
                        await messageService.sendMessage(conversation.id, messageContent, 'system');
                    }
                } catch (err) {
                    console.log('Failed to auto-send enquiry:', err);
                }

                navigation.navigate('ChatDetail', {
                    conversationId: conversation.id,
                    propertyId: propertyId,
                    otherUserId: property.ownerId || property.owner?.id,
                    otherUserName: `${property.owner?.firstName} ${property.owner?.lastName}`,
                    hasActiveBooking: true // Let backend handle restrictions if any, assume true for UI to enable input
                });
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            Alert.alert('Error', 'Failed to start chat. ' + (error.message || ''));
        }
    };

    const handleRateProperty = () => {
        if (!isLoggedIn) {
            Alert.alert(
                'Login Required',
                'Please login to rate this property',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Auth') },
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
                            renderItem={({ item, index }) => {
                                const apiBaseUrl = getApiBaseUrl();
                                const imageSource = getImageSource(item, apiBaseUrl);

                                console.log(`[PropertyDetail] Image ${index + 1}:`, {
                                    raw: item,
                                    filename: getImageFilename(item),
                                    source: imageSource?.uri,
                                    baseUrl: apiBaseUrl
                                });

                                if (!imageSource) {
                                    console.warn('[PropertyDetail] Invalid image source for:', item);
                                    return (
                                        <View
                                            style={{ width: screenWidth, height: 300 }}
                                            className="bg-gray-300 dark:bg-gray-700 justify-center items-center"
                                        >
                                            <Ionicons name="image-outline" size={80} color="#9CA3AF" />
                                            <Text className="text-gray-500 dark:text-gray-400 mt-4">Invalid image</Text>
                                        </View>
                                    );
                                }

                                return (
                                    <Image
                                        source={imageSource}
                                        style={{ width: screenWidth, height: 300 }}
                                        resizeMode="cover"
                                        onError={(error) => {
                                            console.error(`[PropertyDetail] Image ${index + 1} load error:`, {
                                                url: imageSource.uri,
                                                error: error.nativeEvent.error,
                                                filename: getImageFilename(item)
                                            });
                                        }}
                                        onLoad={() => {
                                            console.log(`[PropertyDetail] Image ${index + 1} loaded:`, getImageFilename(item));
                                        }}
                                        onLoadStart={() => {
                                            console.log(`[PropertyDetail] Image ${index + 1} loading...`, getImageFilename(item));
                                        }}
                                    />
                                );
                            }}
                            keyExtractor={(item, index) => `image-${index}`}
                        />

                        {/* Image Counter */}
                        <View
                            className="absolute right-4 bg-black/60 px-3 py-1.5 rounded-full"
                            style={{ top: insets.top + 16 }}
                        >
                            <Text className="text-white text-sm font-semibold">
                                {currentImageIndex + 1} / {property.images.length}
                            </Text>
                        </View>

                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="absolute left-4 w-10 h-10 bg-black/60 rounded-full items-center justify-center"
                            style={{ top: insets.top + 16 }}
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
                            className="absolute left-4 w-10 h-10 bg-black/60 rounded-full items-center justify-center"
                            style={{ top: insets.top + 16 }}
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
                                    mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY || 'CNmR4fJvRK89a2UaoY91'}`}
                                    logoEnabled={false}
                                    attributionEnabled={false}
                                >
                                    <MapLibreGL.Camera
                                        centerCoordinate={[property.longitude, property.latitude]}
                                        zoomLevel={15}
                                    />
                                    <MapLibreGL.PointAnnotation
                                        id="property-location"
                                        coordinate={[property.longitude, property.latitude]}
                                        onSelected={() => {
                                            setShowLocationPopup(true);
                                            getUserLocation();
                                        }}
                                    >
                                        <View style={styles.markerContainer}>
                                            <Text style={styles.markerText}>
                                                📍 Location
                                            </Text>
                                        </View>
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
                                        <Text className={`${textColor}`}>{amenity.name}</Text>
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
                            <TouchableOpacity
                                onPress={() => navigation.navigate('LandlordProfile', { landlordId: property.owner.id })}
                                className="flex-row items-center"
                                activeOpacity={0.7}
                            >
                                <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                                    <Text className="text-white text-xl font-bold">
                                        {property.owner.firstName?.[0]}{property.owner.lastName?.[0]}
                                    </Text>
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className={`text-lg font-semibold ${textColor}`}>
                                        {property.owner.firstName} {property.owner.lastName}
                                    </Text>
                                    <Text className={`${secondaryTextColor}`}>Property Owner</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
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
                        className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${isInFavorites(propertyId) ? 'border-red-500 bg-red-500/10' : `border-gray-300 ${cardBg}`
                            }`}
                    >
                        <Ionicons
                            name={isInFavorites(propertyId) ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isInFavorites(propertyId) ? '#EF4444' : '#9CA3AF'}
                        />
                    </TouchableOpacity>

                    {/* Chat Button */}
                    <TouchableOpacity
                        onPress={handleChatOwner}
                        className={`w-14 h-14 rounded-2xl items-center justify-center border-2 border-gray-300 ${cardBg}`}
                    >
                        <Ionicons
                            name="chatbubble-outline"
                            size={24}
                            color={isDark ? '#FFF' : '#374151'}
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

            {/* Location Popup Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLocationPopup}
                onRequestClose={() => setShowLocationPopup(false)}
            >
                <Pressable
                    className="flex-1 justify-end bg-black/50"
                    onPress={() => setShowLocationPopup(false)}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        className={`${cardBg} rounded-t-3xl p-6 border-t ${borderColor}`}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="location" size={24} color="#00D9A3" />
                                </View>
                                <View>
                                    <Text className={`text-lg font-bold ${textColor}`}>Property Location</Text>
                                    <Text className={`text-sm ${secondaryTextColor}`}>
                                        {property?.city}, {property?.state}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowLocationPopup(false)}
                                className="w-8 h-8 items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            </TouchableOpacity>
                        </View>

                        {/* Distance Info */}
                        {distance !== null && (
                            <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-xl mb-4`}>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Ionicons name="navigate" size={20} color="#00D9A3" />
                                        <Text className={`ml-2 text-sm ${secondaryTextColor}`}>Distance from you</Text>
                                    </View>
                                    <Text className={`text-lg font-bold ${textColor}`}>
                                        {distance < 1
                                            ? `${(distance * 1000).toFixed(0)} m`
                                            : `${distance.toFixed(1)} km`
                                        }
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Address */}
                        <View className="mb-4">
                            <Text className={`text-sm ${secondaryTextColor} mb-1`}>Full Address</Text>
                            <Text className={`text-base ${textColor}`}>
                                {[property?.address, property?.city, property?.state, property?.zipCode]
                                    .filter(Boolean)
                                    .join(', ')}
                            </Text>
                        </View>

                        {/* Get Directions Button */}
                        <Button
                            onPress={openDirections}
                            variant="primary"
                            size="lg"
                            className="flex-row items-center justify-center"
                        >
                            <Ionicons name="navigate" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold">Get Directions</Text>
                        </Button>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    markerContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    markerText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
});
