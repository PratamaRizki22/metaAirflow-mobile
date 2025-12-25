import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface OfflineBannerProps {
    isOffline: boolean;
}

/**
 * Banner that appears when user is offline
 * Shows at the top of the screen with animation
 */
export function OfflineBanner({ isOffline }: OfflineBannerProps) {
    if (!isOffline) return null;

    return (
        <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOutUp.duration(300)}
            className="bg-red-500 px-4 py-3 flex-row items-center justify-center"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
            }}
        >
            <Ionicons name="cloud-offline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
                No Internet Connection
            </Text>
        </Animated.View>
    );
}
