import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { propertyService } from '../../services';

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
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

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
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
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
