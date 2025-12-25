import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { propertyService, uploadService } from '../../services';
import { useThemeColors } from '../../hooks';
import { LoadingState } from '../../components/common';

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
    });
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        loadPropertyTypes();
    }, []);

    const loadPropertyTypes = async () => {
        try {
            const response = await propertyService.getPropertyTypes();
            setPropertyTypes(response.data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [16, 9],
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => asset.uri);
                setSelectedImages([...selectedImages, ...newImages]);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(newImages);
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
            Alert.alert('Upload Error', error.message || 'Failed to upload images');
            return [];
        } finally {
            setUploadingImages(false);
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter property title');
            return false;
        }
        if (!formData.description.trim()) {
            Alert.alert('Error', 'Please enter description');
            return false;
        }
        if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
            Alert.alert('Error', 'Please enter complete address');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Please enter valid price');
            return false;
        }
        if (!formData.bedrooms || parseInt(formData.bedrooms) <= 0) {
            Alert.alert('Error', 'Please enter number of bedrooms');
            return false;
        }
        if (!formData.bathrooms || parseInt(formData.bathrooms) <= 0) {
            Alert.alert('Error', 'Please enter number of bathrooms');
            return false;
        }
        if (!formData.areaSqm || parseFloat(formData.areaSqm) <= 0) {
            Alert.alert('Error', 'Please enter property area');
            return false;
        }
        if (!formData.propertyTypeId) {
            Alert.alert('Error', 'Please select property type');
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
            Alert.alert('Error', error.message);
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
            });

            Alert.alert(
                'Success',
                'Property created successfully!',
                [
                    {
                        text: 'View Dashboard',
                        onPress: () => navigation.navigate('HostingDashboard')
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
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
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                        Property Title <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        placeholder="e.g., Modern Apartment in KLCC"
                        placeholderTextColor="#9CA3AF"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                    />
                </View>

                {/* Description */}
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                        Description <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        placeholder="Describe your property..."
                        placeholderTextColor="#9CA3AF"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        multiline
                        numberOfLines={4}
                        className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                        style={{ textAlignVertical: 'top' }}
                    />
                </View>

                {/* Address */}
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                        Address <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        placeholder="Street address"
                        placeholderTextColor="#9CA3AF"
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                    />
                </View>

                {/* City & State */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                            City <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            placeholder="City"
                            placeholderTextColor="#9CA3AF"
                            value={formData.city}
                            onChangeText={(text) => setFormData({ ...formData, city: text })}
                            className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                            State <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            placeholder="State"
                            placeholderTextColor="#9CA3AF"
                            value={formData.state}
                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                            className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                        />
                    </View>
                </View>

                {/* Price */}
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-2 ${textColor}`}>
                        Monthly Price (MYR) <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        placeholder="e.g., 2500"
                        placeholderTextColor="#9CA3AF"
                        value={formData.price}
                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                        keyboardType="numeric"
                        className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                    />
                </View>

                {/* Bedrooms, Bathrooms, Area */}
                <View className="flex-row gap-2 mb-4">
                    <View className="flex-1">
                        <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                            Beds <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            placeholder="3"
                            placeholderTextColor="#9CA3AF"
                            value={formData.bedrooms}
                            onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                            keyboardType="numeric"
                            className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                            Baths <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            placeholder="2"
                            placeholderTextColor="#9CA3AF"
                            value={formData.bathrooms}
                            onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                            keyboardType="numeric"
                            className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                            Area (m²) <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            placeholder="120"
                            placeholderTextColor="#9CA3AF"
                            value={formData.areaSqm}
                            onChangeText={(text) => setFormData({ ...formData, areaSqm: text })}
                            keyboardType="numeric"
                            className={`${cardBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                        />
                    </View>
                </View>

                {/* Property Images */}
                <View className="mb-4">
                    <Text className={`text-base font-semibold mb-3 ${textColor}`}>
                        Property Images
                    </Text>
                    <TouchableOpacity
                        onPress={pickImages}
                        className={`border-2 border-dashed border-primary rounded-xl p-6 items-center ${cardBg}`}
                    >
                        <Ionicons name="images-outline" size={40} color="#14B8A6" />
                        <Text className="text-primary mt-2 font-semibold">
                            Tap to select images
                        </Text>
                        <Text className={`text-xs mt-1 ${secondaryTextColor}`}>
                            You can select multiple images
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Image Previews */}
                {selectedImages.length > 0 && (
                    <View className="mb-4">
                        <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                            Selected Images ({selectedImages.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedImages.map((uri, index) => (
                                <View key={index} className="mr-3 relative">
                                    <Image
                                        source={{ uri }}
                                        className="w-24 h-24 rounded-xl"
                                    />
                                    <TouchableOpacity
                                        onPress={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                                    >
                                        <Ionicons name="close" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {uploadingImages && (
                    <View className="flex-row items-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <Ionicons name="cloud-upload-outline" size={20} color="#14B8A6" />
                        <Text className="ml-2 text-primary font-medium">
                            Uploading images...
                        </Text>
                    </View>
                )}

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
                        colors={['#14B8A6', '#0D9488']}
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
        </ScrollView>
    );
}
