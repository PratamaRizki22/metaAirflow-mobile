import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/app.config';

// Create axios instance
const api = axios.create({
    baseURL: Config.api.baseURL,
    timeout: Config.api.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
    // Add retry configuration
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors
});

// Request interceptor - untuk menambahkan token ke setiap request
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // Log untuk debugging (only log first 20 chars untuk security)
                if (__DEV__) {
                    console.log('🔑 Token attached:', token.substring(0, 20) + '...');
                }
            } else {
                console.warn('⚠️  No auth token found in storage');
            }
            
            // Log full request URL for debugging
            if (__DEV__) {
                const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
                console.log('📤 Request:', config.method?.toUpperCase(), fullUrl);
            }
        } catch (error) {
            console.error('❌ Error getting token from storage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - untuk handle errors dan auto-refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle network errors specifically
        if (!error.response) {
            // Preserve original error for better debugging
            console.error('🔴 Network error intercepted:', {
                message: error.message,
                code: error.code,
                config: error.config ? {
                    url: error.config.url,
                    method: error.config.method,
                    baseURL: error.config.baseURL,
                } : 'no config',
            });
            // Keep the original error with config intact
            error.message = 'Network error. Please check your connection.';
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        // blocking infinite loop if refresh-token itself returns 401
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('refresh-token')) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh token
                const response = await api.post<{ success: boolean; data: { token: string } }>('/v1/m/auth/refresh-token');

                if (response.data.success && response.data.data?.token) {
                    const newToken = response.data.data.token;
                    await AsyncStorage.setItem('authToken', newToken);

                    // Update authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    processQueue(null, newToken);
                    isRefreshing = false;

                    // Retry original request with new token
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Token refresh failed - clear storage and logout
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('userData');

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
