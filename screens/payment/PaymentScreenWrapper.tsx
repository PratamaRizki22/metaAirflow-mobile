import React from 'react';
import { View } from 'react-native';
import { PaymentScreen } from '../../components/payment/PaymentScreen';
import { useThemeColors } from '../../hooks';

export default function PaymentScreenWrapper({ route, navigation }: any) {
    const { bookingId, amount, propertyTitle } = route.params;
    const { bgColor } = useThemeColors();

    const handleSuccess = () => {
        // Navigate to booking success/confirmation screen
        navigation.replace('MyTrips', {
            screen: 'MyTrips',
            params: { refresh: true }
        });
    };

    const handleCancel = () => {
        // Go back to previous screen
        navigation.goBack();
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <PaymentScreen
                bookingId={bookingId}
                amount={amount}
                propertyTitle={propertyTitle}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </View>
    );
}
