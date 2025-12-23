import React, { useEffect, useRef } from 'react';
import { View, Animated, Image } from 'react-native';

interface SplashScreenProps {
    onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
    }, [fadeAnim, scaleAnim, onFinish]);

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            >
                <Image
                    source={require('../../assets/splash.png')}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'cover',
                    }}
                />
            </Animated.View>
        </View>
    );
}
