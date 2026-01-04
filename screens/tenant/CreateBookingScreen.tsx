import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { DatePicker } from '../../components/booking';
import { bookingService, propertyService } from '../../services';
import { useToast } from '../../hooks/useToast';
import { Toast, Button } from '../../components/common';

export default function CreateBookingScreen({ route, navigation }: any) {
    const { propertyId, propertyTitle, price } = route.params;
    const { isDark } = useTheme();
    const [checkInDate, setCheckInDate] = useState('');
    const [monthsDuration, setMonthsDuration] = useState(1);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const { toast, showToast, hideToast } = useToast();
    const insets = useSafeAreaInsets();

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';

    useEffect(() => {
        loadOccupiedDates();
    }, [propertyId]);


    const loadOccupiedDates = async () => {
        try {
            const data = await propertyService.getOccupiedDates(propertyId);
            if (data && 'occupiedPeriods' in data && Array.isArray(data.occupiedPeriods)) {
                const dates: string[] = [];
                data.occupiedPeriods.forEach((period: { startDate: string; endDate: string }) => {
                    let currentDate = new Date(period.startDate);
                    const endDate = new Date(period.endDate);

                    while (currentDate <= endDate) {
                        dates.push(currentDate.toISOString().split('T')[0]);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                });
                setBlockedDates(dates);
            }
        } catch (error) {
            console.error('Failed to load occupied dates', error);
        }
    };

    const calculateCheckOutDate = () => {
        if (!checkInDate) return '';
        const checkIn = new Date(checkInDate);
        checkIn.setMonth(checkIn.getMonth() + monthsDuration);
        return checkIn.toISOString().split('T')[0];
    };

    const calculateTotal = () => {
        return price * monthsDuration;
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

    const handleDateConfirm = (date: string) => {
        setCheckInDate(date);
    };

    const handleSubmit = async () => {
        if (!checkInDate) {
            Alert.alert('Error', 'Please select check-in date and rental duration');
            return;
        }

        if (!agreedToTerms) {
            Alert.alert('Agreement Required', 'Please agree to the rental terms and conditions');
            return;
        }

        const checkOutDate = calculateCheckOutDate();

        setLoading(true);
        try {
            // Check availability first
            const availabilityResult = await propertyService.checkAvailability(
                propertyId,
                checkInDate,
                checkOutDate
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
                startDate: checkInDate,
                endDate: checkOutDate,
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
                            Your Rental Period
                        </Text>
                    </View>

                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className={`${cardBg} rounded-2xl p-4`}
                        >
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                                CHECK-IN DATE
                            </Text>
                            <Text className={`text-base font-semibold ${textColor}`}>
                                {formatDate(checkInDate)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowMonthPicker(true)}
                            className={`${cardBg} rounded-2xl p-4`}
                        >
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                                RENTAL DURATION
                            </Text>
                            <View className="flex-row items-center justify-between">
                                <Text className={`text-base font-semibold ${textColor}`}>
                                    {monthsDuration} {monthsDuration === 1 ? 'Month' : 'Months'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>

                        {checkInDate && (
                            <View className="bg-primary/10 px-4 py-3 rounded-xl">
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                                    Check-out date
                                </Text>
                                <Text className="text-primary text-base font-semibold">
                                    {formatDate(calculateCheckOutDate())}
                                </Text>
                            </View>
                        )}
                    </View>
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
                {checkInDate && (
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
                                    RM {price.toLocaleString('en-MY')} x {monthsDuration} {monthsDuration === 1 ? 'month' : 'months'}
                                </Text>
                                <Text className={textColor}>
                                    RM {calculateTotal().toLocaleString('en-MY')}
                                </Text>
                            </View>
                            <View className="border-t border-gray-300 dark:border-gray-700 my-3" />
                            <View className="flex-row justify-between">
                                <Text className={`text-lg font-bold ${textColor}`}>
                                    Total
                                </Text>
                                <Text className={`text-lg font-bold ${textColor}`}>
                                    RM {calculateTotal().toLocaleString('en-MY')}
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
                    disabled={!checkInDate || !agreedToTerms}
                    loading={loading}
                    fullWidth
                >
                    Request to Book
                </Button>
            </View>

            {/* Date Picker Modal */}
            <DatePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={handleDateConfirm}
                minDate={new Date().toISOString().split('T')[0]}
                blockedDates={blockedDates}
                initialDate={checkInDate}
                title="Select Check-in Date"
            />

            {/* Month Duration Picker Modal */}
            <Modal
                visible={showMonthPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowMonthPicker(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className={`${cardBg} rounded-t-3xl p-6`} style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className={`text-xl font-bold ${textColor}`}>
                                Select Duration
                            </Text>
                            <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setMonthsDuration(item);
                                        setShowMonthPicker(false);
                                    }}
                                    className={`py-4 px-4 rounded-xl mb-2 ${monthsDuration === item
                                        ? 'bg-primary'
                                        : isDark
                                            ? 'bg-surface-dark'
                                            : 'bg-gray-100'
                                        }`}
                                >
                                    <Text
                                        className={`text-center font-semibold ${monthsDuration === item
                                            ? 'text-white'
                                            : textColor
                                            }`}
                                    >
                                        {item} {item === 1 ? 'Month' : 'Months'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

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
