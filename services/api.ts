import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Base URL - menggunakan environment variable
const BASE_URL = API_BASE_URL || 'http://192.168.1.116:3000/api';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // Increased timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - untuk menambahkan token ke setiap request
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token from storage:', error);
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
            console.error('Network Error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
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
