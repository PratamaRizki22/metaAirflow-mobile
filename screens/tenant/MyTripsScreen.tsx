import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { bookingService } from '../../services';

export default function MyTripsScreen({ navigation }: any) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED'>('ALL');

    useEffect(() => {
        loadBookings();
    }, [filter]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const status = filter === 'ALL' ? undefined : filter;
            const response = await bookingService.getTenantBookings(1, 20, status as any);
            setBookings(response.data.bookings);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.cancelBooking(bookingId, 'Changed plans');
                            Alert.alert('Success', 'Booking cancelled');
                            loadBookings();
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
            case 'PENDING': return '#FF9500';
            case 'APPROVED': return '#34C759';
            case 'REJECTED': return '#FF3B30';
            case 'CANCELLED': return '#999';
            case 'COMPLETED': return '#007AFF';
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>
                My Trips
            </Text>

            {/* Filter Tabs */}
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                {['ALL', 'PENDING', 'APPROVED', 'COMPLETED'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setFilter(tab as any)}
                        style={{
                            flex: 1,
                            padding: 10,
                            backgroundColor: filter === tab ? '#007AFF' : '#f0f0f0',
                            marginRight: 5,
                            borderRadius: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: 'center',
                                color: filter === tab ? 'white' : '#666',
                                fontWeight: filter === tab ? 'bold' : 'normal',
                            }}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bookings List */}
            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
                        style={{
                            padding: 15,
                            backgroundColor: '#f9f9f9',
                            marginBottom: 10,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                            {item.property.title}
                        </Text>
                        <Text style={{ color: '#666', marginBottom: 5 }}>
                            {item.property.city}, {item.property.state}
                        </Text>
                        <Text style={{ marginBottom: 5 }}>
                            Check-in: {item.checkInDate || item.startDate}
                        </Text>
                        <Text style={{ marginBottom: 10 }}>
                            Check-out: {item.checkOutDate || item.endDate}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ fontWeight: 'bold', marginRight: 10 }}>Status:</Text>
                            <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>
                                {item.status}
                            </Text>
                        </View>

                        {item.totalPrice && (
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>
                                Total: Rp {item.totalPrice.toLocaleString()}
                            </Text>
                        )}

                        {/* Cancel Button - Only for PENDING or APPROVED */}
                        {(item.status === 'PENDING' || item.status === 'APPROVED') && (
                            <TouchableOpacity
                                onPress={() => handleCancelBooking(item.id)}
                                style={{
                                    marginTop: 10,
                                    padding: 10,
                                    backgroundColor: '#FF3B30',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                                    Cancel Booking
                                </Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                        No bookings found
                    </Text>
                }
            />
        </View>
    );
}
