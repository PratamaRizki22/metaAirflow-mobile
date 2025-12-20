import React, { useEffect } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
    const { isDark } = useTheme();
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.9);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';

    return (
        <View className={`flex-1 items-center justify-center ${bgColor}`}>
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                    alignItems: 'center',
                }}
            >
                <View className="w-32 h-32 rounded-full bg-primary items-center justify-center">
                    <Text className="text-white text-5xl font-bold">M</Text>
                </View>
            </Animated.View>
        </View>
    );
}
