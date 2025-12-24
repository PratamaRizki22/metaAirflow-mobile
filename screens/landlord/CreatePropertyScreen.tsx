import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { propertyService, uploadService } from '../../services';

export default function CreatePropertyScreen({ navigation }: any) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: 'Indonesia',
        zipCode: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        areaSqm: '',
        furnished: false,
        propertyTypeId: '',
    });
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
            await propertyService.createProperty({
                title: formData.title,
                description: formData.description,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                zipCode: formData.zipCode,
                price: parseFloat(formData.price),
                currencyCode: 'IDR',
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                areaSqm: parseFloat(formData.areaSqm),
                furnished: formData.furnished,
                isAvailable: true,
                propertyTypeId: formData.propertyTypeId,
                images: [], // TODO: Add image upload
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

    return (
        <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Add New Property
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

            {/* Property Type */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                Property Type *
            </Text>
            <View style={{ marginBottom: 15 }}>
                {propertyTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        onPress={() => setFormData({ ...formData, propertyTypeId: type.id })}
                        style={{
                            padding: 12,
                            borderWidth: 1,
                            borderColor: formData.propertyTypeId === type.id ? '#007AFF' : '#ddd',
                            backgroundColor: formData.propertyTypeId === type.id ? '#E3F2FD' : 'white',
                            borderRadius: 8,
                            marginBottom: 8,
                        }}
                    >
                        <Text style={{
                            fontWeight: formData.propertyTypeId === type.id ? 'bold' : 'normal',
                            color: formData.propertyTypeId === type.id ? '#007AFF' : '#333',
                        }}>
                            {type.name}
                        </Text>
                    </TouchableOpacity>
                ))}
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
                    marginBottom: 20,
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

            {/* Submit Button */}
            <Button
                title={loading ? 'Creating...' : 'Create Property'}
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
