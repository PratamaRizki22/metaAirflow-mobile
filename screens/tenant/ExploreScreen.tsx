import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { propertyService } from '../../services';

export default function ExploreScreen({ navigation }: any) {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        city: '',
        minPrice: 0,
        maxPrice: 100000000,
    });

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getMobileProperties(1, 20, {
                ...filters,
                search: searchQuery || undefined,
            });
            setProperties(response.data.properties);
        } catch (error: any) {
            console.error('ExploreScreen - Get mobile properties error:', error);
            // Don't show Alert to prevent infinite loop
            setProperties([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadProperties();
    };

    const handlePropertyPress = (propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Loading properties...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Explore Properties
            </Text>

            {/* Search Bar */}
            <View style={{ marginBottom: 15 }}>
                <TextInput
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 10,
                    }}
                />
                <TouchableOpacity
                    onPress={handleSearch}
                    style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
                >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                        Search
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Property List */}
            <FlatList
                data={properties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handlePropertyPress(item.id)}
                        style={{
                            padding: 15,
                            backgroundColor: '#f9f9f9',
                            marginBottom: 10,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                            {item.title}
                        </Text>
                        <Text style={{ color: '#666', marginBottom: 5 }}>
                            {item.city}, {item.state}
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>
                            Rp {item.price.toLocaleString()}/month
                        </Text>
                        <Text style={{ color: '#666', marginTop: 5 }}>
                            {item.bedrooms} beds • {item.bathrooms} baths • {item.areaSqm} m²
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                        No properties found
                    </Text>
                }
            />
        </View>
    );
}
