import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolateColor,
} from 'react-native-reanimated';
import { AnimatedBackgroundProps } from '../types';

export function AnimatedBackground({ scrollX, slides }: AnimatedBackgroundProps) {
    const backgroundStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            scrollX.value,
            slides.map((_, i) => i),
            slides.map(slide => slide.gradient[0])
        );

        return {
            backgroundColor,
        };
    });

    return (
        <Animated.View
            style={[StyleSheet.absoluteFillObject, backgroundStyle]}
            className="opacity-10"
        />
    );
}
