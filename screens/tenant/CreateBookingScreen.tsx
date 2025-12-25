import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DateRangePicker } from '../../components/booking';
import { bookingService } from '../../services';

export default function CreateBookingScreen({ route, navigation }: any) {
    const { propertyId, propertyTitle, price } = route.params;
    const { isDark } = useTheme();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';

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

        setLoading(true);
        try {
            await bookingService.createBooking({
                propertyId,
                startDate,
                endDate,
                message: message || undefined,
            });

            Alert.alert(
                'Success',
                'Booking request submitted! Wait for owner approval.',
                [
                    {
                        text: 'View My Trips',
                        onPress: () => navigation.navigate('MyTrips')
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView>
                {/* Header */}
                <View className="px-6 pt-16 pb-6">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mb-4"
                    >
                        <Ionicons name="arrow-back" size={28} color={isDark ? '#FFF' : '#000'} />
                    </TouchableOpacity>

                    <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                        Request to Book
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                        {propertyTitle}
                    </Text>
                </View>

                {/* Date Selection */}
                <View className="px-6 mb-6">
                    <Text className={`text-lg font-bold mb-3 ${textColor}`}>
                        📅 Your Trip
                    </Text>

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
                    <Text className={`text-lg font-bold mb-3 ${textColor}`}>
                        💬 Message to Owner (Optional)
                    </Text>
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
                        <Text className={`text-lg font-bold mb-3 ${textColor}`}>
                            💰 Price Details
                        </Text>
                        <View className={`${cardBg} rounded-2xl p-4`}>
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                                    MYR {(price / 30).toFixed(2)} x {calculateNights()} nights
                                </Text>
                                <Text className={textColor}>
                                    MYR {calculateTotal().toFixed(2)}
                                </Text>
                            </View>
                            <View className="border-t border-gray-300 dark:border-gray-700 my-3" />
                            <View className="flex-row justify-between">
                                <Text className={`text-lg font-bold ${textColor}`}>
                                    Total
                                </Text>
                                <Text className={`text-lg font-bold ${textColor}`}>
                                    MYR {calculateTotal().toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Info */}
                <View className="px-6 mb-6">
                    <View className={`${cardBg} rounded-2xl p-4`}>
                        <View className="flex-row items-start gap-3">
                            <Ionicons name="information-circle" size={24} color="#14B8A6" />
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
            </ScrollView>

            {/* Submit Button */}
            <View className={`${cardBg} px-6 py-4`}>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading || !startDate || !endDate}
                    className={`py-4 rounded-xl ${loading || !startDate || !endDate ? 'bg-gray-400' : 'bg-primary'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white text-center font-bold text-base">
                            Request to Book
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Date Range Picker Modal */}
            <DateRangePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={handleDateConfirm}
                minDate={new Date().toISOString().split('T')[0]}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />
        </View>
    );
}
