import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { propertyService, amenityService } from '../../services';
import { PropertyCard } from '../../components/property';
import { useThemeColors } from '../../hooks';

export function SearchScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [amenities, setAmenities] = useState<any[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const { bgColor, textColor, cardBg, borderColor } = useThemeColors();
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-white';

    // Load amenities on mount
    React.useEffect(() => {
        loadAmenities();
    }, []);

    const loadAmenities = async () => {
        try {
            const response = await amenityService.getAmenities();
            setAmenities(response.amenities || []);
        } catch (error) {
            console.error('Failed to load amenities:', error);
        }
    };

    const toggleAmenity = (amenityId: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            setHasSearched(true);

            const filters: any = {};
            if (searchQuery) filters.search = searchQuery;
            if (city) filters.city = city;
            if (minPrice) filters.minPrice = parseFloat(minPrice);
            if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
            if (bedrooms) filters.bedrooms = parseInt(bedrooms);
            if (selectedAmenities.length > 0) filters.amenities = selectedAmenities.join(',');

            const response = await propertyService.getMobileProperties(1, 50, filters);
            setProperties(response.data.properties);
        } catch (error: any) {
            console.error('SearchScreen - Get mobile properties error:', error);
            // Don't show Alert to prevent infinite loop
            setProperties([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setCity('');
        setMinPrice('');
        setMaxPrice('');
        setBedrooms('');
        setSelectedAmenities([]);
        setProperties([]);
        setHasSearched(false);
    };

    const handlePropertyPress = useCallback((propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    }, [navigation]);

    const renderPropertyItem = useCallback(({ item }: any) => (
        <View style={{ marginBottom: 16 }}>
            <PropertyCard
                property={{
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    location: `${item.city}, ${item.state}`,
                    bedrooms: item.bedrooms,
                    bathrooms: item.bathrooms,
                    area: item.areaSqm,
                    image: item.images?.[0] || 'https://via.placeholder.com/400x300',
                    type: item.propertyType?.name?.toLowerCase() || 'house',
                }}
                onPress={() => handlePropertyPress(item.id)}
            />
        </View>
    ), [handlePropertyPress]);

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView className="flex-1 px-6 pt-16">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Search Properties
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                    Find exactly what you're looking for
                </Text>

                {/* Search Filters */}
                <View className={`${cardBg} rounded-2xl p-6 mb-4`}>
                    <Text className={`text-lg font-semibold mb-4 ${textColor}`}>
                        Search Filters
                    </Text>

                    {/* General Search */}
                    <Text className={`text-sm font-medium mb-2 ${textColor}`}>Search</Text>
                    <TextInput
                        placeholder="Property name, location..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className={`${inputBg} ${textColor} px-4 py-3 rounded-xl mb-4`}
                        style={{
                            borderWidth: 1,
                            borderColor: isDark ? '#374151' : '#E5E7EB',
                        }}
                    />

                    {/* City */}
                    <Text className={`text-sm font-medium mb-2 ${textColor}`}>City</Text>
                    <TextInput
                        placeholder="e.g., Jakarta, Surabaya"
                        placeholderTextColor="#9CA3AF"
                        value={city}
                        onChangeText={setCity}
                        className={`${inputBg} ${textColor} px-4 py-3 rounded-xl mb-4`}
                        style={{
                            borderWidth: 1,
                            borderColor: isDark ? '#374151' : '#E5E7EB',
                        }}
                    />

                    {/* Price Range */}
                    <Text className={`text-sm font-medium mb-2 ${textColor}`}>Price Range (Rp)</Text>
                    <View className="flex-row gap-3 mb-4">
                        <TextInput
                            placeholder="Min"
                            placeholderTextColor="#9CA3AF"
                            value={minPrice}
                            onChangeText={setMinPrice}
                            keyboardType="numeric"
                            className={`flex-1 ${inputBg} ${textColor} px-4 py-3 rounded-xl`}
                            style={{
                                borderWidth: 1,
                                borderColor: isDark ? '#374151' : '#E5E7EB',
                            }}
                        />
                        <TextInput
                            placeholder="Max"
                            placeholderTextColor="#9CA3AF"
                            value={maxPrice}
                            onChangeText={setMaxPrice}
                            keyboardType="numeric"
                            className={`flex-1 ${inputBg} ${textColor} px-4 py-3 rounded-xl`}
                            style={{
                                borderWidth: 1,
                                borderColor: isDark ? '#374151' : '#E5E7EB',
                            }}
                        />
                    </View>

                    {/* Bedrooms */}
                    <Text className={`text-sm font-medium mb-2 ${textColor}`}>Minimum Bedrooms</Text>
                    <TextInput
                        placeholder="e.g., 2"
                        placeholderTextColor="#9CA3AF"
                        value={bedrooms}
                        onChangeText={setBedrooms}
                        keyboardType="numeric"
                        className={`${inputBg} ${textColor} px-4 py-3 rounded-xl mb-4`}
                        style={{
                            borderWidth: 1,
                            borderColor: isDark ? '#374151' : '#E5E7EB',
                        }}
                    />

                    {/* Amenities */}
                    {amenities.length > 0 && (
                        <>
                            <Text className={`text-sm font-medium mb-3 ${textColor}`}>Amenities</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {amenities.slice(0, 12).map((amenity) => (
                                    <TouchableOpacity
                                        key={amenity.id}
                                        onPress={() => toggleAmenity(amenity.id)}
                                        className={`px-4 py-2 rounded-full border ${selectedAmenities.includes(amenity.id)
                                                ? 'bg-primary/10 border-primary'
                                                : isDark
                                                    ? 'bg-surface-dark border-gray-700'
                                                    : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text
                                            className={`text-sm font-medium ${selectedAmenities.includes(amenity.id)
                                                    ? 'text-primary'
                                                    : textColor
                                                }`}
                                        >
                                            {amenity.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {selectedAmenities.length > 0 && (
                                <View className="bg-primary/10 px-3 py-2 rounded-lg mb-4">
                                    <Text className="text-primary text-sm font-medium">
                                        {selectedAmenities.length} amenity{selectedAmenities.length > 1 ? 'ies' : 'y'} selected
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleSearch}
                            disabled={loading}
                            className="flex-1 bg-primary rounded-xl py-3"
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text className="text-white text-center font-semibold">
                                    Search
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleClearFilters}
                            className="flex-1 border-2 border-primary rounded-xl py-3"
                        >
                            <Text className="text-primary text-center font-semibold">
                                Clear
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Results */}
                {hasSearched && (
                    <View className="mb-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className={`text-xl font-bold ${textColor}`}>
                                Search Results
                            </Text>
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                                {properties.length} found
                            </Text>
                        </View>

                        {loading ? (
                            <View className="items-center py-12">
                                <ActivityIndicator size="large" color="#14B8A6" />
                                <Text className={`mt-4 ${textColor}`}>Searching...</Text>
                            </View>
                        ) : properties.length > 0 ? (
                            <FlatList
                                data={properties}
                                renderItem={renderPropertyItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <View className="items-center py-12">
                                <Ionicons name="search-outline" size={64} color="#9CA3AF" />
                                <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                                    No Properties Found
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-center mt-2 px-8">
                                    Try adjusting your search filters
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Bottom padding for tab bar */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}
