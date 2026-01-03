import { OnboardingSlide } from './types';

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Welcome to Rentverse',
        description: 'Find your dream property with ease and convenience',
        image: require('../../assets/onboarding/Onboarding Page-1.png'),
        gradient: ['#667eea', '#764ba2'],
    },
    {
        id: '2',
        title: 'Explore Properties',
        description: 'Browse thousands of apartments, houses, and land listings',
        image: require('../../assets/onboarding/Onboarding Page-2.png'),
        gradient: ['#f093fb', '#f5576c'],
    },
    {
        id: '3',
        title: 'Easy Management',
        description: 'List and manage your properties effortlessly',
        image: require('../../assets/onboarding/Onboarding Page-3.png'),
        gradient: ['#4facfe', '#00f2fe'],
    },
];
