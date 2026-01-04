import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { authService, uploadService } from '../../services';
import { useThemeColors } from '../../hooks';
import { Button } from '../../components/common';

export default function EditProfileScreen({ navigation }: any) {
    const { user, refreshProfile } = useAuth();
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
    });
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';
    const borderColor = isDark ? 'border-border-dark' : 'border-border-light';

    useEffect(() => {
        if (user) {
            // Convert dateOfBirth from ISO format to YYYY-MM-DD
            let formattedDate = '';
            if (user.dateOfBirth) {
                try {
                    const date = new Date(user.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        formattedDate = `${year}-${month}-${day}`;
                    }
                } catch (e) {
                    console.warn('Error formatting date from user data:', e);
                    formattedDate = '';
                }
            }

            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                dateOfBirth: formattedDate,
            });
            setProfilePicture(user.avatar || null);
        }
    }, [user]);

    const pickProfilePicture = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setProfilePicture(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadProfilePicture = async (): Promise<string | null> => {
        if (!profilePicture || profilePicture === user?.avatar) return null;

        try {
            setUploadingPicture(true);
            const response = await uploadService.uploadProfilePicture(profilePicture);
            if (response.success && response.data.url) {
                return response.data.url;
            }
            return null;
        } catch (error: any) {
            Alert.alert('Upload Error', error.message);
            return null;
        } finally {
            setUploadingPicture(false);
        }
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) {
            Alert.alert('Error', 'Please enter your first name');
            return false;
        }
        if (!formData.lastName.trim()) {
            Alert.alert('Error', 'Please enter your last name');
            return false;
        }
        if (formData.dateOfBirth) {
            const trimmedDate = formData.dateOfBirth.trim();
            console.log('Validating date:', JSON.stringify(trimmedDate), 'Length:', trimmedDate.length);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
                console.error('Date validation failed for:', trimmedDate);
                Alert.alert('Error', `Date of birth must be in format YYYY-MM-DD\n\nCurrent value: "${trimmedDate}"`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Upload profile picture if changed
            const avatarUrl = await uploadProfilePicture();

            // Format date of birth to YYYY-MM-DD if it exists
            let formattedDateOfBirth = formData.dateOfBirth ? formData.dateOfBirth.trim() : undefined;
            if (formattedDateOfBirth) {
                console.log('Processing date:', JSON.stringify(formattedDateOfBirth));
                try {
                    // Try to parse and format the date
                    const date = new Date(formattedDateOfBirth);
                    if (!isNaN(date.getTime())) {
                        // Format to YYYY-MM-DD
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        formattedDateOfBirth = `${year}-${month}-${day}`;
                        console.log('Formatted date:', formattedDateOfBirth);
                    }
                } catch (e) {
                    console.warn('Date parsing error:', e);
                }
            }

            const updateData: any = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phone: formData.phone?.trim() || undefined,
                dateOfBirth: formattedDateOfBirth || undefined,
            };

            if (avatarUrl) {
                updateData.avatar = avatarUrl;
            }

            await authService.updateProfile(updateData);
            await refreshProfile();

            Alert.alert(
                'Success',
                'Profile updated successfully!',
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
            setLoading(false);
        }
    };

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="px-6 py-8">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Edit Profile
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-8">
                    Update your personal information
                </Text>

                {/* Profile Picture */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickProfilePicture} className="relative">
                        {profilePicture ? (
                            <Image
                                source={{ uri: profilePicture }}
                                className="w-32 h-32 rounded-full"
                                style={{ backgroundColor: isDark ? '#374151' : '#E5E5E5' }}
                            />
                        ) : (
                            <View className="w-32 h-32 rounded-full bg-primary items-center justify-center">
                                <Text className="text-white text-5xl font-bold">
                                    {user?.firstName?.[0] || 'U'}
                                </Text>
                            </View>
                        )}
                        <View className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center border-4"
                            style={{ borderColor: isDark ? '#0F172A' : '#FFFFFF' }}>
                            <Ionicons name="camera" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                        Tap to change photo
                    </Text>
                    {uploadingPicture && (
                        <ActivityIndicator size="small" color="#00D9A3" className="mt-2" />
                    )}
                </View>

                {/* Email (Read-only) */}
                <View className="mb-4">
                    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                        Email
                    </Text>
                    <View className={`${inputBg} border ${borderColor} rounded-xl px-4 py-3`}
                        style={{ opacity: 0.6 }}>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                            {user?.email}
                        </Text>
                    </View>
                </View>

                {/* First Name */}
                <View className="mb-4">
                    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                        First Name *
                    </Text>
                    <TextInput
                        placeholder="John"
                        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                        className={`${inputBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                    />
                </View>

                {/* Last Name */}
                <View className="mb-4">
                    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                        Last Name *
                    </Text>
                    <TextInput
                        placeholder="Doe"
                        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        className={`${inputBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                    />
                </View>

                {/* Phone */}
                <View className="mb-4">
                    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                        Phone Number
                    </Text>
                    <TextInput
                        placeholder="+62 812 3456 7890"
                        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        keyboardType="phone-pad"
                        className={`${inputBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                    />
                </View>

                {/* Date of Birth */}
                <View className="mb-6">
                    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>
                        Date of Birth
                    </Text>
                    <TextInput
                        placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                        placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                        value={(() => {
                            if (!formData.dateOfBirth) return '';
                            try {
                                const date = new Date(formData.dateOfBirth);
                                if (isNaN(date.getTime())) return formData.dateOfBirth;
                                return date.toISOString().split('T')[0];
                            } catch {
                                return formData.dateOfBirth;
                            }
                        })()}
                        onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                        className={`${inputBg} border ${borderColor} rounded-xl px-4 py-3 ${textColor}`}
                    />
                </View>

                {/* Submit Button */}
                {/* Submit Button */}
                <View className="mb-3">
                    <Button
                        onPress={handleSubmit}
                        loading={loading}
                        variant="primary"
                        fullWidth
                    >
                        UPDATE PROFILE
                    </Button>
                </View>

                {/* Cancel Button */}
                <Button
                    onPress={() => navigation.goBack()}
                    variant="secondary"
                    fullWidth
                    className={isDark ? 'bg-gray-800' : 'bg-gray-200'}
                >
                    <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>CANCEL</Text>
                </Button>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </View>
        </ScrollView>
    );
}
