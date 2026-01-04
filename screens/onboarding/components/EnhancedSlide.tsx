import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    FadeInUp,
} from 'react-native-reanimated';
import { EnhancedSlideProps } from '../types';

const { width } = Dimensions.get('window');

export function EnhancedSlide({ item, index, scrollX, currentIndex }: EnhancedSlideProps) {
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

    // Split title by newline for proper rendering
    const titleLines = item.title.split('\n');

    return (
        <View style={{ width }} className="flex-1 items-start justify-center px-8">
            <Animated.View style={titleStyle} className="w-full mb-4">
                {titleLines.map((line, idx) => (
                    <Text
                        key={idx}
                        className="text-5xl text-left text-white"
                        style={{
                            fontFamily: 'VisbyRound-DemiBold',
                            lineHeight: 56,
                            letterSpacing: 0,
                            width: '100%'
                        }}
                        numberOfLines={1}
                        allowFontScaling={false}
                    >
                        {line}
                    </Text>
                ))}
            </Animated.View>

            <Animated.View style={titleStyle} className="w-full">
                <Animated.Text
                    entering={FadeInUp.delay(400).springify()}
                    className="text-white"
                    style={{
                        fontFamily: 'VisbyRound-Medium',
                        fontSize: 16,
                        lineHeight: 24,
                        letterSpacing: 0,
                        textAlign: 'justify',
                        maxWidth: 312
                    }}
                >
                    {item.description}
                </Animated.Text>
            </Animated.View>
        </View>
    );
}
