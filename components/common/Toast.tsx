import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
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
        color: '#00D9A3',
        gradientColors: ['rgba(0, 217, 163, 0.15)', 'rgba(0, 217, 163, 0.25)'] as const,
        borderColor: 'rgba(0, 217, 163, 0.3)',
    },
    error: {
        icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
        color: '#EF4444',
        gradientColors: ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.25)'] as const,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    info: {
        icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
        color: '#3B82F6',
        gradientColors: ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.25)'] as const,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    warning: {
        icon: 'warning' as keyof typeof Ionicons.glyphMap,
        color: '#F59E0B',
        gradientColors: ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.25)'] as const,
        borderColor: 'rgba(245, 158, 11, 0.3)',
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

    const config = TOAST_CONFIG[type];

    const hideToast = () => {
        translateY.value = withTiming(position === 'top' ? -100 : 100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished && onHide) {
                runOnJS(onHide)();
            }
        });
    };

    useEffect(() => {
        if (visible) {
            // Show animation - smooth without bounce
            translateY.value = withTiming(0, { duration: 300 });
            opacity.value = withTiming(1, { duration: 300 });

            // Auto-hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            // Reset to initial position when hidden
            translateY.value = position === 'top' ? -100 : 100;
            opacity.value = 0;
        }
    }, [visible, duration, position, translateY, opacity, onHide]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
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
                colors={config.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderColor: config.borderColor }]}
            >
                <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                    <Ionicons name={config.icon} size={22} color={config.color} />
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
        left: 20,
        right: 20,
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
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.85)', // Dark semi-transparent background
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    message: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.2,
    },
});
