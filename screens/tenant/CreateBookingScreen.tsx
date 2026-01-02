import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { DateRangePicker } from '../../components/booking';
import { bookingService, propertyService, agreementService } from '../../services';
import { useToast } from '../../hooks/useToast';
import { Toast, Button } from '../../components/common';

export default function CreateBookingScreen({ route, navigation }: any) {
    const { propertyId, propertyTitle, price } = route.params;
    const { isDark } = useTheme();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const insets = useSafeAreaInsets();

    // Chatbot State
    const [propertyDetails, setPropertyDetails] = useState<any>(null);
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatQuery, setChatQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([
        { role: 'bot', content: 'Hello! I am your AI Agreement Assistant. Ask me anything about the house rules or rental agreement.' }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';

    React.useEffect(() => {
        loadPropertyDetails();
    }, []);

    const loadPropertyDetails = async () => {
        try {
            const details = await propertyService.getPropertyById(propertyId);
            setPropertyDetails(details);
        } catch (e) {
            console.log("Failed to load property details", e);
        }
    };

    const handleAskAI = async () => {
        if (!chatQuery.trim()) return;

        const question = chatQuery;
        setChatQuery('');
        setChatHistory(prev => [...prev, { role: 'user', content: question }]);
        setChatLoading(true);

        try {
            const agreementText = propertyDetails?.description || "No specific rules provided.";
            const response = await agreementService.ask(agreementText, question);

            setChatHistory(prev => [...prev, { role: 'bot', content: response.answer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'bot', content: "Sorry, I couldn't process your question at the moment." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const calculateNights = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return nights;
    };

    const calculateTotal = () => {
        const nights = calculateNights();
        // Assuming price is monthly, calculate daily rate
        const dailyRate = price / 30;
        return nights * dailyRate;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Select date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleDateConfirm = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    const handleSubmit = async () => {
        if (!startDate || !endDate) {
            Alert.alert('Error', 'Please select check-in and check-out dates');
            return;
        }

        if (!agreedToTerms) {
            Alert.alert('Agreement Required', 'Please agree to the rental terms and conditions');
            return;
        }

        setLoading(true);
        try {
            // Check availability first
            const availabilityResult = await propertyService.checkAvailability(
                propertyId,
                startDate,
                endDate
            );

            if (!availabilityResult.available) {
                Alert.alert(
                    'Not Available',
                    'These dates are already booked. Please choose different dates.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            // Create booking
            const response = await bookingService.createBooking({
                propertyId,
                startDate,
                endDate,
                message: message || undefined,
            });

            const bookingId = response.data?.id;

            if (!bookingId) {
                throw new Error('Booking created but ID not found');
            }

            // Upload simple agreement signature (just "agreed" text)
            try {
                await bookingService.uploadSignature(bookingId, 'AGREED_VIA_CHECKBOX');
            } catch (signError) {
                console.log('Signature upload failed, continuing...', signError);
            }

            // Show success toast
            showToast('Booking created! Proceeding to payment...', 'success');

            // Navigate to payment
            setTimeout(() => {
                navigation.navigate('Payment', {
                    bookingId,
                    amount: calculateTotal(),
                    propertyTitle,
                });
            }, 500);

        } catch (error: any) {
            showToast(error.message || 'Failed to create booking', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView>
                {/* Property Title */}
                <View className="px-6 pt-4 pb-2">
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                        {propertyTitle}
                    </Text>
                </View>

                {/* Date Selection */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="calendar-outline" size={20} color="#00D9A3" />
                        <Text className={`text-lg font-bold ml-2 ${textColor}`}>
                            Your Trip
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className={`${cardBg} rounded-2xl p-4`}
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-1">
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                                    CHECK-IN
                                </Text>
                                <Text className={`text-base font-semibold ${textColor}`}>
                                    {formatDate(startDate)}
                                </Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
                            <View className="flex-1 items-end">
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                                    CHECK-OUT
                                </Text>
                                <Text className={`text-base font-semibold ${textColor}`}>
                                    {formatDate(endDate)}
                                </Text>
                            </View>
                        </View>

                        {startDate && endDate && (
                            <View className="bg-primary/10 px-3 py-2 rounded-lg">
                                <Text className="text-primary text-center font-medium">
                                    {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Message */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="chatbubble-outline" size={20} color="#00D9A3" />
                        <Text className={`text-lg font-bold ml-2 ${textColor}`}>
                            Message to Owner (Optional)
                        </Text>
                    </View>
                    <TextInput
                        className={`${inputBg} ${borderColor} border rounded-2xl px-4 py-3 ${textColor}`}
                        placeholder="Tell the owner about your stay..."
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Price Breakdown */}
                {startDate && endDate && (
                    <View className="px-6 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="cash-outline" size={20} color="#00D9A3" />
                            <Text className={`text-lg font-bold ml-2 ${textColor}`}>
                                Price Details
                            </Text>
                        </View>
                        <View className={`${cardBg} rounded-2xl p-4`}>
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                                    RM {(price / 30).toFixed(2)} x {calculateNights()} nights
                                </Text>
                                <Text className={textColor}>
                                    RM {calculateTotal().toFixed(2)}
                                </Text>
                            </View>
                            <View className="border-t border-gray-300 dark:border-gray-700 my-3" />
                            <View className="flex-row justify-between">
                                <Text className={`text-lg font-bold ${textColor}`}>
                                    Total
                                </Text>
                                <Text className={`text-lg font-bold ${textColor}`}>
                                    RM {calculateTotal().toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Info */}
                <View className="px-6 mb-6">
                    <View className={`${cardBg} rounded-2xl p-4`}>
                        <View className="flex-row items-start gap-3">
                            <Ionicons name="information-circle" size={24} color="#00D9A3" />
                            <View className="flex-1">
                                <Text className={`font-semibold mb-1 ${textColor}`}>
                                    Your booking request
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                    The owner will review your request and respond within 24 hours. You won't be charged until your request is approved.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Rental Agreement */}
                <View className="px-6 mb-6">
                    <View className={`${cardBg} rounded-2xl p-4`}>
                        <TouchableOpacity
                            onPress={() => setShowChatbot(true)}
                            disabled={!propertyDetails}
                            className={`bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl mb-4 flex-row items-center justify-center border border-indigo-100 dark:border-indigo-800 ${!propertyDetails ? 'opacity-50' : ''}`}
                        >
                            {!propertyDetails ? (
                                <ActivityIndicator size="small" color="#6366F1" />
                            ) : (
                                <Ionicons name="chatbubbles-outline" size={20} color="#6366F1" />
                            )}
                            <Text className="text-indigo-600 dark:text-indigo-400 font-semibold ml-2">
                                {!propertyDetails ? 'Loading Agreement...' : 'Ask AI about Agreement'}
                            </Text>
                        </TouchableOpacity>

                        <View className="border-t border-gray-200 dark:border-gray-700 my-2 mb-4" />

                        <TouchableOpacity
                            onPress={() => setAgreedToTerms(!agreedToTerms)}
                            className="flex-row items-start gap-3"
                        >
                            <View className={`w-6 h-6 rounded border-2 ${agreedToTerms ? 'bg-primary border-primary' : `${borderColor}`} items-center justify-center mt-0.5`}>
                                {agreedToTerms && (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className={`${textColor} leading-5`}>
                                    I agree to the rental terms and conditions. I understand that this booking is subject to availability and owner approval.
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View
                className={`${cardBg} px-6`}
                style={{
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom, 16),
                }}
            >
                <Button
                    onPress={handleSubmit}
                    variant="primary"
                    size="lg"
                    disabled={!startDate || !endDate || !agreedToTerms}
                    loading={loading}
                    fullWidth
                >
                    Request to Book
                </Button>
            </View>

            {/* AI Chatbot Modal */}
            <Modal
                visible={showChatbot}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowChatbot(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className={`flex-1`}
                    style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}
                >
                    <View className="flex-1">
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
                                            Ask me about house rules & agreement
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowChatbot(false)}
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

                        {/* Chat History */}
                        <FlatList
                            data={chatHistory}
                            keyExtractor={(_, index) => index.toString()}
                            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                            renderItem={({ item }) => (
                                <View className={`mb-3 flex-row ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                                        backgroundColor: item.role === 'user' ? '#10B981' : (isDark ? '#1E293B' : 'white'),
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: item.role === 'user' ? 0.2 : 0.05,
                                        shadowRadius: 4,
                                        elevation: 2,
                                        ...(item.role === 'user' ? { borderTopRightRadius: 6 } : { borderTopLeftRadius: 6 })
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
                                    placeholder="Ask about rules, parking, etc..."
                                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                                    value={chatQuery}
                                    onChangeText={setChatQuery}
                                    onSubmitEditing={handleAskAI}
                                    multiline
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

            {/* Date Range Picker Modal */}
            <DateRangePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={handleDateConfirm}
                minDate={new Date().toISOString().split('T')[0]}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />

            {/* Toast Notification */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
        </View>
    );
}
