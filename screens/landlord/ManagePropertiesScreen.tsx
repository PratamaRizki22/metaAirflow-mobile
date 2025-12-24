import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { propertyService } from '../../services';

export default function ManagePropertiesScreen({ navigation }: any) {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getMyProperties(1, 50);
            setProperties(response.data.properties);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProperty = (propertyId: string, title: string) => {
        Alert.alert(
            'Delete Property',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await propertyService.deleteProperty(propertyId);
                            Alert.alert('Success', 'Property deleted');
                            loadProperties();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return '#34C759';
            case 'PENDING_REVIEW': return '#FF9500';
            case 'INACTIVE': return '#999';
            case 'REJECTED': return '#FF3B30';
            default: return '#666';
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                    My Properties
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateProperty')}
                    style={{
                        backgroundColor: '#007AFF',
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 8,
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={properties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 15,
                            backgroundColor: '#f9f9f9',
                            marginBottom: 10,
                            borderRadius: 8,
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', flex: 1 }}>
                                {item.title}
                            </Text>
                            <View style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 4,
                                backgroundColor: getStatusColor(item.status),
                            }}>
                                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>

                        <Text style={{ color: '#666', marginBottom: 5 }}>
                            {item.city}, {item.state}
                        </Text>

                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginBottom: 5 }}>
                            Rp {item.price.toLocaleString()}/month
                        </Text>

                        <Text style={{ color: '#666', marginBottom: 10 }}>
                            {item.bedrooms} beds • {item.bathrooms} baths • {item.areaSqm} m²
                        </Text>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    backgroundColor: '#007AFF',
                                    borderRadius: 8,
                                    marginRight: 5,
                                }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                                    View
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleDeleteProperty(item.id, item.title)}
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    backgroundColor: '#FF3B30',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ fontSize: 18, color: '#999', marginBottom: 15 }}>
                            No properties yet
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreateProperty')}
                            style={{
                                backgroundColor: '#007AFF',
                                paddingHorizontal: 20,
                                paddingVertical: 12,
                                borderRadius: 8,
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                Add Your First Property
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}
