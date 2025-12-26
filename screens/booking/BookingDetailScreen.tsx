import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingService, reviewService } from '../../services';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/common';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookingDetailScreen({ route, navigation }: any) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        loadBookingDetail();
    }, [bookingId]);

    const loadBookingDetail = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingById(bookingId);
            setBooking(response.data);

            // Check if user can review (for completed bookings)
            if (response.data.status === 'COMPLETED' && response.data.property?.id) {
                try {
                    const reviewStatus = await reviewService.canReview(response.data.property.id);
                    setCanReview(reviewStatus.canReview && reviewStatus.leaseId === bookingId);
                } catch (error) {
                    console.log('Cannot check review status:', error);
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
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
                            setActionLoading(true);
                            await bookingService.cancelBooking(bookingId);
                            Alert.alert('Success', 'Booking cancelled successfully', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleApproveBooking = async () => {
        try {
            setActionLoading(true);
            await bookingService.approveBooking(bookingId);
            showToast('Booking approved successfully', 'success');
            loadBookingDetail();
        } catch (error: any) {
            showToast(error.message || 'Failed to approve booking', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectBooking = async () => {
        Alert.alert(
            'Reject Booking',
            'Are you sure you want to reject this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            await bookingService.rejectBooking(bookingId);
                            showToast('Booking rejected', 'success');
                            loadBookingDetail();
                        } catch (error: any) {
                            showToast(error.message || 'Failed to reject booking', 'error');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openLocation = () => {
        if (booking?.property?.latitude && booking?.property?.longitude) {
            const url = `https://www.google.com/maps?q=${booking.property.latitude},${booking.property.longitude}`;
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Loading booking details...</Text>
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Booking not found</Text>
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#FF9500';
            case 'APPROVED': return '#34C759';
            case 'REJECTED': return '#FF3B30';
            case 'CANCELLED': return '#8E8E93';
            case 'COMPLETED': return '#007AFF';
            default: return '#8E8E93';
        }
    };

    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            <View style={{ padding: 20 }}>
                {/* Status Badge */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <View style={{
                        backgroundColor: getStatusColor(booking.status),
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        borderRadius: 20,
                    }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            {booking.status}
                        </Text>
                    </View>
                </View>

                {/* Property Info */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                        {booking.property?.title}
                    </Text>
                    <TouchableOpacity onPress={openLocation} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="location" size={16} color="#007AFF" />
                        <Text style={{ color: '#007AFF', marginLeft: 4 }}>
                            {booking.property?.city}, {booking.property?.state}
                        </Text>
                    </TouchableOpacity>
                    <Text style={{ color: '#666' }}>
                        {booking.property?.bedrooms} beds • {booking.property?.bathrooms} baths • {booking.property?.areaSqm} m²
                    </Text>
                </View>

                {/* Booking Details */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                        Booking Details
                    </Text>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#666', marginBottom: 4 }}>Check-in</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            {checkInDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#666', marginBottom: 4 }}>Check-out</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            {checkOutDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#666', marginBottom: 4 }}>Duration</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            {nights} night{nights > 1 ? 's' : ''}
                        </Text>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#666', marginBottom: 4 }}>Guests</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                        Price Details
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Rp {booking.property?.price?.toLocaleString()} x {nights} nights</Text>
                        <Text>Rp {(booking.property?.price * nights)?.toLocaleString()}</Text>
                    </View>

                    <View style={{ borderTopWidth: 1, borderColor: '#E5E5E5', marginTop: 8, paddingTop: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Total</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>
                                Rp {booking.totalPrice?.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Guest/Host Info */}
                {booking.user && (
                    <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                            {booking.isOwner ? 'Guest Information' : 'Host Information'}
                        </Text>
                        <Text style={{ fontSize: 16, marginBottom: 4 }}>
                            {booking.user.name}
                        </Text>
                        <Text style={{ color: '#666' }}>
                            {booking.user.email}
                        </Text>
                    </View>
                )}

                {/* Actions */}
                {booking.status === 'PENDING' && (
                    <View style={{ marginBottom: 20 }}>
                        {booking.isOwner ? (
                            // Owner actions
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    onPress={handleApproveBooking}
                                    disabled={actionLoading}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#34C759',
                                        padding: 16,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                        {actionLoading ? 'Processing...' : 'Approve'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleRejectBooking}
                                    disabled={actionLoading}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#FF3B30',
                                        padding: 16,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                        Reject
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Tenant actions
                            <TouchableOpacity
                                onPress={handleCancelBooking}
                                disabled={actionLoading}
                                style={{
                                    backgroundColor: '#FF3B30',
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}\n
                {/* Write Review Button (for completed bookings) */}
                {booking.status === 'COMPLETED' && canReview && (
                    <View style={{ marginTop: 16 }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('WriteReview', {
                                leaseId: bookingId,
                                propertyId: booking.property.id,
                                propertyTitle: booking.property.title
                            })}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#14B8A6', '#0D9488']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    padding: 16,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Ionicons name="star" size={20} color="white" />
                                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                                    Write a Review
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Already Reviewed */}
                {booking.status === 'COMPLETED' && !canReview && (
                    <View style={{
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: '#E8F5E9',
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={{ color: '#059669', marginLeft: 12, flex: 1, fontWeight: '600' }}>
                            You've already reviewed this property
                        </Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </View>
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </ScrollView>
    );
}
