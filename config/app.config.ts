/**
 * Application Configuration
 * Centralized config untuk semua environment variables
 * 
 * CARA KERJA:
 * - Development: Pakai hardcoded values (gampang diganti, no caching issue)
 * - Production: Pakai .env values (secure, API keys tidak di-commit ke git)
 */

import {
    API_BASE_URL,
    GOOGLE_WEB_CLIENT_ID,
    GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID,
    STRIPE_PUBLISHABLE_KEY,
    MAPTILER_API_KEY
} from '@env';

// Determine environment
const ENV = __DEV__ ? 'development' : 'production';

// API Configuration
const API_CONFIG = {
    development: {
        // DEVELOPMENT: Hardcoded, gampang diganti tanpa rebuild
        baseURL: 'https://rentverse-api.loseyourip.com/api',
        timeout: 12000,
    },
    production: {
        // PRODUCTION: Pakai .env (secure)
        baseURL: API_BASE_URL || 'https://api.rentverse.com/api',
        timeout: 15000,
    },
};

// Google Sign In - Pakai .env dengan fallback
const GOOGLE_CONFIG = {
    webClientId: GOOGLE_WEB_CLIENT_ID || '244090215248-e6ddlhhs5k2jm1a8188frkmc0duhfu5u.apps.googleusercontent.com',
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || '244090215248-grk4peffmtc1v5i5b1995jssh9gqf67l.apps.googleusercontent.com',
    iosClientId: GOOGLE_IOS_CLIENT_ID || '244090215248-fft91vvkrc0r44qqjlkmb49pb1nrb2ac.apps.googleusercontent.com',
};

// Stripe Configuration - Pakai .env dengan fallback
const STRIPE_CONFIG = {
    publishableKey: STRIPE_PUBLISHABLE_KEY || 'pk_test_51ShqrGCsn5Xkvl6ITYXzgwa5Wwy8N5MrzazbFcVPcPS8zhxZBTEjZ5lDnQkDJith3nxEVSnGecE3Nf4rijGMNlEd00VnHLug1j',
};

// MapTiler Configuration - Pakai .env dengan fallback
const MAPTILER_CONFIG = {
    apiKey: MAPTILER_API_KEY || 'CNmR4fJvRK89a2UaoY91',
};

// Export configuration
export const Config = {
    env: ENV,
    api: API_CONFIG[ENV],
    google: GOOGLE_CONFIG,
    stripe: STRIPE_CONFIG,
    maptiler: MAPTILER_CONFIG,

    // Feature flags
    features: {
        enableAIChat: true,
        enableGoogleSignIn: true,
        enableAppleSignIn: false,
    },

    // Debug
    debug: __DEV__,
};

// Log configuration on startup (only in dev)
if (__DEV__) {
    console.log('=== App Configuration ===');
    console.log('Environment:', Config.env);
    console.log('API Base URL:', Config.api.baseURL);
    console.log('Debug Mode:', Config.debug);
    console.log('========================');
}

export default Config;
