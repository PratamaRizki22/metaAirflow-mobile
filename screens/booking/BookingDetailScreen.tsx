import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingService, reviewService, stripeService, agreementService } from '../../services';
import { useToast } from '../../hooks/useToast';
import { Toast, Button } from '../../components/common';
import { LinearGradient } from 'expo-linear-gradient';
import { RefundModal } from '../../components/booking/RefundModal';
import { useTheme } from '../../contexts/ThemeContext';

export default function BookingDetailScreen({ route, navigation }: any) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundEligibility, setRefundEligibility] = useState<{ eligible: boolean; daysRemaining: number }>({ eligible: false, daysRemaining: 0 });
    const { toast, showToast, hideToast } = useToast();
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const [agreementPdfUrl, setAgreementPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        loadBookingDetail();
    }, [bookingId]);

    const loadBookingDetail = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingById(bookingId);
            
            console.log('📋 Booking detail loaded:', {
                id: response.data.id,
                startDate: response.data.startDate,
                endDate: response.data.endDate,
                checkInDate: response.data.checkInDate,
                checkOutDate: response.data.checkOutDate,
                totalPrice: response.data.totalPrice,
                status: response.data.status,
            });
            
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

            // Check refund eligibility for confirmed bookings
            if (response.data.status === 'APPROVED' && response.data.paymentStatus === 'paid') {
                checkRefundEligibility(response.data);
            }
        } catch (error: any) {
            console.error('❌ Load booking detail error:', error);
            Alert.alert('Error', error.message);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const checkRefundEligibility = (bookingData: any) => {
        // Check if payment was completed within 7 days
        if (bookingData.createdAt) {
            const paymentDate = new Date(bookingData.createdAt);
            const now = new Date();
            const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysRemaining = 7 - daysSincePayment;

            setRefundEligibility({
                eligible: daysRemaining > 0,
                daysRemaining: Math.max(0, daysRemaining)
            });
        }
    };

    const handleRequestRefund = async (reason: string) => {
        try {
            await stripeService.requestRefund(bookingId, reason);
            showToast('Refund request submitted successfully', 'success');
            setTimeout(() => {
                loadBookingDetail();
            }, 1500);
        } catch (error: any) {
            showToast(error.message || 'Failed to request refund', 'error');
            throw error;
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
                            console.log('🔴 Cancelling booking:', bookingId);
                            await bookingService.cancelBooking(bookingId);
                            console.log('✅ Booking cancelled successfully');
                            Alert.alert('Success', 'Booking cancelled successfully', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            console.error('❌ Cancel booking error:', error);
                            console.error('❌ Error details:', error.response?.data);
                            Alert.alert('Error', error.message || 'Failed to cancel booking');
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

    const handleViewAgreementPDF = async () => {
        try {
            const response = await bookingService.getRentalAgreementPDF(bookingId);
            const pdfUrl = response.data.pdf?.url;

            if (pdfUrl) {
                setAgreementPdfUrl(pdfUrl);
                Linking.openURL(pdfUrl);
            } else {
                showToast('PDF not available yet', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to load rental agreement', 'error');
        }
    };

    const handleAnalyzeWithAI = async () => {
        try {
            // Get PDF URL and open it
            const response = await bookingService.getRentalAgreementPDF(bookingId);
            const pdfUrl = response.data.pdf?.url;

            if (pdfUrl) {
                setAgreementPdfUrl(pdfUrl);
                Linking.openURL(pdfUrl);
                showToast('Opening PDF agreement...', 'success');
            } else {
                showToast('PDF not available yet', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to load agreement', 'error');
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
            case 'PENDING': return '#F59E0B';
            case 'APPROVED': return '#10B981';
            case 'REJECTED': return '#EF4444';
            case 'CANCELLED': return '#8E8E93';
            case 'COMPLETED': return '#007AFF';
            default: return '#8E8E93';
        }
    };

    // Handle different field names from backend (startDate/endDate or checkInDate/checkOutDate)
    const checkInDate = new Date(booking.startDate || booking.checkInDate);
    const checkOutDate = new Date(booking.endDate || booking.checkOutDate);
    
    // Validate dates
    const isValidCheckIn = !isNaN(checkInDate.getTime());
    const isValidCheckOut = !isNaN(checkOutDate.getTime());
    
    const nights = isValidCheckIn && isValidCheckOut 
        ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Calculate price per night if we have valid data
    const pricePerNight = nights > 0 && booking.totalPrice 
        ? Number(booking.totalPrice) / nights 
        : Number(booking.property?.pricePerNight || 0);

    return (
        <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-gray-50'}`}>
            {/* Header */}
            <LinearGradient
                colors={['#00D9A3', '#00BF8F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingTop: insets.top }}
            >
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-4"
                    >
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-['VisbyRound-Bold'] flex-1">
                        Booking Details
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-6 py-6">
                    {/* Status Badge */}
                    <View className="items-center mb-6">
                        <View 
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                            className="px-6 py-2.5 rounded-full"
                        >
                            <Text className="text-white font-['VisbyRound-Bold'] text-sm">
                                {booking.status}
                            </Text>
                        </View>
                    </View>

                    {/* Property Info */}
                    <View className={`rounded-2xl p-5 mb-4 ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <Text className={`text-xl font-['VisbyRound-Bold'] mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.property?.title}
                        </Text>
                        <TouchableOpacity 
                            onPress={openLocation} 
                            className="flex-row items-center mb-3"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="location" size={18} color="#00D9A3" />
                            <Text className="text-primary font-['VisbyRound-Medium'] ml-1.5 text-base">
                                {booking.property?.city}, {booking.property?.state}
                            </Text>
                        </TouchableOpacity>
                        <Text className={`font-['VisbyRound-Regular'] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.property?.bedrooms} beds • {booking.property?.bathrooms} baths • {booking.property?.areaSqm} m²
                        </Text>
                    </View>

                    {/* Booking Details */}
                    <View className={`rounded-2xl p-5 mb-4 ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <Text className={`text-lg font-['VisbyRound-Bold'] mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Booking Details
                        </Text>

                        <View className="mb-4">
                            <Text className={`font-['VisbyRound-Regular'] text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Check-in
                            </Text>
                            <Text className={`font-['VisbyRound-Bold'] text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {isValidCheckIn 
                                    ? checkInDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                    : 'Invalid Date'
                                }
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className={`font-['VisbyRound-Regular'] text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Check-out
                            </Text>
                            <Text className={`font-['VisbyRound-Bold'] text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {isValidCheckOut
                                    ? checkOutDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                    : 'Invalid Date'
                                }
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className={`font-['VisbyRound-Regular'] text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Duration
                            </Text>
                            <Text className={`font-['VisbyRound-Bold'] text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'Invalid duration'}
                            </Text>
                        </View>

                        <View>
                            <Text className={`font-['VisbyRound-Regular'] text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Guests
                            </Text>
                            <Text className={`font-['VisbyRound-Bold'] text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>

                {/* Price Breakdown */}
                <View className={`rounded-2xl p-5 mb-4 ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <Text className={`text-lg font-['VisbyRound-Bold'] mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Price Details
                    </Text>

                    <View className="flex-row justify-between mb-3">
                        <Text className={`font-['VisbyRound-Regular'] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            RM {pricePerNight > 0 ? pricePerNight.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0'} x {nights > 0 ? nights : 'NaN'} nights
                        </Text>
                        <Text className={`font-['VisbyRound-Medium'] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            RM {nights > 0 && pricePerNight > 0 
                                ? (pricePerNight * nights).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                : 'NaN'
                            }
                        </Text>
                    </View>

                    <View className={`border-t pt-3 mt-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <View className="flex-row justify-between">
                            <Text className={`text-base font-['VisbyRound-Bold'] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Total
                            </Text>
                            <Text className="text-lg font-['VisbyRound-Bold'] text-primary">
                                RM {booking.totalPrice 
                                    ? Number(booking.totalPrice).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : '0.00'
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Guest/Host Info */}
                {booking.user && (
                    <View className={`rounded-2xl p-5 mb-4 ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <Text className={`text-lg font-['VisbyRound-Bold'] mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.isOwner ? 'Guest Information' : 'Host Information'}
                        </Text>
                        <Text className={`text-base font-['VisbyRound-Bold'] mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.user.name}
                        </Text>
                        <Text className={`font-['VisbyRound-Regular'] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.user.email}
                        </Text>
                    </View>
                )}

                {/* Actions */}
                {booking.status === 'PENDING' && (
                    <View className="mb-6">
                        {booking.isOwner ? (
                            // Owner actions
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handleApproveBooking}
                                    disabled={actionLoading}
                                    className="flex-1 bg-green-500 py-4 rounded-xl items-center"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-['VisbyRound-Bold'] text-base">
                                        {actionLoading ? 'Processing...' : 'Approve'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleRejectBooking}
                                    disabled={actionLoading}
                                    className="flex-1 bg-red-500 py-4 rounded-xl items-center"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-['VisbyRound-Bold'] text-base">
                                        Reject
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Tenant actions
                            <TouchableOpacity
                                onPress={handleCancelBooking}
                                disabled={actionLoading}
                                className="bg-red-500 py-4 rounded-xl items-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-['VisbyRound-Bold'] text-base">
                                    {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Write Review Button (for completed bookings) */}
                {booking.status === 'COMPLETED' && canReview && (
                    <View style={{ marginTop: 16 }}>
                        <Button
                            onPress={() => navigation.navigate('WriteReview', {
                                leaseId: bookingId,
                                propertyId: booking.property.id,
                                propertyTitle: booking.property.title
                            })}
                            variant="primary"
                            fullWidth
                        >
                            Write a Review
                        </Button>
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

                {/* Pay Now Button (for APPROVED bookings not yet paid) */}
                {booking.status === 'APPROVED' && booking.paymentStatus === 'pending' && !booking.isOwner && (
                    <View style={{ marginTop: 16 }}>
                        <Button
                            onPress={() => navigation.navigate('Payment', {
                                bookingId: booking.id,
                                amount: booking.totalPrice,
                                propertyTitle: booking.property?.title
                            })}
                            variant="primary"
                            fullWidth
                        >
                            Pay Now - RM {booking.totalPrice?.toLocaleString()}
                        </Button>
                    </View>
                )}

                {/* Payment Completed Badge */}
                {booking.paymentStatus === 'paid' && (
                    <View style={{
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: '#D1FAE5',
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={{ color: '#059669', marginLeft: 12, flex: 1, fontWeight: '600' }}>
                            Payment completed successfully
                        </Text>
                    </View>
                )}

                {/* Rental Agreement Section (for paid bookings) */}
                {booking.status === 'APPROVED' && booking.paymentStatus === 'paid' && !booking.isOwner && (
                    <View style={{ marginTop: 16 }}>
                        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Ionicons name="document-text" size={20} color="#6366F1" />
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                                    Rental Agreement
                                </Text>
                            </View>

                            <Text style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>
                                View your rental agreement and get AI-powered insights
                            </Text>

                            {/* View PDF Button */}
                            <TouchableOpacity
                                onPress={handleViewAgreementPDF}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: '#6366F1',
                                    padding: 14,
                                    borderRadius: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 10
                                }}
                            >
                                <Ionicons name="document" size={18} color="white" />
                                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8, fontSize: 15 }}>
                                    View PDF Agreement
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Refund Button (for confirmed bookings within 7 days) */}
                {booking.status === 'APPROVED' && booking.paymentStatus === 'paid' && refundEligibility.eligible && !booking.isOwner && (
                    <View style={{ marginTop: 16 }}>
                        <TouchableOpacity
                            onPress={() => setShowRefundModal(true)}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: '#EF4444',
                                padding: 16,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Ionicons name="arrow-undo" size={20} color="white" />
                            <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                                Request Refund ({refundEligibility.daysRemaining} days left)
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Refund Expired Notice */}
                {booking.status === 'APPROVED' && booking.paymentStatus === 'paid' && !refundEligibility.eligible && !booking.isOwner && (
                    <View style={{
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: '#FEE2E2',
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Ionicons name="time-outline" size={24} color="#EF4444" />
                        <Text style={{ color: '#DC2626', marginLeft: 12, flex: 1, fontWeight: '600' }}>
                            Refund window expired (7 days from payment)
                        </Text>
                    </View>
                )}

                {/* Refunded Status */}
                {booking.paymentStatus === 'refunded' && (
                    <View style={{
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: '#E0E7FF',
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                        <Text style={{ color: '#4F46E5', marginLeft: 12, flex: 1, fontWeight: '600' }}>
                            Payment refunded successfully
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
            <RefundModal
                visible={showRefundModal}
                onClose={() => setShowRefundModal(false)}
                onConfirm={handleRequestRefund}
                bookingDetails={{
                    propertyTitle: booking?.property?.title || '',
                    amount: booking?.totalPrice || 0,
                    completedDate: booking?.createdAt
                }}
                daysRemaining={refundEligibility.daysRemaining}
            />
            
            {/* Toast */}
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    visible={toast.visible}
                    onHide={hideToast}
                />
            )}
        </ScrollView>
        </View>
    );
}
