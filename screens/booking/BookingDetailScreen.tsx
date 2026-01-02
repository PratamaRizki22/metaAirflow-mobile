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

    // AI Chatbot states
    const [showAIChatbot, setShowAIChatbot] = useState(false);
    const [agreementPdfUrl, setAgreementPdfUrl] = useState<string | null>(null);
    const [agreementText, setAgreementText] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<any[]>([
        { role: 'bot', content: 'Hello! I am your AI Agreement Assistant. I can help you understand your rental agreement. Ask me anything!' }
    ]);
    const [chatQuery, setChatQuery] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

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
            setShowAIChatbot(true);

            // If agreement text not loaded yet, load it
            if (!agreementText) {
                setAiAnalysisLoading(true);

                // Get PDF URL
                const response = await bookingService.getRentalAgreementPDF(bookingId);
                const pdfUrl = response.data.pdf?.url;

                if (!pdfUrl) {
                    showToast('PDF not available yet', 'error');
                    setShowAIChatbot(false);
                    return;
                }

                setAgreementPdfUrl(pdfUrl);

                // Download and extract text from PDF
                // Note: In production, you might want to do this on backend
                // For now, we'll use property description as placeholder
                const checkIn = new Date(booking.startDate || booking.checkInDate);
                const checkOut = new Date(booking.endDate || booking.checkOutDate);
                
                const placeholderText = `Rental Agreement for ${booking.property?.title}
                
Property: ${booking.property?.title}
Location: ${booking.property?.address}, ${booking.property?.city}
Check-in: ${!isNaN(checkIn.getTime()) ? checkIn.toLocaleDateString() : 'Invalid Date'}
Check-out: ${!isNaN(checkOut.getTime()) ? checkOut.toLocaleDateString() : 'Invalid Date'}
Total Price: RM ${booking.totalPrice || '0'}

Terms and Conditions:
1. Payment must be made in full before check-in
2. Security deposit is refundable upon checkout
3. No smoking inside the property
4. Pets are not allowed unless specified
5. Tenant is responsible for any damages
6. Notice period for cancellation: 7 days

For full agreement details, please refer to the PDF document.`;

                setAgreementText(placeholderText);

                // Auto-analyze
                try {
                    const analysisResponse = await agreementService.analyze(placeholderText);
                    setChatHistory(prev => [...prev,
                    { role: 'bot', content: `📄 Agreement Analysis:\n\n${analysisResponse.analysis}` }
                    ]);
                } catch (analyzeError) {
                    console.log('Auto-analysis failed:', analyzeError);
                }

                setAiAnalysisLoading(false);
            }
        } catch (error: any) {
            setAiAnalysisLoading(false);
            showToast(error.message || 'Failed to load agreement', 'error');
        }
    };

    const handleAskAI = async () => {
        if (!chatQuery.trim()) return;

        const question = chatQuery;
        setChatQuery('');
        setChatHistory(prev => [...prev, { role: 'user', content: question }]);
        setChatLoading(true);

        try {
            const response = await agreementService.ask(agreementText, question);
            setChatHistory(prev => [...prev, { role: 'bot', content: response.answer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'bot', content: "Sorry, I couldn't process your question at the moment." }]);
        } finally {
            setChatLoading(false);
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
                            {isValidCheckIn 
                                ? checkInDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                : 'Invalid Date'
                            }
                        </Text>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#666', marginBottom: 4 }}>Check-out</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            {isValidCheckOut
                                ? checkOutDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                : 'Invalid Date'
                            }
                        </Text>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#666', marginBottom: 4 }}>Duration</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'Invalid duration'}
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
                        <Text>
                            RM {pricePerNight > 0 ? pricePerNight.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0'} x {nights > 0 ? nights : 'NaN'} nights
                        </Text>
                        <Text>
                            RM {nights > 0 && pricePerNight > 0 
                                ? (pricePerNight * nights).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                : 'NaN'
                            }
                        </Text>
                    </View>

                    <View style={{ borderTopWidth: 1, borderColor: '#E5E5E5', marginTop: 8, paddingTop: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Total</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>
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

                            {/* Analyze with AI Button */}
                            <TouchableOpacity
                                onPress={handleAnalyzeWithAI}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: '#10B981',
                                    padding: 14,
                                    borderRadius: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Ionicons name="chatbubbles" size={18} color="white" />
                                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8, fontSize: 15 }}>
                                    🤖 Analyze with AI
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

            {/* AI Chatbot Modal */}
            <Modal
                visible={showAIChatbot}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAIChatbot(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}
                >
                    <View style={{ flex: 1 }}>
                        {/* Gradient Header */}
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                paddingTop: insets.top + 16,
                                paddingHorizontal: 20,
                                paddingBottom: 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}>
                                        <Ionicons name="sparkles" size={22} color="#FFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            fontFamily: 'VisbyRound-Bold',
                                            color: 'white',
                                            marginBottom: 2
                                        }}>
                                            AI Assistant
                                        </Text>
                                        <Text style={{
                                            fontSize: 13,
                                            fontFamily: 'VisbyRound-Regular',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}>
                                            Ask me anything about your agreement
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowAIChatbot(false)}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Ionicons name="close" size={22} color="white" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

                        {/* Loading Indicator */}
                        {aiAnalysisLoading && (
                            <View style={{
                                padding: 24,
                                alignItems: 'center',
                                backgroundColor: isDark ? '#1E293B' : 'white',
                                marginHorizontal: 16,
                                marginTop: 16,
                                borderRadius: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}>
                                <ActivityIndicator size="large" color="#10B981" />
                                <Text style={{
                                    marginTop: 12,
                                    color: isDark ? '#94A3B8' : '#64748B',
                                    fontSize: 15,
                                    fontWeight: '500',
                                    fontFamily: 'VisbyRound-Medium'
                                }}>
                                    Analyzing your agreement...
                                </Text>
                            </View>
                        )}

                        {/* Chat History */}
                        <FlatList
                            data={chatHistory}
                            keyExtractor={(_, index) => index.toString()}
                            contentContainerStyle={{
                                padding: 16,
                                paddingBottom: 8
                            }}
                            renderItem={({ item }) => (
                                <View style={{
                                    marginBottom: 12,
                                    flexDirection: 'row',
                                    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start'
                                }}>
                                    {item.role === 'bot' && (
                                        <View style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 16,
                                            backgroundColor: '#10B981',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 8,
                                            marginTop: 4
                                        }}>
                                            <Ionicons name="sparkles" size={16} color="white" />
                                        </View>
                                    )}
                                    <View style={{
                                        maxWidth: '75%',
                                        borderRadius: 20,
                                        padding: 14,
                                        backgroundColor: item.role === 'user'
                                            ? '#10B981'
                                            : (isDark ? '#1E293B' : 'white'),
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: item.role === 'user' ? 0.2 : 0.05,
                                        shadowRadius: 4,
                                        elevation: 2,
                                        ...(item.role === 'user' ? {
                                            borderTopRightRadius: 6,
                                        } : {
                                            borderTopLeftRadius: 6,
                                        })
                                    }}>
                                        <Text style={{
                                            color: item.role === 'user' ? 'white' : (isDark ? '#F1F5F9' : '#1E293B'),
                                            fontSize: 15,
                                            lineHeight: 22,
                                            fontFamily: 'VisbyRound-Regular'
                                        }}>
                                            {item.content}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        />

                        {/* Input Area */}
                        <View style={{
                            paddingHorizontal: 16,
                            paddingTop: 12,
                            paddingBottom: Math.max(insets.bottom + 8, 20),
                            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                            borderTopWidth: 1,
                            borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                backgroundColor: isDark ? '#1E293B' : 'white',
                                borderRadius: 24,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 3,
                            }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        color: isDark ? '#F1F5F9' : '#1E293B',
                                        fontSize: 15,
                                        maxHeight: 100,
                                        paddingVertical: 8,
                                        paddingRight: 8
                                    }}
                                    placeholder="Ask about your agreement..."
                                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                                    value={chatQuery}
                                    onChangeText={setChatQuery}
                                    onSubmitEditing={handleAskAI}
                                    multiline
                                    maxLength={500}
                                />
                                <TouchableOpacity
                                    onPress={handleAskAI}
                                    disabled={chatLoading || !chatQuery.trim()}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: (chatLoading || !chatQuery.trim()) ? '#94A3B8' : '#10B981',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 8
                                    }}
                                >
                                    {chatLoading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Ionicons name="send" size={18} color="white" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    );
}
