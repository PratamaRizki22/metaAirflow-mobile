import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, ActivityIndicator, Alert } from 'react-native';
import { propertyService, favoriteService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

export default function PropertyDetailScreen({ route, navigation }: any) {
    const { propertyId } = route.params;
    const { isLoggedIn } = useAuth();
    const [property, setProperty] = useState<any>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPropertyDetail();
    }, [propertyId]);

    const loadPropertyDetail = async () => {
        try {
            setLoading(true);

            // Load property detail
            const response = await propertyService.getPropertyById(propertyId);
            setProperty(response.data);

            // Check if favorited (only if logged in)
            if (isLoggedIn) {
                const favStatus = await favoriteService.isFavorited(propertyId);
                setIsFavorited(favStatus);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isLoggedIn) {
            Alert.alert('Login Required', 'Please login to save favorites');
            return;
        }

        try {
            const result = await favoriteService.toggleFavorite(propertyId);
            setIsFavorited(result.isFavorited);
            Alert.alert('Success', result.message);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleBookNow = () => {
        if (!isLoggedIn) {
            Alert.alert('Login Required', 'Please login to book this property');
            return;
        }

        navigation.navigate('CreateBooking', {
            propertyId: property.id,
            propertyTitle: property.title,
            price: property.price,
        });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!property) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Property not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
                {/* Title */}
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                    {property.title}
                </Text>

                {/* Location */}
                <Text style={{ fontSize: 16, color: '#666', marginBottom: 15 }}>
                    {property.address}, {property.city}, {property.state}
                </Text>

                {/* Price */}
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 15 }}>
                    Rp {property.price.toLocaleString()}/month
                </Text>

                {/* Property Info */}
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View style={{ flex: 1, padding: 10, backgroundColor: '#f0f0f0', marginRight: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>{property.bedrooms}</Text>
                        <Text style={{ color: '#666' }}>Bedrooms</Text>
                    </View>
                    <View style={{ flex: 1, padding: 10, backgroundColor: '#f0f0f0', marginRight: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>{property.bathrooms}</Text>
                        <Text style={{ color: '#666' }}>Bathrooms</Text>
                    </View>
                    <View style={{ flex: 1, padding: 10, backgroundColor: '#f0f0f0' }}>
                        <Text style={{ fontWeight: 'bold' }}>{property.areaSqm} m²</Text>
                        <Text style={{ color: '#666' }}>Area</Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                    Description
                </Text>
                <Text style={{ fontSize: 16, color: '#666', marginBottom: 20, lineHeight: 24 }}>
                    {property.description}
                </Text>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                    <>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Amenities
                        </Text>
                        <View style={{ marginBottom: 20 }}>
                            {property.amenities.map((amenity: any) => (
                                <Text key={amenity.id} style={{ fontSize: 16, marginBottom: 5 }}>
                                    • {amenity.name}
                                </Text>
                            ))}
                        </View>
                    </>
                )}

                {/* Owner Info */}
                {property.owner && (
                    <>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Owner
                        </Text>
                        <Text style={{ fontSize: 16, marginBottom: 20 }}>
                            {property.owner.firstName} {property.owner.lastName}
                        </Text>
                    </>
                )}

                {/* Action Buttons */}
                <View style={{ marginTop: 20 }}>
                    <Button
                        title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                        onPress={handleToggleFavorite}
                        color={isFavorited ? "#FF3B30" : "#007AFF"}
                    />
                    <View style={{ height: 10 }} />
                    <Button
                        title="Book Now"
                        onPress={handleBookNow}
                        color="#34C759"
                    />
                </View>
            </View>
        </ScrollView>
    );
}
