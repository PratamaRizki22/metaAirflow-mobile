import React, { useEffect, useRef } from 'react';
import { View, Animated, Image } from 'react-native';

interface WelcomeSplashProps {
    onFinish: () => void;
}

export function WelcomeSplash({ onFinish }: WelcomeSplashProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 4000);

        return () => clearTimeout(timer);
    }, [fadeAnim, onFinish]);

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            >
                <Image
                    source={require('../../assets/welcome-splash.webp')}
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
