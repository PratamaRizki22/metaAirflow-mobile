import { SharedValue } from 'react-native-reanimated';

export interface OnboardingSlide {
    id: string;
    title: string;
    description: string;
    image?: any;
    gradient: string[];
}

export interface OnboardingScreenProps {
    onComplete: () => void;
}

export interface EnhancedSlideProps {
    item: OnboardingSlide;
    index: number;
    scrollX: SharedValue<number>;
    currentIndex: number;
}

export interface StaggeredTextProps {
    text: string;
    className: string;
    isActive: boolean;
}

export interface AnimatedBackgroundProps {
    scrollX: SharedValue<number>;
    slides: OnboardingSlide[];
}

export interface FloatingElementsProps {
    scrollX: SharedValue<number>;
}

export interface AnimatedCurvedBackgroundProps {
    currentIndex: number;
}

export interface ProgressBarProps {
    currentIndex: number;
    totalSlides: number;
}

export interface PaginationDotProps {
    index: number;
    currentIndex: number;
    scrollX: SharedValue<number>;
}

export interface AnimatedButtonProps {
    currentIndex: number;
    totalSlides: number;
    onPress: () => void;
}
