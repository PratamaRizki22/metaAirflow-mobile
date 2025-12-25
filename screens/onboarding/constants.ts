import { OnboardingSlide } from './types';

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Welcome to Rentverse',
        description: 'Find your dream property with ease and convenience',
        animation: require('../../assets/animations/onboarding-1.json'),
        gradient: ['#667eea', '#764ba2'],
    },
    {
        id: '2',
        title: 'Explore Properties',
        description: 'Browse thousands of apartments, houses, and land listings',
        animation: require('../../assets/animations/onboarding-2.json'),
        gradient: ['#f093fb', '#f5576c'],
    },
    {
        id: '3',
        title: 'Easy Management',
        description: 'List and manage your properties effortlessly',
        animation: require('../../assets/animations/onboarding-3.json'),
        gradient: ['#4facfe', '#00f2fe'],
    },
];
