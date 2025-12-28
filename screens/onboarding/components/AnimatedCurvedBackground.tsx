import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { AnimatedCurvedBackgroundProps } from '../types';

const { width } = Dimensions.get('window');

export function AnimatedCurvedBackground({ currentIndex }: AnimatedCurvedBackgroundProps) {
    const curveAnim = useSharedValue(0);

    useEffect(() => {
        curveAnim.value = withSpring(currentIndex, { damping: 15 });
    }, [currentIndex]);

    return (
        <Svg
            height="220"
            width={width}
            viewBox={`0 0 ${width} 220`}
            style={StyleSheet.absoluteFillObject}
        >
            <Defs>
                <RadialGradient id="grad" cx="50%" cy="50%">
                    <Stop offset="0%" stopColor="#00D9A3" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#00B87C" stopOpacity="1" />
                </RadialGradient>
            </Defs>
            <Path
                d={`M 0 60 Q ${width / 4} 20 ${width / 2} 40 T ${width} 60 L ${width} 220 L 0 220 Z`}
                fill="url(#grad)"
            />
        </Svg>
    );
}
