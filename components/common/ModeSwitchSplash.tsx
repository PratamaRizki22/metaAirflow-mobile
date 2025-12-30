import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ModeSwitchSplashProps {
    targetMode: 'tenant' | 'landlord';
}

export function ModeSwitchSplash({ targetMode }: ModeSwitchSplashProps) {
    const isTenantMode = targetMode === 'tenant';
    const gradientColors = isTenantMode
        ? ['#6366F1', '#8B5CF6'] as const // Purple for tenant
        : ['#10B981', '#059669'] as const; // Green for landlord

    return (
        <LinearGradient
            colors={gradientColors}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
            {/* Logo */}
            <Image
                source={require('../../assets/icon.png')}
                style={{
                    width: 120,
                    height: 120,
                    marginBottom: 24,
                }}
                resizeMode="contain"
            />

            {/* Loading Indicator */}
            <ActivityIndicator size="large" color="white" />
        </LinearGradient>
    );
}
