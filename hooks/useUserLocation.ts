import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

interface UserLocation {
    latitude: number;
    longitude: number;
}

export const useUserLocation = () => {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const requestLocation = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            // 1. Request Permission
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                const msg = 'Permission to access location was denied';
                setErrorMsg(msg);
                Alert.alert(
                    'Permission Required',
                    'Please allow location access to find properties near you.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Settings', onPress: () => {
                                if (Platform.OS === 'ios') {
                                    Linking.openURL('app-settings:');
                                } else {
                                    Linking.openSettings();
                                }
                            }
                        }
                    ]
                );
                return null;
            }

            // 2. Get Current Position (High Accuracy)
            let currentPosition = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced, // Balanced is fast & enough for "nearby"
            });

            const userLoc = {
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
            };

            setLocation(userLoc);
            return userLoc;

        } catch (error: any) {
            setErrorMsg(error.message || 'Failed to get location');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        location,
        errorMsg,
        loading,
        requestLocation,
    };
};
