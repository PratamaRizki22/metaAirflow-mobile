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
}

export function ImagePickerSection({
    selectedImages,
    onImagesSelected,
    onRemoveImage,
    uploading = false,
    label = 'Property Images',
    existingImages = [],
    onRemoveExistingImage
}: ImagePickerSectionProps) {
    const { cardBg, textColor, secondaryTextColor, borderColor, isDark } = useThemeColors();

    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                // Handle permission denial potentially via a callback or alert in parent
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
                onImagesSelected(newImages);
            }
        } catch (error) {
            console.error('Pick images failed', error);
        }
    };

    return (
        <View className="mb-4">
            <Text className={`text-base font-semibold mb-3 ${textColor}`}>
                {label}
            </Text>

            {/* Pick Button */}
            <TouchableOpacity
                onPress={pickImages}
                className={`border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'} rounded-xl p-6 items-center ${cardBg} mb-4`}
            >
                <Ionicons name="images-outline" size={40} color="#00D9A3" />
                <Text className="text-primary mt-2 font-semibold">
                    Tap to select images
                </Text>
                <Text className={`text-xs mt-1 ${secondaryTextColor}`}>
                    You can select multiple images
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
