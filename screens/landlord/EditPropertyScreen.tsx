import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAPTILER_API_KEY } from '@env';
import { propertyService, uploadService } from '../../services';

export default function EditPropertyScreen({ route, navigation }: any) {
    const { propertyId } = route.params;
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        areaSqm: '',
        furnished: false,
        isAvailable: true,
        latitude: 3.1390,
        longitude: 101.6869,
    });
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Configure MapLibre
    MapLibreGL.setAccessToken(null);

    useEffect(() => {
        loadProperty();
    }, [propertyId]);

    const loadProperty = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(propertyId);
            const property = response.data;

            setFormData({
                title: property.title,
                description: property.description,
                address: property.address,
                city: property.city,
                state: property.state,
                zipCode: property.zipCode || '',
                price: property.price.toString(),
                bedrooms: property.bedrooms.toString(),
                bathrooms: property.bathrooms.toString(),
                areaSqm: property.areaSqm.toString(),
                furnished: property.furnished || false,
                isAvailable: property.isAvailable !== false,
                latitude: property.latitude || 3.1390,
                longitude: property.longitude || 101.6869,
            });

            // Load existing images
            setExistingImages(property.images || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [16, 9],
            });

            if (!result.canceled && result.assets) {
                const uris = result.assets.map(asset => asset.uri);
                setNewImages([...newImages, ...uris]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const removeExistingImage = (index: number) => {
        const updated = [...existingImages];
        updated.splice(index, 1);
        setExistingImages(updated);
    };

    const removeNewImage = (index: number) => {
        const updated = [...newImages];
        updated.splice(index, 1);
        setNewImages(updated);
    };

    const handleMapPress = (feature: any) => {
        const coordinates = feature.geometry.coordinates;
        setFormData(prev => ({
            ...prev,
            longitude: coordinates[0],
            latitude: coordinates[1],
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter property title');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Please enter valid price');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setUpdating(true);
        try {
            // Upload new images if any
            let uploadedImageUrls: string[] = [];
            if (newImages.length > 0) {
                for (const imageUri of newImages) {
                    try {
                        const response = await uploadService.uploadImage(imageUri);
                        uploadedImageUrls.push(response.data.url);
                    } catch (uploadError) {
                        console.error('Failed to upload image:', uploadError);
                    }
                }
            }

            // Combine existing images with newly uploaded images
            const allImages = [...existingImages, ...uploadedImageUrls];

            await propertyService.updateProperty(propertyId, {
                title: formData.title,
                description: formData.description,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                price: parseFloat(formData.price),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                areaSqm: parseFloat(formData.areaSqm),
                furnished: formData.furnished,
                isAvailable: formData.isAvailable,
                latitude: formData.latitude,
                longitude: formData.longitude,
                images: allImages,
            });

            Alert.alert(
                'Success',
                'Property updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Loading property...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Edit Property
            </Text>

            {/* Title */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Property Title *
            </Text>
            <TextInput
                placeholder="e.g., Modern Apartment in KLCC"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            {/* Description */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Description *
            </Text>
            <TextInput
                placeholder="Describe your property..."
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                    textAlignVertical: 'top',
                }}
            />

            {/* Property Images */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Property Images
            </Text>

            {/* Existing Images */}
            {existingImages.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                        Current Images ({existingImages.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {existingImages.map((imageUrl, index) => (
                            <View key={`existing-${index}`} style={{ marginRight: 10, position: 'relative' }}>
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={{ width: 120, height: 120, borderRadius: 8 }}
                                />
                                <TouchableOpacity
                                    onPress={() => removeExistingImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 5,
                                        right: 5,
                                        backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                        borderRadius: 12,
                                        width: 24,
                                        height: 24,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Ionicons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: '#007AFF', marginBottom: 5 }}>
                        New Images ({newImages.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {newImages.map((imageUri, index) => (
                            <View key={`new-${index}`} style={{ marginRight: 10, position: 'relative' }}>
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: 120, height: 120, borderRadius: 8 }}
                                />
                                <TouchableOpacity
                                    onPress={() => removeNewImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 5,
                                        right: 5,
                                        backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                        borderRadius: 12,
                                        width: 24,
                                        height: 24,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Ionicons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Add Images Button */}
            <TouchableOpacity
                onPress={pickImages}
                style={{
                    borderWidth: 2,
                    borderColor: '#007AFF',
                    borderStyle: 'dashed',
                    borderRadius: 8,
                    padding: 20,
                    alignItems: 'center',
                    marginBottom: 15,
                }}
            >
                <Ionicons name="images-outline" size={32} color="#007AFF" />
                <Text style={{ color: '#007AFF', marginTop: 8, fontWeight: '600' }}>
                    {existingImages.length + newImages.length > 0 ? 'Add More Images' : 'Add Images'}
                </Text>
                <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    Tap to select from gallery
                </Text>
            </TouchableOpacity>

            {/* Address */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Address *
            </Text>
            <TextInput
                placeholder="Street address"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            {/* Map Location */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Location on Map *
            </Text>
            <TouchableOpacity
                onPress={() => setShowMap(!showMap)}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 15,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <View>
                    <Text style={{ fontWeight: '600', marginBottom: 4 }}>
                        {showMap ? 'Hide Map' : 'Show Map'}
                    </Text>
                    <Text style={{ color: '#666', fontSize: 12 }}>
                        Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                    </Text>
                </View>
                <Ionicons
                    name={showMap ? 'chevron-up' : 'location'}
                    size={24}
                    color="#007AFF"
                />
            </TouchableOpacity>

            {showMap && (
                <View style={{ height: 250, borderRadius: 8, overflow: 'hidden', marginBottom: 15 }}>
                    <MapLibreGL.MapView
                        style={{ flex: 1 }}
                        onPress={handleMapPress}
                    >
                        <MapLibreGL.RasterSource
                            id="maptiler-source-edit"
                            tileUrlTemplates={[`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`]}
                            tileSize={256}
                        >
                            <MapLibreGL.RasterLayer id="maptiler-layer-edit" sourceID="maptiler-source-edit" />
                        </MapLibreGL.RasterSource>
                        <MapLibreGL.Camera
                            centerCoordinate={[formData.longitude, formData.latitude]}
                            zoomLevel={15}
                            animationDuration={1000}
                        />
                        <MapLibreGL.PointAnnotation
                            id="property-location-edit"
                            coordinate={[formData.longitude, formData.latitude]}
                        >
                            <View style={{
                                backgroundColor: '#EF4444',
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: 'white',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <View style={{ backgroundColor: 'white', width: 8, height: 8, borderRadius: 4 }} />
                            </View>
                        </MapLibreGL.PointAnnotation>
                    </MapLibreGL.MapView>
                    <View style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: 8,
                        borderRadius: 4,
                    }}>
                        <Text style={{ color: 'white', fontSize: 11, textAlign: 'center' }}>
                            Tap anywhere on the map to update property location
                        </Text>
                    </View>
                </View>
            )}

            {/* City & State */}
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                        City *
                    </Text>
                    <TextInput
                        placeholder="City"
                        value={formData.city}
                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            padding: 12,
                            borderRadius: 8,
                        }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                        State *
                    </Text>
                    <TextInput
                        placeholder="State"
                        value={formData.state}
                        onChangeText={(text) => setFormData({ ...formData, state: text })}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            padding: 12,
                            borderRadius: 8,
                        }}
                    />
                </View>
            </View>

            {/* Price */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Monthly Price (IDR) *
            </Text>
            <TextInput
                placeholder="e.g., 5000000"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            {/* Bedrooms, Bathrooms, Area */}
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                <View style={{ flex: 1, marginRight: 5 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>
                        Bedrooms *
                    </Text>
                    <TextInput
                        placeholder="3"
                        value={formData.bedrooms}
                        onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            padding: 12,
                            borderRadius: 8,
                        }}
                    />
                </View>
                <View style={{ flex: 1, marginRight: 5 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>
                        Bathrooms *
                    </Text>
                    <TextInput
                        placeholder="2"
                        value={formData.bathrooms}
                        onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            padding: 12,
                            borderRadius: 8,
                        }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>
                        Area (m²) *
                    </Text>
                    <TextInput
                        placeholder="120"
                        value={formData.areaSqm}
                        onChangeText={(text) => setFormData({ ...formData, areaSqm: text })}
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            padding: 12,
                            borderRadius: 8,
                        }}
                    />
                </View>
            </View>

            {/* Furnished */}
            <TouchableOpacity
                onPress={() => setFormData({ ...formData, furnished: !formData.furnished })}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            >
                <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: formData.furnished ? '#007AFF' : '#ddd',
                    backgroundColor: formData.furnished ? '#007AFF' : 'white',
                    marginRight: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {formData.furnished && <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>}
                </View>
                <Text style={{ fontSize: 16 }}>Furnished</Text>
            </TouchableOpacity>

            {/* Available */}
            <TouchableOpacity
                onPress={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    marginBottom: 20,
                }}
            >
                <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: formData.isAvailable ? '#34C759' : '#ddd',
                    backgroundColor: formData.isAvailable ? '#34C759' : 'white',
                    marginRight: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {formData.isAvailable && <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>}
                </View>
                <Text style={{ fontSize: 16 }}>Available for Rent</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
                title={updating ? 'Updating...' : 'Update Property'}
                onPress={handleSubmit}
                disabled={updating}
                color="#34C759"
            />

            <View style={{ height: 20 }} />

            <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                color="#999"
            />

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}
