import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from '../../hooks';

interface ImagePickerSectionProps {
    uniqueId?: string; // e.g. 'create-property' or 'edit-property'
    selectedImages: string[];
    onImagesSelected: (uris: string[]) => void;
    onRemoveImage: (index: number) => void;
    uploading?: boolean;
    label?: string;
    existingImages?: string[]; // For edit mode
    onRemoveExistingImage?: (index: number) => void;
    maxImages?: number;
    minImages?: number;
}

export function ImagePickerSection({
    selectedImages,
    onImagesSelected,
    onRemoveImage,
    uploading = false,
    label = 'Property Images',
    existingImages = [],
    onRemoveExistingImage,
    maxImages = 8,
    minImages = 4
}: ImagePickerSectionProps) {
    const { cardBg, textColor, secondaryTextColor, borderColor, isDark } = useThemeColors();
    const totalImages = selectedImages.length + existingImages.length;
    const remainingSlots = maxImages - totalImages;

    const pickImages = async () => {
        if (remainingSlots <= 0) {
            alert(`You can only upload up to ${maxImages} images.`);
            return;
        }

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: remainingSlots, // Enforce limit in native picker if supported
                quality: 0.8,
                aspect: [16, 9],
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => asset.uri);

                // Double check limit manually
                if (newImages.length > remainingSlots) {
                    alert(`You can only select ${remainingSlots} more images.`);
                    onImagesSelected(newImages.slice(0, remainingSlots));
                } else {
                    onImagesSelected(newImages);
                }
            }
        } catch (error) {
            console.error('Pick images failed', error);
        }
    };

    return (
        <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3">
                <Text className={`text-base font-semibold ${textColor}`}>
                    {label} <Text className="text-red-500">*</Text>
                </Text>
                <Text className={`text-sm ${totalImages < minImages ? 'text-orange-500' : totalImages >= maxImages ? 'text-red-500' : secondaryTextColor}`}>
                    {totalImages}/{maxImages}
                </Text>
            </View>

            {/* Pick Button */}
            <TouchableOpacity
                onPress={pickImages}
                disabled={totalImages >= maxImages}
                className={`border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'} rounded-xl p-6 items-center ${cardBg} mb-4 ${totalImages >= maxImages ? 'opacity-50' : ''}`}
            >
                <Ionicons name="images-outline" size={40} color={totalImages >= maxImages ? '#6B7280' : '#00D9A3'} />
                <Text className={`${totalImages >= maxImages ? secondaryTextColor : 'text-primary'} mt-2 font-semibold`}>
                    {totalImages >= maxImages ? 'Limit Reached' : 'Tap to select images'}
                </Text>
                <Text className={`text-xs mt-1 ${secondaryTextColor}`}>
                    Min {minImages}, Max {maxImages} images
                </Text>
            </TouchableOpacity>

            {/* Existing Images (Edit Mode) */}
            {existingImages.length > 0 && (
                <View className="mb-4">
                    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                        Current Images ({existingImages.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {existingImages.map((uri, index) => (
                            <View key={`existing-${index}`} className="mr-3 relative">
                                <Image
                                    source={{ uri }}
                                    className="w-24 h-24 rounded-xl"
                                />
                                {onRemoveExistingImage && (
                                    <TouchableOpacity
                                        onPress={() => onRemoveExistingImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border border-white"
                                    >
                                        <Ionicons name="close" size={16} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* New Selected Images */}
            {selectedImages.length > 0 && (
                <View className="mb-4">
                    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                        New Selected Images ({selectedImages.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedImages.map((uri, index) => (
                            <View key={`new-${index}`} className="mr-3 relative">
                                <Image
                                    source={{ uri }}
                                    className="w-24 h-24 rounded-xl"
                                />
                                <TouchableOpacity
                                    onPress={() => onRemoveImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border border-white"
                                >
                                    <Ionicons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {uploading && (
                <View className="flex-row items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <ActivityIndicator size="small" color="#00D9A3" />
                    <Text className="ml-2 text-primary font-medium">
                        Uploading images...
                    </Text>
                </View>
            )}
        </View>
    );
}
