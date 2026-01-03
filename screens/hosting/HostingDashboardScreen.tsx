import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, ActivityIndicator } from 'react-native';
import { propertyService, bookingService } from '../../services';

export default function HostingDashboardScreen({ navigation }: any) {
    const [properties, setProperties] = useState<any[]>([]);
    const [bookingRequests, setBookingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHostingData();
    }, []);

    const loadHostingData = async () => {
        try {
            setLoading(true);

            // Load my properties
            const propsResponse = await propertyService.getMyProperties(1, 10);
            setProperties(propsResponse?.data?.properties || []);

            // Load pending booking requests
            const bookingsResponse = await bookingService.getBookings(1, 10, 'PENDING', 'owner');
            setBookingRequests(bookingsResponse.data.bookings);
        } catch (error: any) {
            Alert.alert('Error', error.message);
            setProperties([]);
            setBookingRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveBooking = async (bookingId: string) => {
        try {
            await bookingService.approveBooking(bookingId);
            Alert.alert('Berhasil', 'Booking telah disetujui');
            loadHostingData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleRejectBooking = async (bookingId: string) => {
        try {
            await bookingService.rejectBooking(bookingId, 'Properti tidak tersedia');
            Alert.alert('Berhasil', 'Booking telah ditolak');
            loadHostingData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Dashboard Hosting
            </Text>

            {/* Stats */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View style={{ flex: 1, padding: 15, backgroundColor: '#f0f0f0', marginRight: 10 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{properties.length}</Text>
                    <Text>Properti Aktif</Text>
                </View>
                <View style={{ flex: 1, padding: 15, backgroundColor: '#f0f0f0' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{bookingRequests.length}</Text>
                    <Text>Permintaan Baru</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={{ marginBottom: 20 }}>
                <Button
                    title="Tambah Properti Baru"
                    onPress={() => navigation.navigate('CreateProperty')}
                />
                <View style={{ height: 10 }} />
                <Button
                    title="Kelola Semua Properti"
                    onPress={() => navigation.navigate('ManageProperties')}
                    color="#007AFF"
                />
            </View>

            {/* Booking Requests */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Permintaan Booking
            </Text>

            {bookingRequests.length === 0 ? (
                <Text style={{ color: '#999', marginBottom: 20 }}>
                    Belum ada permintaan booking
                </Text>
            ) : (
                <FlatList
                    data={bookingRequests}
                    keyExtractor={(item: any) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, backgroundColor: '#f9f9f9', marginBottom: 10 }}>
                            <Text style={{ fontWeight: 'bold' }}>{item.property.title}</Text>
                            <Text>Check-in: {item.checkInDate}</Text>
                            <Text>Check-out: {item.checkOutDate}</Text>
                            <Text>Status: {item.status}</Text>

                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Button
                                    title="Setujui"
                                    onPress={() => handleApproveBooking(item.id)}
                                    color="green"
                                />
                                <View style={{ width: 10 }} />
                                <Button
                                    title="Tolak"
                                    onPress={() => handleRejectBooking(item.id)}
                                    color="red"
                                />
                            </View>
                        </View>
                    )}
                />
            )}

            {/* My Properties */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
                Properti Saya
            </Text>

            {properties.length === 0 ? (
                <Text style={{ color: '#999' }}>
                    Belum ada properti. Tambahkan properti pertama Anda!
                </Text>
            ) : (
                <FlatList
                    data={properties}
                    keyExtractor={(item: any) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, backgroundColor: '#f9f9f9', marginBottom: 10 }}>
                            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                            <Text>{item.city}, {item.state}</Text>
                            <Text>RM {item.price.toLocaleString()}/bulan</Text>
                            <Text>Status: {item.status}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}
