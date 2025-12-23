import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { ProgressBarProps } from '../types';

export function ProgressBar({ currentIndex, totalSlides }: ProgressBarProps) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withSpring((currentIndex + 1) / totalSlides, { damping: 15 });
    }, [currentIndex]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    return (
        <View className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-4">
            <Animated.View
                style={[progressStyle]}
                className="h-full bg-white rounded-full"
            />
        </View>
    );
}
