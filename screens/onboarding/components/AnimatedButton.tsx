import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedButtonProps } from '../types';

export function AnimatedButton({ currentIndex, totalSlides, onPress }: AnimatedButtonProps) {
    const isLastSlide = currentIndex === totalSlides - 1;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                height: 56,
                width: isLastSlide ? 160 : 56,
                borderRadius: 28,
                backgroundColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {isLastSlide ? (
                <Text className="text-primary text-center font-bold text-base">
                    Get Started
                </Text>
            ) : (
                <Ionicons name="arrow-forward" size={24} color="#00D9A3" />
            )}
        </TouchableOpacity>
    );
}
