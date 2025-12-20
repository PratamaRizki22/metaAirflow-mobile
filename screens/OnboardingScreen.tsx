import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ViewToken,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import LottieView from 'lottie-react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

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

            {/* Bottom Section with Curved Shape */}
            <View className="absolute bottom-0 left-0 right-0" style={{ height: 200 }}>
                {/* SVG Curved Background */}
                <Svg
                    height="200"
                    width={width}
                    viewBox={`0 0 ${width} 200`}
                    style={StyleSheet.absoluteFillObject}
                >
                    <Path
                        d={`M 0 60 Q ${width / 4} 20 ${width / 2} 40 T ${width} 60 L ${width} 200 L 0 200 Z`}
                        fill="#14B8A6"
                    />
                </Svg>

                {/* Content on top of curve */}
                <View className="flex-1 justify-end px-8" style={{ paddingBottom: 60, marginBottom: 8 }}>
                    {/* Pagination Dots and Button in one row */}
                    <View className="flex-row justify-between" style={{ height: 56, alignItems: 'center' }}>
                        {/* Pagination Dots */}
                        <View className="flex-row items-center">
                            {slides.map((_, index) => (
                                <View
                                    key={index}
                                    style={{
                                        width: index === currentIndex ? 24 : 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: index === currentIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                                        marginHorizontal: 3,
                                    }}
                                />
                            ))}
                        </View>

                        {/* Button: Circular Arrow or Get Started */}
                        {currentIndex === slides.length - 1 ? (
                            // Last slide: Get Started button
                            <TouchableOpacity
                                onPress={handleNext}
                                className="bg-white items-center justify-center px-10"
                                style={{
                                    height: 56,
                                    borderRadius: 28,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 6,
                                    elevation: 4,
                                }}
                            >
                                <Text className="text-primary text-center font-bold text-base">
                                    Get Started
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            // Other slides: Circular Next Button
                            <TouchableOpacity
                                onPress={handleNext}
                                className="bg-white items-center justify-center"
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 6,
                                    elevation: 4,
                                }}
                            >
                                <Ionicons name="arrow-forward" size={24} color="#14B8A6" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
