import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAPTILER_API_KEY } from '@env';
import { propertyService, uploadService, propertyTypeService, amenityService } from '../../services';
import { useThemeColors } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { LoadingState, Toast, ImagePickerSection, FormInput } from '../../components/common';
import { PricePredictionModal } from '../../components/property/PricePredictionModal';

export default function CreatePropertyScreen({ navigation }: any) {
    const { bgColor, cardBg, textColor, secondaryTextColor, borderColor, isDark } = useThemeColors();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: 'Malaysia',
        zipCode: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        areaSqm: '',
        furnished: false,
        propertyTypeId: '',
        latitude: 3.1390,
        longitude: 101.6869,
    });
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showPricePrediction, setShowPricePrediction] = useState(false);

    // Amenities state
    const [amenities, setAmenities] = useState<any[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<Record<string, any[]>>({});
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const { toast, showToast, hideToast } = useToast();

    // Configure MapLibre
    MapLibreGL.setAccessToken(null);

    useEffect(() => {
        loadPropertyTypes();
        loadAmenities();
    }, []);

    const loadPropertyTypes = async () => {
        try {
            const response = await propertyTypeService.getPropertyTypes();
            setPropertyTypes(response);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const loadAmenities = async () => {
        try {
            const response = await amenityService.getAmenities();
            // Handle both structure with categories and flat list
            if (response.grouped) {
                setAmenityCategories(response.grouped);
                setAmenities(response.amenities || []);
            } else if (Array.isArray(response)) {
                setAmenities(response);
            } else if (response.amenities) {
                setAmenities(response.amenities);
            }
        } catch (error: any) {
            console.error('Failed to load amenities:', error);
        }
    };



    const handleMapPress = (feature: any) => {
        const coordinates = feature.geometry.coordinates;
        setFormData(prev => ({
            ...prev,
            longitude: coordinates[0],
            latitude: coordinates[1],
        }));
        showToast(
            `Location updated: ${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
            'success'
        );
    };

    const toggleAmenity = (amenityId: string) => {
        setSelectedAmenities(prev => {
            if (prev.includes(amenityId)) {
                return prev.filter(id => id !== amenityId);
            } else {
                return [...prev, amenityId];
            }
        });
    };

    const uploadImages = async () => {
        if (selectedImages.length === 0) return [];

        setUploadingImages(true);

        try {
            const files = selectedImages.map((imageUri, index) => ({
                uri: imageUri,
                type: 'image/jpeg',
                name: `property_${Date.now()}_${index}.jpg`,
            }));

            const response = await uploadService.uploadMultiple(files, true);

            if (response.success && response.data.files) {
                const uploadedUrls = response.data.files.map(file => file.url);
                setUploadedImageUrls(uploadedUrls);
                return uploadedUrls;
            }

            return [];
        } catch (error: any) {
            showToast(error.message || 'Failed to upload images', 'error');
            return [];
        } finally {
            setUploadingImages(false);
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            showToast('Please enter property title', 'error');
            return false;
        }
        if (!formData.description.trim()) {
            showToast('Please enter description', 'error');
            return false;
        }
        if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
            showToast('Please enter complete address', 'error');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            showToast('Please enter valid price', 'error');
            return false;
        }
        if (!formData.bedrooms || parseInt(formData.bedrooms) <= 0) {
            showToast('Please enter number of bedrooms', 'error');
            return false;
        }
        if (!formData.bathrooms || parseInt(formData.bathrooms) <= 0) {
            showToast('Please enter number of bathrooms', 'error');
            return false;
        }
        if (!formData.areaSqm || parseFloat(formData.areaSqm) <= 0) {
            showToast('Please enter property area', 'error');
            return false;
        }
        if (!formData.propertyTypeId) {
            showToast('Please select property type', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            let imageUrls: string[] = [];
            if (selectedImages.length > 0) {
                imageUrls = await uploadImages();
                if (imageUrls.length === 0 && selectedImages.length > 0) {
                    Alert.alert('Warning', 'Failed to upload some images. Continue anyway?', [
                        { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
                        { text: 'Continue', onPress: () => createPropertyWithImages([]) }
                    ]);
                    return;
                }
            }

            await createPropertyWithImages(imageUrls);
        } catch (error: any) {
            showToast(error.message || 'Failed to create property', 'error');
            setLoading(false);
        }
    };

    const createPropertyWithImages = async (imageUrls: string[]) => {
        try {
            await propertyService.createProperty({
                title: formData.title,
                description: formData.description,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                zipCode: formData.zipCode,
                price: parseFloat(formData.price),
                currencyCode: 'MYR',
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                areaSqm: parseFloat(formData.areaSqm),
                furnished: formData.furnished,
                isAvailable: true,
                propertyTypeId: formData.propertyTypeId,
                images: imageUrls,
                amenityIds: selectedAmenities,
            });

            showToast('Property created successfully!', 'success');
            setTimeout(() => {
                navigation.navigate('ManageProperties');
            }, 1500);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderAmenityItem = (amenity: any) => {
        const isSelected = selectedAmenities.includes(amenity.id);
        return (
            <TouchableOpacity
                key={amenity.id}
                onPress={() => toggleAmenity(amenity.id)}
                className={`px-3 py-2 rounded-lg border mr-2 mb-2 ${isSelected
                    ? 'bg-primary/10 border-primary'
                    : isDark ? 'bg-surface-dark border-gray-700' : 'bg-white border-gray-300'
                    }`}
            >
                <Text
                    className={`text-xs font-medium ${isSelected ? 'text-primary' : textColor}`}
                >
                    {amenity.name}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <LoadingState message="Creating property..." />;
    }

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="p-6">
                <Text className={`text-3xl font-bold mb-6 ${textColor}`}>
                    Add New Property
                </Text>

                {/* Title */}
                <FormInput
                    label="Property Title"
                    required
                    placeholder="e.g., Modern Apartment in KLCC"
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                />

                {/* Description */}
                <FormInput
                    label="Description"
                    required
                    placeholder="Describe your property..."
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={4}
                    style={{ textAlignVertical: 'top' }}
                />

                {/* Address */}
                <FormInput
                    label="Address"
                    required
                    placeholder="Street address"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                />

                {/* Map Location */}
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                        Location on Map <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowMap(!showMap)}
                        className={`${cardBg} border ${borderColor} rounded-xl p-4 flex-row items-center justify-between`}
                    >
                        <View>
                            <Text className={`${textColor} font-medium`}>
                                {showMap ? 'Hide Map' : 'Select Location'}
                            </Text>
                            <Text className={`${secondaryTextColor} text-sm`}>
                                Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                            </Text>
                        </View>
                        <Ionicons
                            name={showMap ? 'chevron-up' : 'location'}
                            size={24}
                            color={isDark ? '#94A3B8' : '#6B7280'}
                        />
                    </TouchableOpacity>

                    {showMap && (
                        <View className="mt-3 h-64 rounded-xl overflow-hidden">
                            <MapLibreGL.MapView
                                style={{ flex: 1 }}
                                onPress={handleMapPress}
                            >
                                <MapLibreGL.RasterSource
                                    id="maptiler-source"
                                    tileUrlTemplates={[`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`]}
                                    tileSize={256}
                                >
                                    <MapLibreGL.RasterLayer id="maptiler-layer" sourceID="maptiler-source" />
                                </MapLibreGL.RasterSource>
                                <MapLibreGL.Camera
                                    centerCoordinate={[formData.longitude, formData.latitude]}
                                    zoomLevel={15}
                                    animationDuration={1000}
                                />
                                <MapLibreGL.PointAnnotation
                                    id="property-location"
                                    coordinate={[formData.longitude, formData.latitude]}
                                >
                                    <View className="bg-red-500 w-6 h-6 rounded-full border-2 border-white items-center justify-center">
                                        <View className="bg-white w-2 h-2 rounded-full" />
                                    </View>
                                </MapLibreGL.PointAnnotation>
                            </MapLibreGL.MapView>
                            <View className="absolute bottom-2 left-2 right-2">
                                <Text className="bg-black/70 text-white text-xs p-2 rounded text-center">
                                    Tap anywhere on the map to set property location
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* City & State */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <FormInput
                            label="City"
                            required
                            placeholder="City"
                            value={formData.city}
                            onChangeText={(text) => setFormData({ ...formData, city: text })}
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>
                    <View className="flex-1">
                        <FormInput
                            label="State"
                            required
                            placeholder="State"
                            value={formData.state}
                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>
                </View>

                {/* Price with AI Suggestion */}
                <View className="mb-4">
                    <FormInput
                        label="Monthly Price (MYR)"
                        required
                        placeholder="e.g., 2500"
                        value={formData.price}
                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                        keyboardType="numeric"
                        containerStyle={{ marginBottom: 0 }}
                    />

                    {/* AI Price Suggestion Button */}
                    {formData.bedrooms && formData.bathrooms && formData.areaSqm && formData.city && formData.propertyTypeId && (
                        <TouchableOpacity
                            onPress={() => setShowPricePrediction(true)}
                            className="mt-2"
                        >
                            <LinearGradient
                                colors={['#6366F1', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-3 px-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Ionicons name="analytics" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-semibold">Get AI Price Suggestion</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Bedrooms, Bathrooms, Area */}
                <View className="flex-row gap-2 mb-4">
                    <View className="flex-1">
                        <FormInput
                            label="Beds"
                            required
                            placeholder="3"
                            value={formData.bedrooms}
                            onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                            keyboardType="numeric"
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>
                    <View className="flex-1">
                        <FormInput
                            label="Baths"
                            required
                            placeholder="2"
                            value={formData.bathrooms}
                            onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                            keyboardType="numeric"
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>
                    <View className="flex-1">
                        <FormInput
                            label="Area (m²)"
                            required
                            placeholder="120"
                            value={formData.areaSqm}
                            onChangeText={(text) => setFormData({ ...formData, areaSqm: text })}
                            keyboardType="numeric"
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>
                </View>

                {/* Property Images */}
                {/* Property Images */}
                <ImagePickerSection
                    selectedImages={selectedImages}
                    onImagesSelected={(uris) => setSelectedImages([...selectedImages, ...uris])}
                    onRemoveImage={(index) => {
                        const newImages = selectedImages.filter((_, i) => i !== index);
                        setSelectedImages(newImages);
                    }}
                    uploading={uploadingImages}
                />

                {/* Property Type */}
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-3 ${textColor}`}>
                        Property Type <Text className="text-red-500">*</Text>
                    </Text>
                    <View className="gap-2">
                        {propertyTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setFormData({ ...formData, propertyTypeId: type.id })}
                                className={`p-4 rounded-xl border-2 ${formData.propertyTypeId === type.id
                                    ? 'border-primary bg-primary/10'
                                    : `border-gray-300 ${cardBg}`
                                    }`}
                            >
                                <Text className={`font-semibold ${formData.propertyTypeId === type.id ? 'text-primary' : textColor
                                    }`}>
                                    {type.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Amenities Selection */}
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-3 ${textColor}`}>
                        Amenities
                    </Text>
                    <View className={`${cardBg} rounded-xl border ${borderColor} p-4`}>
                        {Object.keys(amenityCategories).length > 0 ? (
                            Object.entries(amenityCategories).map(([category, items]) => (
                                <View key={category} className="mb-4">
                                    <Text className={`text-sm font-bold mb-2 uppercase tracking-wider ${secondaryTextColor}`}>
                                        {category}
                                    </Text>
                                    <View className="flex-row flex-wrap">
                                        {items.map(renderAmenityItem)}
                                    </View>
                                </View>
                            ))
                        ) : amenities.length > 0 ? (
                            <View className="flex-row flex-wrap">
                                {amenities.map(renderAmenityItem)}
                            </View>
                        ) : (
                            <Text className={`text-center py-4 ${secondaryTextColor}`}>
                                Loading amenities...
                            </Text>
                        )}

                        {selectedAmenities.length > 0 && (
                            <Text className={`mt-2 text-right text-sm text-primary font-medium`}>
                                {selectedAmenities.length} selected
                            </Text>
                        )}
                    </View>
                </View>

                {/* Furnished */}
                <TouchableOpacity
                    onPress={() => setFormData({ ...formData, furnished: !formData.furnished })}
                    className={`flex-row items-center p-4 rounded-xl border ${borderColor} mb-6 ${cardBg}`}
                >
                    <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${formData.furnished ? 'bg-primary border-primary' : `border-gray-300 ${cardBg}`
                        }`}>
                        {formData.furnished && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <Text className={`text-base ${textColor}`}>Furnished</Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                    className="mb-3"
                >
                    <LinearGradient
                        colors={['#00D9A3', '#00B87C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-4 rounded-xl items-center"
                    >
                        <Text className="text-white text-lg font-bold">
                            {loading ? 'Creating...' : 'Create Property'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className={`py-4 rounded-xl items-center border ${borderColor}`}
                >
                    <Text className={secondaryTextColor}>Cancel</Text>
                </TouchableOpacity>

                <View className="h-10" />
            </View>

            {/* Price Prediction Modal */}
            <PricePredictionModal
                visible={showPricePrediction}
                onClose={() => setShowPricePrediction(false)}
                onApplyPrice={(price) => {
                    setFormData({ ...formData, price: price.toString() });
                    showToast(`Price updated to MYR ${price.toFixed(2)}`, 'success');
                }}
                propertyData={{
                    area: parseFloat(formData.areaSqm) * 10.764, // Convert sqm to sqft
                    bathrooms: parseInt(formData.bathrooms) || 0,
                    bedrooms: parseInt(formData.bedrooms) || 0,
                    furnished: formData.furnished,
                    location: `${formData.city}, ${formData.state}`,
                    propertyType: propertyTypes.find(t => t.id === formData.propertyTypeId)?.name || '',
                }}
            />

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </ScrollView>
    );
}
