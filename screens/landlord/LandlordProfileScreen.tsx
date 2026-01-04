import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Dimensions,
    Alert,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { userService, messageService, LandlordProfile, LandlordProperty, LandlordTestimonial } from '../../services';
import { useThemeColors } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState, ErrorState } from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');

export default function LandlordProfileScreen({ route, navigation }: any) {
    const { landlordId } = route.params;
    const insets = useSafeAreaInsets();
    const { user: currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<LandlordProfile | null>(null);
    const [properties, setProperties] = useState<LandlordProperty[]>([]);
    const [testimonials, setTestimonials] = useState<LandlordTestimonial[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [loadingTestimonials, setLoadingTestimonials] = useState(false);

    const {
        bgColor,
        cardBg,
        textColor,
        secondaryTextColor,
        borderColor,
        isDark,
    } = useThemeColors();

    useEffect(() => {
        loadLandlordData();
    }, [landlordId]);

    const loadLandlordData = async () => {
        try {
            setLoading(true);

            // Load profile
            const profileResponse = await userService.getLandlordProfile(landlordId);
            setProfile(profileResponse.data);

            // Load properties
            setLoadingProperties(true);
            const propertiesResponse = await userService.getLandlordProperties(landlordId, 1, 6);
            setProperties(propertiesResponse.data.properties);
            setLoadingProperties(false);

            // Load testimonials
            setLoadingTestimonials(true);
            const testimonialsResponse = await userService.getLandlordTestimonials(landlordId, 1, 10);
            setTestimonials(testimonialsResponse.data.testimonials);
            setLoadingTestimonials(false);

        } catch (error: any) {
            console.error('Load landlord data error:', error);
            Alert.alert('Error', error.message || 'Failed to load landlord profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (profile?.user.phone) {
            Linking.openURL(`tel:${profile.user.phone} `);
        } else {
            Alert.alert('No Phone', 'Phone number not available');
        }
    };

    const handleMessage = async () => {
        try {
            // Check if user is trying to message themselves
            if (landlordId === currentUser?.id) {
                Alert.alert('Cannot Message Yourself', 'You cannot send messages to yourself.');
                return;
            }

            // Get any property from this landlord to create conversation
            if (properties.length === 0) {
                Alert.alert('No Properties', 'This agent has no active properties to inquire about.');
                return;
            }

            const propertyId = properties[0].id;

            // Create or get conversation
            const response = await messageService.createConversation(propertyId);

            if (response.success && response.data) {
                const conversation = response.data;

                // Navigate to chat
                navigation.navigate('ChatDetail', {
                    conversationId: conversation.id,
                    propertyId: propertyId,
                    otherUserId: landlordId,
                    otherUserName: `${user.firstName} ${user.lastName}`,
                    otherUserAvatar: user.profilePicture,
                    hasActiveBooking: false,
                });
            }
        } catch (error: any) {
            console.error('Create conversation error:', error);
            Alert.alert('Error', error.message || 'Failed to start conversation');
        }
    };

    const handlePropertyPress = (propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    };

    const handleSeeAllProperties = () => {
        navigation.navigate('LandlordProperties', {
            landlordId: user.id,
            landlordName: `${user.firstName} ${user.lastName}`
        });
    };

    if (loading) {
        return <LoadingState message="Loading agent profile..." />;
    }

    if (!profile) {
        return (
            <ErrorState
                title="Profile Not Found"
                message="The agent profile you're looking for doesn't exist."
                actionLabel="Go Back"
                onAction={() => navigation.goBack()}
            />
        );
    }

    const { user, stats } = profile;

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, minHeight: '120%' }}>
                {/* Header with ImageBackground */}
                <View style={{ position: 'relative' }}>
                    <ImageBackground
                        source={require('../../assets/profile-hero.png')}
                        style={{
                            paddingTop: insets.top + 16,
                            paddingBottom: 100,
                            paddingHorizontal: 24,
                        }}
                        resizeMode="cover"
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-6"
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <View className="items-center">
                            <Text className="text-white text-2xl font-bold mb-1">Agent Profile</Text>
                        </View>
                    </ImageBackground>


                </View>

                {/* Profile Section */}
                <View className={`${bgColor} px-6`} style={{ marginTop: -30 }}>
                    {/* Profile Picture */}
                    <View className="items-center -mt-16 mb-4">
                        <View
                            className="w-24 h-24 rounded-full bg-primary items-center justify-center"
                            style={{
                                borderWidth: 4,
                                borderColor: isDark ? '#1F2937' : '#FFFFFF',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            {user.profilePicture ? (
                                <Image
                                    source={{ uri: user.profilePicture }}
                                    className="w-full h-full rounded-full"
                                />
                            ) : (
                                <Text className="text-white text-3xl font-bold">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </Text>
                            )}
                        </View>

                        {/* Verification Badge */}
                        <View className="absolute bottom-0 right-1/3 bg-primary rounded-full p-1">
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Name and Role */}
                    <View className="items-center mb-3">
                        <Text className={`text-2xl font-bold ${textColor} mb-1`}>
                            {user.firstName} {user.lastName}
                        </Text>
                        <Text className="text-primary font-semibold text-base mb-3">
                            Professional Agent
                        </Text>

                        {/* Bio/Description */}
                        <Text className={`text-sm ${secondaryTextColor} text-center px-4 leading-5`}>
                            Hi! I'm {user.firstName}. I specialize in matching urban dwellers with the best high-rise living KL has to offer. From modern suites to Su...{' '}
                            <Text className="text-primary font-semibold">more</Text>
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mb-6">
                        <TouchableOpacity
                            onPress={handleMessage}
                            className="flex-1 items-center py-3"
                        >
                            <View className="w-48 h-16 bg-primary/10 rounded-lg items-center justify-center mb-1">
                                <Ionicons name="chatbubble" size={20} color="#10A0F7" />
                                <Text className="text-primary font-semibold text-sm">Message</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCall}
                            className="flex-1 items-center py-3"
                        >
                            <View className="w-48 h-16 bg-primary/10 rounded-lg items-center justify-center mb-1">
                                <Ionicons name="call" size={20} color="#10A0F7" />
                                <Text className="text-primary font-semibold text-sm">Audio</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Active Listings Section */}
                <Animated.View entering={FadeInDown.delay(100)} className="mt-6 px-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-xl font-bold ${textColor}`}>Active Listings</Text>
                        {properties.length > 0 && (
                            <TouchableOpacity onPress={handleSeeAllProperties}>
                                <Text className="text-primary font-semibold">See all</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loadingProperties ? (
                        <ActivityIndicator size="large" color="#10A0F7" />
                    ) : properties.length > 0 ? (
                        <FlatList
                            data={properties}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handlePropertyPress(item.id)}
                                    className="bg-white dark:bg-gray-800 rounded-2xl mr-4 overflow-hidden"
                                    style={{
                                        width: screenWidth * 0.7,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 3,
                                    }}
                                >
                                    <Image
                                        source={{ uri: item.images[0] || 'https://via.placeholder.com/300x200' }}
                                        className="w-full h-40"
                                        resizeMode="cover"
                                    />
                                    <View className="p-4">
                                        <Text className={`text-base font-bold ${textColor} mb-1`} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <View className="flex-row items-center mb-3">
                                            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                                            <Text className={`ml-1 text-xs ${secondaryTextColor}`} numberOfLines={1}>
                                                {item.city}, {item.state}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-primary text-base font-bold">
                                                RM {item.price.toLocaleString()}
                                            </Text>
                                            {item.averageRating && (
                                                <View className="flex-row items-center">
                                                    <Ionicons name="star" size={14} color="#FBBF24" />
                                                    <Text className={`ml-1 text-sm font-semibold ${textColor}`}>
                                                        {item.averageRating.toFixed(1)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl items-center">
                            <Ionicons name="home-outline" size={48} color="#9CA3AF" />
                            <Text className={`text-base ${secondaryTextColor} mt-3`}>
                                No active listings yet
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Client Testimonials Section */}
                <Animated.View entering={FadeInDown.delay(200)} className="mt-6 px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-xl font-bold ${textColor}`}>Client Testimonials</Text>
                        {testimonials.length > 0 && (
                            <TouchableOpacity>
                                <Text className="text-primary font-semibold">See all</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loadingTestimonials ? (
                        <ActivityIndicator size="large" color="#10A0F7" />
                    ) : testimonials.length > 0 ? (
                        <View>
                            {testimonials.map((testimonial) => (
                                <View
                                    key={testimonial.id}
                                    className="bg-primary/10 p-4 rounded-2xl mb-3"
                                >
                                    <View className="flex-row items-start mb-3">
                                        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                                            {testimonial.user.profilePicture ? (
                                                <Image
                                                    source={{ uri: testimonial.user.profilePicture }}
                                                    className="w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <Text className="text-white font-bold text-base">
                                                    {testimonial.user.firstName[0]}{testimonial.user.lastName[0]}
                                                </Text>
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`font-bold ${textColor} mb-1`}>
                                                {testimonial.user.firstName} {testimonial.user.lastName}
                                            </Text>
                                            <View className="flex-row">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons
                                                        key={star}
                                                        name="star"
                                                        size={14}
                                                        color={star <= testimonial.rating ? '#FBBF24' : '#D1D5DB'}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                    <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-5 text-sm`}>
                                        {testimonial.comment}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl items-center">
                            <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                            <Text className={`text-base ${secondaryTextColor} mt-3`}>
                                No testimonials yet
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Bottom Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View >
    );
}
