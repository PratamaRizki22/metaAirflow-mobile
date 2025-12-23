import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { FloatingElementsProps } from '../types';

export function FloatingElements({ scrollX }: FloatingElementsProps) {
    const circle1Y = useSharedValue(0);
    const circle2Y = useSharedValue(0);
    const circle3Y = useSharedValue(0);

    useEffect(() => {
        circle1Y.value = withRepeat(
            withSequence(
                withTiming(20, { duration: 2000 }),
                withTiming(0, { duration: 2000 })
            ),
            -1,
            false
        );

        circle2Y.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 2500 }),
                withTiming(0, { duration: 2500 })
            ),
            -1,
            false
        );

        circle3Y.value = withRepeat(
            withSequence(
                withTiming(25, { duration: 3000 }),
                withTiming(0, { duration: 3000 })
            ),
            -1,
            false
        );
    }, []);

    const circle1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: circle1Y.value }],
    }));

    const circle2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: circle2Y.value }],
    }));

    const circle3Style = useAnimatedStyle(() => ({
        transform: [{ translateY: circle3Y.value }],
    }));

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Animated.View
                style={[circle1Style, { position: 'absolute', top: 100, left: 30 }]}
                className="w-20 h-20 rounded-full bg-primary/10"
            />
            <Animated.View
                style={[circle2Style, { position: 'absolute', top: 200, right: 40 }]}
                className="w-32 h-32 rounded-full bg-primary/5"
            />
            <Animated.View
                style={[circle3Style, { position: 'absolute', bottom: 300, left: 50 }]}
                className="w-24 h-24 rounded-full bg-primary/8"
            />
        </View>
    );
}
