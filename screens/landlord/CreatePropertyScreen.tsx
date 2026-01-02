import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAPTILER_API_KEY } from '@env';
import { propertyService, uploadService, propertyTypeService, amenityService, agreementService } from '../../services';
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
    const [searchLocation, setSearchLocation] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingLocation, setSearchingLocation] = useState(false);
    const [markerCoordinate, setMarkerCoordinate] = useState([101.6869, 3.1390]);
    const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);

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
            showToast(error.message || 'Failed to load property types', 'error');
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
        console.log('Map pressed at:', coordinates);
        
        const newLng = coordinates[0];
        const newLat = coordinates[1];
        
        setMarkerCoordinate([newLng, newLat]);
        setFormData(prev => ({
            ...prev,
            longitude: newLng,
            latitude: newLat,
        }));
        
        console.log('Marker updated to:', [newLng, newLat]);
        showToast(
            `Location updated: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}`,
            'success'
        );
    };

    const searchLocationByQuery = async (query: string) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchingLocation(true);
            const response = await fetch(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data.features || []);
        } catch (error) {
            console.error('Location search error:', error);
            showToast('Failed to search location', 'error');
        } finally {
            setSearchingLocation(false);
        }
    };

    const selectSearchResult = (result: any) => {
        const [lng, lat] = result.center;
        setFormData(prev => ({
            ...prev,
            longitude: lng,
            latitude: lat,
        }));
        setMarkerCoordinate([lng, lat]);
        setSearchLocation(result.place_name || '');
        setSearchResults([]);
        showToast('Location selected', 'success');
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
            console.log('Starting image upload for files:', selectedImages.length);
            const response = await uploadService.uploadImages(selectedImages, true);

            if (response.success && response.data.files) {
                const uploadedUrls = response.data.files.map(file => file.url);
                console.log('Images uploaded successfully:', uploadedUrls.length);
                setUploadedImageUrls(uploadedUrls);
                return uploadedUrls;
            }

            return [];
        } catch (error: any) {
            console.error('Image upload failed:', error);
            showToast(error.message || 'Failed to upload images', 'error');
            return [];
        } finally {
            setUploadingImages(false);
        }
    };


    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];

                // VALIDATION: Max 5MB
                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert('File Too Large', 'Please upload a PDF file smaller than 5MB.');
                    return;
                }

                setLoading(true);
                showToast('Extracting text from PDF...', 'info');

                try {
                    const extracted = await agreementService.extractText(file);
                    setFormData(prev => ({
                        ...prev,
                        description: prev.description + '\n\n=== HOUSE RULES / AGREEMENT ===\n' + extracted.text
                    }));
                    showToast('Text extracted successfully', 'success');
                } catch (error: any) {
                    showToast('Failed to extract text: ' + error.message, 'error');
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Pick document error:', error);
        }
    };

    const handleAnalyzeAgreement = async () => {
        if (!formData.description) return;

        try {
            setAnalyzing(true);
            const result = await agreementService.analyze(formData.description);
            setAnalysisResult(result.analysis);

            Alert.alert(
                'AI Analysis',
                result.analysis,
                [{ text: 'Close' }]
            );
        } catch (error: any) {
            showToast('Analysis failed: ' + error.message, 'error');
        } finally {
            setAnalyzing(false);
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
        if (selectedImages.length < 4) {
            showToast('Please add at least 4 images', 'error');
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
                currencyCode: 'RM',
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
            showToast(error.message || 'Failed to create property', 'error');
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
                    
                    {/* Search Location Input */}
                    <View className="mb-3">
                        <View className={`${cardBg} border ${borderColor} rounded-xl flex-row items-center px-4`}>
                            <Ionicons name="search" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
                            <TextInput
                                placeholder="Search location..."
                                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                                value={searchLocation}
                                onChangeText={(text) => {
                                    setSearchLocation(text);
                                    searchLocationByQuery(text);
                                }}
                                className={`flex-1 py-3 px-3 ${textColor}`}
                            />
                            {searchingLocation && (
                                <ActivityIndicator size="small" color={isDark ? '#94A3B8' : '#6B7280'} />
                            )}
                        </View>
                        
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <View className={`${cardBg} border ${borderColor} rounded-xl mt-2 overflow-hidden`}>
                                {searchResults.map((result, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => selectSearchResult(result)}
                                        className={`p-3 flex-row items-center ${index > 0 ? `border-t ${borderColor}` : ''}`}
                                    >
                                        <Ionicons name="location-outline" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
                                        <Text className={`flex-1 ml-3 ${textColor}`} numberOfLines={2}>
                                            {result.place_name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

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
                                mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`}
                                logoEnabled={false}
                                attributionEnabled={false}
                                onPress={handleMapPress}
                            >
                                <MapLibreGL.Camera
                                    key={`camera-${markerCoordinate[0]}-${markerCoordinate[1]}`}
                                    centerCoordinate={markerCoordinate}
                                    zoomLevel={15}
                                    animationDuration={500}
                                />
                                <MapLibreGL.PointAnnotation
                                    key={`marker-${markerCoordinate[0]}-${markerCoordinate[1]}`}
                                    id="property-location"
                                    coordinate={markerCoordinate}
                                >
                                    <View style={styles.markerContainer}>
                                        <Text style={styles.markerText}>
                                            📍 Location
                                        </Text>
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
                    <TouchableOpacity
                        onPress={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
                        className={`${cardBg} border ${borderColor} rounded-xl p-4 flex-row items-center justify-between`}
                    >
                        <Text className={formData.propertyTypeId ? textColor : secondaryTextColor}>
                            {formData.propertyTypeId 
                                ? propertyTypes.find(t => t.id === formData.propertyTypeId)?.name 
                                : 'Select property type'}
                        </Text>
                        <Ionicons 
                            name={showPropertyTypeDropdown ? 'chevron-up' : 'chevron-down'} 
                            size={20} 
                            color={isDark ? '#94A3B8' : '#6B7280'} 
                        />
                    </TouchableOpacity>
                    
                    {showPropertyTypeDropdown && (
                        <View className={`${cardBg} border ${borderColor} rounded-xl mt-2 overflow-hidden`}>
                            {propertyTypes.map((type, index) => (
                                <TouchableOpacity
                                    key={type.id}
                                    onPress={() => {
                                        setFormData({ ...formData, propertyTypeId: type.id });
                                        setShowPropertyTypeDropdown(false);
                                    }}
                                    className={`p-4 flex-row items-center justify-between ${
                                        index > 0 ? `border-t ${borderColor}` : ''
                                    } ${formData.propertyTypeId === type.id ? 'bg-primary/10' : ''}`}
                                >
                                    <Text className={`font-medium ${
                                        formData.propertyTypeId === type.id ? 'text-primary' : textColor
                                    }`}>
                                        {type.name}
                                    </Text>
                                    {formData.propertyTypeId === type.id && (
                                        <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
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

                {/* Rental Agreement Section */}
                <View className="mb-6">
                    <Text className={`text-lg font-bold mb-2 ${textColor}`}>
                        Rental Agreement & House Rules
                    </Text>

                    <Text className={`text-sm mb-4 ${secondaryTextColor}`}>
                        Upload a professional PDF agreement or write your house rules manually
                    </Text>

                    {/* PRIMARY: Upload PDF Button */}
                    <TouchableOpacity
                        onPress={handlePickDocument}
                        activeOpacity={0.7}
                        className="mb-4"
                    >
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="p-4 rounded-xl"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-white/20 p-3 rounded-lg mr-3">
                                        <Ionicons name="document-text" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-base mb-1">
                                            Upload PDF Agreement
                                        </Text>
                                        <Text className="text-white/80 text-xs">
                                            Recommended • Professional & Legally Binding
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="cloud-upload-outline" size={24} color="white" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
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

                {/* AI Price Suggestion & Price Input - AT THE BOTTOM */}
                <View className="mb-6">
                    {/* AI Price Suggestion Button */}
                    {formData.bedrooms && formData.bathrooms && formData.areaSqm && formData.city && formData.propertyTypeId && (
                        <TouchableOpacity
                            onPress={() => setShowPricePrediction(true)}
                            className="mb-3"
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

                    {/* Monthly Price Input */}
                    <FormInput
                        label="Monthly Price (RM)"
                        required
                        placeholder="e.g., 2500"
                        value={formData.price}
                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                        keyboardType="numeric"
                        containerStyle={{ marginBottom: 0 }}
                    />
                </View>

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
                    showToast(`Price updated to RM ${price.toFixed(2)}`, 'success');
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
        </ScrollView >
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
