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
        // DEVELOPMENT: Using deployed backend public domain (HTTPS)
        baseURL: 'https://rentverse-api.loseyourip.com/api',
        timeout: 30000, // Increased to 30 seconds for payment operations
    },
    production: {
        // PRODUCTION: Using deployed backend public domain (HTTPS)
        baseURL: API_BASE_URL || 'https://rentverse-api.loseyourip.com/api',
        timeout: 15000,
    },
};

// Google Sign In - Pakai .env dengan fallback
const GOOGLE_CONFIG = {
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
};

// Stripe Configuration - Pakai .env dengan fallback
const STRIPE_CONFIG = {
    publishableKey: STRIPE_PUBLISHABLE_KEY,
};

// MapTiler Configuration - Pakai .env dengan fallback
const MAPTILER_CONFIG = {
    apiKey: MAPTILER_API_KEY,
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
