import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    FadeInUp,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { EnhancedSlideProps } from '../types';
import { StaggeredText } from './StaggeredText';

const { width } = Dimensions.get('window');

export function EnhancedSlide({ item, index, scrollX, currentIndex }: EnhancedSlideProps) {
    const { isDark } = useTheme();
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const secondaryTextColor = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';

    const lottieStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const scale = interpolate(
            scrollX.value * width,
            inputRange,
            [0.8, 1, 0.8],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(
            scrollX.value * width,
            inputRange,
            [50, 0, 50],
            Extrapolate.CLAMP
        );

        const rotateZ = interpolate(
            scrollX.value * width,
            inputRange,
            [-10, 0, 10],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { scale },
                { translateY },
                { rotateZ: `${rotateZ}deg` },
            ],
        };
    });

    const titleStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const translateX = interpolate(
            scrollX.value * width,
            inputRange,
            [-width * 0.3, 0, width * 0.3],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            scrollX.value * width,
            inputRange,
            [0, 1, 0],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateX }],
            opacity,
        };
    });

    return (
        <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <Animated.View
                style={[lottieStyle]}
                className="h-80 w-80 items-center justify-center mb-12"
            >
                <LottieView
                    source={item.animation}
                    autoPlay
                    loop
                    style={{ width: 320, height: 320 }}
                />
            </Animated.View>

            <Animated.View style={titleStyle}>
                <StaggeredText
                    text={item.title}
                    className={`text-3xl font-bold text-center mb-4 ${textColor}`}
                    isActive={index === currentIndex}
                />
            </Animated.View>

            <Animated.View style={titleStyle}>
                <Animated.Text
                    entering={FadeInUp.delay(400).springify()}
                    className={`text-base text-center px-4 ${secondaryTextColor}`}
                >
                    {item.description}
                </Animated.Text>
            </Animated.View>
        </View>
    );
}
