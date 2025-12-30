import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
                    className={`flex-1 ${bgColor}`}
                >
                    <View className="flex-1">
                        {/* Header */}
                        <View className={`flex-row items-center justify-between px-4 py-3 border-b ${borderColor}`}>
                            <Text className={`text-lg font-bold ${textColor}`}>Agreement Assistant</Text>
                            <TouchableOpacity onPress={() => setShowChatbot(false)} className="p-2">
                                <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        {/* Chat History */}
                        <FlatList
                            data={chatHistory}
                            keyExtractor={(_, index) => index.toString()}
                            contentContainerStyle={{ padding: 16 }}
                            renderItem={({ item }) => (
                                <View className={`mb-4 flex-row ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <View className={`max-w-[80%] rounded-2xl p-3 ${item.role === 'user'
                                        ? 'bg-primary rounded-tr-none'
                                        : `${cardBg} rounded-tl-none border ${borderColor}`
                                        }`}>
                                        <Text className={item.role === 'user' ? 'text-white' : textColor}>
                                            {item.content}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        />

                        {/* Input Area */}
                        <View className={`p-4 border-t ${borderColor} ${cardBg} pb-8`}>
                            <View className="flex-row items-center">
                                <TextInput
                                    className={`flex-1 ${inputBg} rounded-full px-4 py-3 mr-2 ${textColor}`}
                                    placeholder="Ask about rules, parking, etc..."
                                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                    value={chatQuery}
                                    onChangeText={setChatQuery}
                                    onSubmitEditing={handleAskAI}
                                />
                                <TouchableOpacity
                                    onPress={handleAskAI}
                                    disabled={chatLoading || !chatQuery.trim()}
                                    className={`w-12 h-12 rounded-full items-center justify-center ${chatLoading || !chatQuery.trim() ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary'
                                        }`}
                                >
                                    {chatLoading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Ionicons name="send" size={20} color="white" />
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
