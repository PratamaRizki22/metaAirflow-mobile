import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48; // Full width with padding

export interface Property {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    image: string;
    type: 'house' | 'apartment' | 'villa' | 'land';
    isFeatured?: boolean;
    isFavorited?: boolean;
    isInCollection?: boolean;
    rating?: number;
}

interface PropertyCardProps {
    property: Property;
    onPress?: () => void;
    onFavoriteToggle?: (propertyId: string) => void;
    onAddToCollection?: (propertyId: string) => void;
    variant?: 'default' | 'compact';
    style?: StyleProp<ViewStyle>;
}

export const PropertyCard = React.memo(function PropertyCard({
    property,
    onPress,
    onFavoriteToggle,
    onAddToCollection,
    variant = 'default',
    style
}: PropertyCardProps) {
    const { isDark } = useTheme();

    const handleFavoritePress = (e: any) => {
        e.stopPropagation(); // Prevent card press
        if (onFavoriteToggle) {
            onFavoriteToggle(property.id);
        }
    };

    const handleAddToCollectionPress = (e: any) => {
        e.stopPropagation(); // Prevent card press
        if (onAddToCollection) {
            onAddToCollection(property.id);
        }
    };

    const formatPrice = (price: number) => {
        return `RM ${price.toLocaleString('en-MY')}`;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            house: ['#10B981', '#059669'],
            apartment: ['#3B82F6', '#2563EB'],
            villa: ['#8B5CF6', '#7C3AED'],
            land: ['#F59E0B', '#D97706'],
        };
        return colors[type as keyof typeof colors] || colors.house;
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            house: 'House',
            apartment: 'Apartment',
            villa: 'Villa',
            land: 'Land',
        };
        return labels[type as keyof typeof labels] || type;
    };

    if (variant === 'compact') {
        // Debug log for rating
        if (property.rating !== undefined && property.rating > 0) {
            console.log('⭐ PropertyCard compact - showing rating:', property.rating, 'for', property.title);
        }

        return (
            <TouchableOpacity
                onPress={onPress}
                style={[{ width: 200 }, style]}
                activeOpacity={0.7}
            >
                <View
                    className={`rounded-2xl overflow-hidden ${isDark ? 'bg-surface-dark' : 'bg-white'
                        }`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    {/* Image */}
                    <View className="relative">
                        <Image
                            source={{ uri: property.image }}
                            className="w-full h-32"
                            resizeMode="cover"
                        />
                        {/* Bottom Gradient Effect */}
                        <LinearGradient
                            colors={['rgba(1, 232, 173, 0)', 'rgba(1, 232, 173, 0.4)', 'rgba(16, 160, 247, 0.6)']}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            className="absolute bottom-0 left-0 right-0"
                            style={{ height: 47, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                        />

                        {/* Favorite Button */}
                        <TouchableOpacity
                            onPress={handleFavoritePress}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center"
                        >
                            <Ionicons
                                name={property.isFavorited ? 'heart' : 'heart-outline'}
                                size={18}
                                color={property.isFavorited ? '#EF4444' : '#6B7280'}
                            />
                        </TouchableOpacity>

                        {/* Add to Collection Button */}
                        {onAddToCollection && (
                            <TouchableOpacity
                                onPress={handleAddToCollectionPress}
                                className="absolute top-2 right-12 w-8 h-8 rounded-full bg-white/90 items-center justify-center"
                            >
                                <Ionicons
                                    name={property.isInCollection ? 'bookmark' : 'bookmark-outline'}
                                    size={18}
                                    color={property.isInCollection ? '#000000' : '#6B7280'}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Content */}
                    <View className="p-3">
                        <Text
                            className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-800'
                                }`}
                            numberOfLines={1}
                        >
                            {property.title}
                        </Text>
                        <View className="mb-2">
                            <Text className="text-primary font-bold text-base">
                                {formatPrice(property.price)}
                            </Text>
                            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                per month
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                            <Text
                                className={`text-xs ml-1 flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                                numberOfLines={1}
                            >
                                {property.location}
                            </Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                            <Ionicons
                                name="star"
                                size={12}
                                color={property.rating && property.rating > 0 ? "#FBBF24" : "#9CA3AF"}
                            />
                            <Text className={`text-xs ml-1 font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {property.rating && property.rating > 0 ? property.rating.toFixed(1) : 'Unrated'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[{ width: CARD_WIDTH }, style]}
            activeOpacity={0.7}
        >
            <View
                className={`rounded-3xl overflow-hidden ${isDark ? 'bg-surface-dark' : 'bg-white'
                    }`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 6,
                }}
            >
                {/* Image */}
                <View className="relative">
                    <Image
                        source={{ uri: property.image }}
                        className="w-full h-56"
                        resizeMode="cover"
                    />
                    {/* Bottom Gradient Effect */}
                    <LinearGradient
                        colors={['rgba(1, 232, 173, 0)', 'rgba(1, 232, 173, 0.4)', 'rgba(16, 160, 247, 0.6)']}
                        locations={[0, 0.4, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        className="absolute bottom-0 left-0 right-0"
                        style={{ height: 47, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                    />

                    {/* Type Badge */}
                    <View className="absolute top-4 left-4">
                        <LinearGradient
                            colors={getTypeColor(property.type) as [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="px-3 py-1.5 rounded-full"
                        >
                            <Text className="text-white text-xs font-semibold">
                                {getTypeLabel(property.type)}
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Featured Badge */}
                    {property.isFeatured && (
                        <View className="absolute top-4 right-16">
                            <View className="bg-yellow-500 px-3 py-1.5 rounded-full flex-row items-center">
                                <Ionicons name="star" size={12} color="white" />
                                <Text className="text-white text-xs font-semibold ml-1">
                                    Featured
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Favorite Button */}
                    <TouchableOpacity
                        onPress={handleFavoritePress}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
                    >
                        <Ionicons
                            name={property.isFavorited ? 'heart' : 'heart-outline'}
                            size={22}
                            color={property.isFavorited ? '#EF4444' : '#6B7280'}
                        />
                    </TouchableOpacity>

                    {/* Add to Collection Button */}
                    {onAddToCollection && (
                        <TouchableOpacity
                            onPress={handleAddToCollectionPress}
                            className="absolute top-4 right-16 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
                        >
                            <Ionicons
                                name={property.isInCollection ? 'bookmark' : 'bookmark-outline'}
                                size={22}
                                color={property.isInCollection ? '#000000' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content */}
                <View className="p-5">
                    <Text
                        className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'
                            }`}
                        numberOfLines={2}
                    >
                        {property.title}
                    </Text>

                    <View className="flex-row items-center mb-4">
                        <Ionicons name="location-outline" size={18} color="#00D9A3" />
                        <Text
                            className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            numberOfLines={1}
                        >
                            {property.location}
                        </Text>
                    </View>

                    {/* Rating Badge for Default Variant */}
                    <View className="absolute top-0 right-0 p-5">
                        <View className="flex-row items-center bg-white/90 dark:bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Ionicons
                                name="star"
                                size={14}
                                color={property.rating && property.rating > 0 ? "#F59E0B" : "#9CA3AF"}
                            />
                            <Text className={`text-xs ml-1 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {property.rating && property.rating > 0 ? property.rating.toFixed(1) : 'Unrated'}
                            </Text>
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-primary font-bold text-2xl">
                            {formatPrice(property.price)}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            per month
                        </Text>
                    </View>

                    {/* Property Details */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View
                                className={`flex-row items-center px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    }`}
                            >
                                <Ionicons
                                    name="bed-outline"
                                    size={18}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text
                                    className={`ml-1.5 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}
                                >
                                    {property.bedrooms}
                                </Text>
                            </View>

                            <View
                                className={`flex-row items-center px-3 py-2 rounded-lg ml-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    }`}
                            >
                                <Ionicons
                                    name="water-outline"
                                    size={18}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text
                                    className={`ml-1.5 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}
                                >
                                    {property.bathrooms}
                                </Text>
                            </View>

                            <View
                                className={`flex-row items-center px-3 py-2 rounded-lg ml-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    }`}
                            >
                                <Ionicons
                                    name="resize-outline"
                                    size={18}
                                    color={isDark ? '#9CA3AF' : '#6B7280'}
                                />
                                <Text
                                    className={`ml-1.5 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}
                                >
                                    {property.area}m²
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});
