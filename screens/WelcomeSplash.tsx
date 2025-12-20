import React, { useEffect } from 'react';
import { View, Animated, Dimensions, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface WelcomeSplashProps {
    onFinish: () => void;
}

export function WelcomeSplash({ onFinish }: WelcomeSplashProps) {
    const { isDark } = useTheme();
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';

    return (
        <View className={`flex-1 ${bgColor}`}>
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    flex: 1,
                }}
            >
                <Image
                    source={require('../assets/welcome-splash.webp')}
                    style={{
                        width: width,
                        height: height,
                        resizeMode: 'cover',
                    }}
                />
            </Animated.View>
        </View>
    );
}
