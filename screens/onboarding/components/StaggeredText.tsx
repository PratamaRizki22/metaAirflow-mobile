import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StaggeredTextProps } from '../types';

export function StaggeredText({ text, className, isActive }: StaggeredTextProps) {
    const words = text.split(' ');

    return (
        <View className="flex-row flex-wrap justify-center">
            {words.map((word, index) => (
                <Animated.Text
                    key={index}
                    entering={isActive ? FadeInDown.delay(index * 100).springify() : undefined}
                    className={`${className} mr-2`}
                >
                    {word}
                </Animated.Text>
            ))}
        </View>
    );
}
