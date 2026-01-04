import React, { useState, useRef } from 'react';
import { View, FlatList, ViewToken, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { EnhancedSlide } from './components/EnhancedSlide';
import { AnimatedBackground } from './components/AnimatedBackground';
import { PaginationDot } from './components/PaginationDot';
import { AnimatedButton } from './components/AnimatedButton';
import { ONBOARDING_SLIDES } from './constants';
import { OnboardingScreenProps, OnboardingSlide } from './types';

const { width } = Dimensions.get('window');

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const { isDark } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useSharedValue(0);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x / width;
        },
    });

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0) {
                const newIndex = viewableItems[0].index || 0;
                setCurrentIndex(newIndex);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < ONBOARDING_SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            onComplete();
        }
    };

    const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
        return (
            <EnhancedSlide
                item={item}
                index={index}
                scrollX={scrollX}
                currentIndex={currentIndex}
            />
        );
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <AnimatedBackground scrollX={scrollX} slides={ONBOARDING_SLIDES} />

            <Animated.FlatList
                ref={flatListRef}
                data={ONBOARDING_SLIDES}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            />

            <View className="absolute bottom-0 left-0 right-0 px-8" style={{ paddingBottom: 100 }}>
                <View className="flex-row justify-between" style={{ height: 56, alignItems: 'center' }}>
                    <View className="flex-row items-center">
                        {ONBOARDING_SLIDES.map((_, index) => (
                            <PaginationDot
                                key={index}
                                index={index}
                                currentIndex={currentIndex}
                                scrollX={scrollX}
                            />
                        ))}
                    </View>

                    <AnimatedButton
                        currentIndex={currentIndex}
                        totalSlides={ONBOARDING_SLIDES.length}
                        onPress={handleNext}
                    />
                </View>
            </View>
        </View>
    );
}
