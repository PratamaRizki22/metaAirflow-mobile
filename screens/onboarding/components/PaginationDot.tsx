import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { PaginationDotProps } from '../types';

export function PaginationDot({ index, currentIndex }: PaginationDotProps) {
    const dotWidth = useSharedValue(8);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        if (index === currentIndex) {
            dotWidth.value = withTiming(24, { duration: 300 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            dotWidth.value = withTiming(8, { duration: 300 });
            opacity.value = withTiming(0.4, { duration: 300 });
        }
    }, [currentIndex, index]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: dotWidth.value,
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FFFFFF',
                    marginHorizontal: 4,
                },
                animatedStyle,
            ]}
        />
    );
}
