import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { AnimatedBackgroundProps } from '../types';

export function AnimatedBackground({ scrollX, slides }: AnimatedBackgroundProps) {
    return (
        <ImageBackground
            source={require('../../../assets/onboarding/Onboarding Page - 4 (2).png')}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
        />
    );
}
