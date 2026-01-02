import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { BaseService } from './BaseService';
import {
    RegisterRequest,
    LoginRequest,
    UpdateProfileRequest,
    AuthResponse,
    User
} from '../types/api';

class AuthService extends BaseService {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/v1/m/auth/register', data);

            // Save token and user data to AsyncStorage
            if (response.data.success && response.data.data) {
                await this.saveAuthData(
                    response.data.data.token,
                    response.data.data.user
                );
            }

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Login user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/v1/m/auth/login', data);

            // Save token and user data to AsyncStorage
            if (response.data.success && response.data.data) {
                await this.saveAuthData(
                    response.data.data.token,
                    response.data.data.user
                );
            }

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Check if email exists in the system
     */
    async checkEmail(email: string): Promise<{ exists: boolean }> {
        try {
            const response = await api.post<{ success: boolean; data: { exists: boolean } }>(
                '/v1/m/auth/check-email',
                { email }
            );

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error('Failed to check email');
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Login with Google
     */
    async loginWithGoogle(idToken: string): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/v1/m/auth/google', { idToken });

            // Save token and user data to AsyncStorage
            if (response.data.success && response.data.data) {
                await this.saveAuthData(
                    response.data.data.token,
                    response.data.data.user
                );
            }

            return response.data;
        } catch (error: any) {
            console.error('Google login error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            // Try to call logout endpoint (may not exist)
            await api.post('/auth/logout');
        } catch (error: any) {
            // Ignore 404 - backend may not have logout endpoint
            if (error.response?.status !== 404) {
                console.error('Logout error:', error);
            }
        } finally {
            // Always clear local storage
            await this.clearAuthData();
        }
    }

    /**
     * Get current user profile from backend
     */
    async getProfile(): Promise<User> {
        try {
            const response = await api.get<{ success: boolean; data: User }>('/v1/m/auth/me');

            if (response.data.success && response.data.data) {
                // Update local storage with fresh user data
                await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));
                return response.data.data;
            }

            throw new Error('Failed to get user profile');
        } catch (error: any) {
            console.error('Get profile error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(data: UpdateProfileRequest): Promise<User> {
        try {
            // Backend returns: { success: true, data: { user: User } }
            const response = await api.patch<{ success: boolean; message: string; data: { user: User } }>('/v1/users/profile', data);

            if (response.data.success && response.data.data) {
                // Update local storage with updated user data
                const userData = response.data.data.user;
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                return userData;
            }

            throw new Error('Failed to update profile');
        } catch (error: any) {
            console.error('Update profile error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Activate hosting mode
     */
    async activateHosting(): Promise<User> {
        try {
            const response = await api.post<{ success: boolean; message: string; data: { user: User } }>('/v1/users/activate-hosting');

            if (response.data.success && response.data.data) {
                // Update local storage with updated user data
                const userData = response.data.data.user;
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                return userData;
            }

            throw new Error('Failed to activate hosting');
        } catch (error: any) {
            console.error('Activate hosting error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Refresh JWT token
     */
    async refreshToken(): Promise<string> {
        try {
            const response = await api.post<{ success: boolean; data: { token: string } }>('/v1/m/auth/refresh-token');

            if (response.data.success && response.data.data?.token) {
                // Update token in AsyncStorage
                await AsyncStorage.setItem('authToken', response.data.data.token);
                return response.data.data.token;
            }

            throw new Error('Failed to refresh token');
        } catch (error: any) {
            console.error('Refresh token error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Request password reset email
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        try {
            console.log('🔐 [AuthService] Forgot password request started');
            console.log('📧 [AuthService] Email:', email);
            console.log('🌐 [AuthService] API endpoint: /v1/m/auth/forgot-password');
            console.log('🌐 [AuthService] Base URL:', api.defaults.baseURL);

            const response = await api.post<{ success: boolean; message: string }>(
                '/v1/m/auth/forgot-password',
                { email }
            );

            console.log('✅ [AuthService] Response received:', response.data);

            if (response.data.success) {
                console.log('✅ [AuthService] Password reset email sent successfully');
                return { message: response.data.message };
            }

            console.error('❌ [AuthService] Request succeeded but success flag is false');
            throw new Error('Failed to send password reset email');
        } catch (error: any) {
            console.error('❌ [AuthService] Forgot password error caught');
            console.error('❌ [AuthService] Error:', error);
            console.error('❌ [AuthService] Response data:', error.response?.data);
            console.error('❌ [AuthService] Response status:', error.response?.status);
            console.error('❌ [AuthService] Error message:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Reset password using token
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        try {
            const response = await api.post<{ success: boolean; message: string }>(
                '/v1/m/auth/reset-password',
                { token, newPassword }
            );

            if (response.data.success) {
                return { message: response.data.message };
            }

            throw new Error('Failed to reset password');
        } catch (error: any) {
            console.error('Reset password error:', error.response?.data || error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get current user from storage
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const userJson = await AsyncStorage.getItem('userData');
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Get auth token from storage
     */
    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('authToken');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    }

    /**
     * Save authentication data to AsyncStorage
     */
    private async saveAuthData(token: string, user: User): Promise<void> {
        try {
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw error;
        }
    }

    /**
     * Clear authentication data from AsyncStorage
     */
    private async clearAuthData(): Promise<void> {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    }


}

export default new AuthService();
