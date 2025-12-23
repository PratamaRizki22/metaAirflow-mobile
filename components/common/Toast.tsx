import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onHide?: () => void;
    position?: 'top' | 'bottom';
}

const TOAST_CONFIG = {
    success: {
        icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        colors: ['#10B981', '#059669'] as const,
        iconColor: '#FFFFFF',
    },
    error: {
        icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
        colors: ['#EF4444', '#DC2626'] as const,
        iconColor: '#FFFFFF',
    },
    info: {
        icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
        colors: ['#3B82F6', '#2563EB'] as const,
        iconColor: '#FFFFFF',
    },
    warning: {
        icon: 'warning' as keyof typeof Ionicons.glyphMap,
        colors: ['#F59E0B', '#D97706'] as const,
        iconColor: '#FFFFFF',
    },
};

export function Toast({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onHide,
    position = 'top',
}: ToastProps) {
    const translateY = useSharedValue(position === 'top' ? -100 : 100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    const config = TOAST_CONFIG[type];

    const hideToast = () => {
        translateY.value = withTiming(position === 'top' ? -100 : 100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished && onHide) {
                runOnJS(onHide)();
            }
        });
        scale.value = withTiming(0.8, { duration: 300 });
    };

    useEffect(() => {
        if (visible) {
            // Show animation
            translateY.value = withSpring(0, {
                damping: 15,
                stiffness: 150,
            });
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSequence(
                withSpring(1.05, { damping: 8 }),
                withSpring(1, { damping: 10 })
            );

            // Auto-hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            // Reset to initial position when hidden
            translateY.value = position === 'top' ? -100 : 100;
            opacity.value = 0;
            scale.value = 0.8;
        }
    }, [visible, duration, position, translateY, opacity, scale, onHide]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                position === 'top' ? styles.topPosition : styles.bottomPosition,
                animatedStyle,
            ]}
        >
            <LinearGradient
                colors={config.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={config.icon} size={24} color={config.iconColor} />
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {message}
                </Text>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
    },
    topPosition: {
        top: 60,
    },
    bottomPosition: {
        bottom: 100,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
});
