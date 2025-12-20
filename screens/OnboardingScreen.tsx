import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ViewToken,
    StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import LottieView from 'lottie-react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    title: string;
    description: string;
    animation: any;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Welcome to MetaAirflow',
        description: 'Find your dream property with ease and convenience',
        animation: require('../assets/animations/onboarding-1.json'),
    },
    {
        id: '2',
        title: 'Explore Properties',
        description: 'Browse thousands of apartments, houses, and land listings',
        animation: require('../assets/animations/onboarding-2.json'),
    },
    {
        id: '3',
        title: 'Easy Management',
        description: 'List and manage your properties effortlessly',
        animation: require('../assets/animations/onboarding-3.json'),
    },
];

interface OnboardingScreenProps {
    onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const { isDark } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const secondaryTextColor = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0) {
                setCurrentIndex(viewableItems[0].index || 0);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <View className="h-80 w-80 items-center justify-center mb-8">
                <LottieView
                    source={item.animation}
                    autoPlay
                    loop
                    style={{ width: 320, height: 320 }}
                />
            </View>

            <Text className={`text-3xl font-bold text-center mb-4 ${textColor}`}>
                {item.title}
            </Text>

            <Text className={`text-base text-center ${secondaryTextColor}`}>
                {item.description}
            </Text>
        </View>
    );

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Skip Button */}
            <TouchableOpacity
                onPress={handleSkip}
                className="absolute top-12 right-6 z-10 px-4 py-2"
            >
                <Text className="text-primary font-semibold">Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            {/* Bottom Section */}
            <View className="pb-12 px-8">
                {/* Pagination Dots */}
                <View className="flex-row justify-center mb-8">
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 rounded-full mx-1 ${index === currentIndex
                                ? 'bg-primary w-8'
                                : isDark
                                    ? 'bg-border-dark w-2'
                                    : 'bg-border-light w-2'
                                }`}
                        />
                    ))}
                </View>

                {/* Next/Get Started Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    className="bg-primary rounded-lg py-4"
                >
                    <Text className="text-white text-center font-semibold text-base">
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
