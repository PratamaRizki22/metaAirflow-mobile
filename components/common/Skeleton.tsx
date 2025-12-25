import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
    const { isDark } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

export function PropertyCardSkeleton() {
    return (
        <View style={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden' }}>
            <Skeleton width="100%" height={200} borderRadius={16} />
            <View style={{ padding: 12 }}>
                <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={20} />
            </View>
        </View>
    );
}

export function PropertyDetailSkeleton() {
    return (
        <View>
            <Skeleton width="100%" height={300} borderRadius={0} />
            <View style={{ padding: 24 }}>
                <Skeleton width="90%" height={28} style={{ marginBottom: 12 }} />
                <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={20} style={{ marginBottom: 24 }} />

                <Skeleton width="100%" height={1} style={{ marginBottom: 24 }} />

                <Skeleton width="100%" height={100} style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height={60} />
            </View>
        </View>
    );
}
