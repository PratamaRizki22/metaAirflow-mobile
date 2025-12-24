import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, Platform } from 'react-native';
import { bookingService } from '../../services';

export default function CreateBookingScreen({ route, navigation }: any) {
    const { propertyId, propertyTitle, price } = route.params;
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const validateDates = () => {
        if (!startDate || !endDate) {
            Alert.alert('Error', 'Please enter both start and end dates');
            return false;
        }

        // Simple date format validation (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            Alert.alert('Error', 'Please use format: YYYY-MM-DD (e.g., 2025-01-15)');
            return false;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            Alert.alert('Error', 'Start date cannot be in the past');
            return false;
        }

        if (end <= start) {
            Alert.alert('Error', 'End date must be after start date');
            return false;
        }

        return true;
    };

    const calculateDuration = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const calculateTotal = () => {
        const days = calculateDuration();
        return days * (price / 30); // Assuming monthly price, calculate daily rate
    };

    const handleSubmit = async () => {
        if (!validateDates()) return;

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
        <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Book Property
            </Text>

            {/* Property Info */}
            <View style={{ padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                    {propertyTitle}
                </Text>
                <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: 'bold' }}>
                    Rp {price.toLocaleString()}/month
                </Text>
            </View>

            {/* Date Inputs */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Start Date
            </Text>
            <TextInput
                placeholder="YYYY-MM-DD (e.g., 2025-01-15)"
                value={startDate}
                onChangeText={setStartDate}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                End Date
            </Text>
            <TextInput
                placeholder="YYYY-MM-DD (e.g., 2025-02-15)"
                value={endDate}
                onChangeText={setEndDate}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                }}
            />

            {/* Duration & Total */}
            {startDate && endDate && calculateDuration() > 0 && (
                <View style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 15 }}>
                    <Text style={{ fontSize: 16, marginBottom: 5 }}>
                        Duration: {calculateDuration()} days
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007AFF' }}>
                        Total: Rp {calculateTotal().toLocaleString()}
                    </Text>
                </View>
            )}

            {/* Message to Owner */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Message to Owner (Optional)
            </Text>
            <TextInput
                placeholder="Tell the owner about yourself..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 20,
                    textAlignVertical: 'top',
                }}
            />

            {/* Submit Button */}
            <Button
                title={loading ? 'Submitting...' : 'Submit Booking Request'}
                onPress={handleSubmit}
                disabled={loading}
                color="#34C759"
            />

            <View style={{ height: 20 }} />

            <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                color="#999"
            />
        </ScrollView>
    );
}
