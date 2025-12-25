import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { authService, uploadService } from '../../services';

export default function EditProfileScreen({ navigation }: any) {
    const { user, refreshProfile } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
    });
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth || '',
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
        if (formData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
            Alert.alert('Error', 'Date of birth must be in format YYYY-MM-DD');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Upload profile picture if changed
            const avatarUrl = await uploadProfilePicture();

            const updateData: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
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
        <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Edit Profile
            </Text>

            {/* Profile Picture */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={pickProfilePicture} style={{ position: 'relative' }}>
                    {profilePicture ? (
                        <Image
                            source={{ uri: profilePicture }}
                            style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E5E5' }}
                        />
                    ) : (
                        <View style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: '#007AFF',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Text style={{ color: 'white', fontSize: 48, fontWeight: 'bold' }}>
                                {user?.firstName?.[0] || 'U'}
                            </Text>
                        </View>
                    )}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#007AFF',
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 3,
                        borderColor: 'white',
                    }}>
                        <Ionicons name="camera" size={18} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={{ marginTop: 8, color: '#666' }}>Tap to change photo</Text>
                {uploadingPicture && (
                    <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 8 }} />
                )}
            </View>

            {/* Email (Read-only) */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Email
            </Text>
            <View style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 12,
                borderRadius: 8,
                marginBottom: 15,
                backgroundColor: '#f5f5f5',
            }}>
                <Text style={{ color: '#666' }}>{user?.email}</Text>
            </View>

            {/* First Name */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                First Name *
            </Text>
            <TextInput
                placeholder="John"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            {/* Last Name */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Last Name *
            </Text>
            <TextInput
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            {/* Phone */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Phone Number
            </Text>
            <TextInput
                placeholder="+62 812 3456 7890"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            {/* Date of Birth */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Date of Birth
            </Text>
            <TextInput
                placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 20,
                }}
            />

            {/* Submit Button */}
            <Button
                title={loading ? 'Updating...' : 'Update Profile'}
                onPress={handleSubmit}
                disabled={loading}
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
