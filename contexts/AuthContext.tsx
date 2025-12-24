import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

interface User {
    id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    role?: string;
    avatar?: string;
    isLandlord?: boolean;  // Client-side flag for dual role
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, password: string, phone: string, dateOfBirth: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    activateHosting: () => Promise<void>;  // Activate landlord features
    continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser({
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    phone: currentUser.phone,
                    dateOfBirth: currentUser.dateOfBirth,
                    role: currentUser.role,
                });
            }
        } catch (error) {
            console.error('Failed to check auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });

            if (response.success && response.data) {
                const userData = response.data.user;
                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    dateOfBirth: userData.dateOfBirth,
                    role: userData.role,
                });
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const loginWithGoogle = async (idToken: string) => {
        try {
            const response = await authService.loginWithGoogle(idToken);

            if (response.success && response.data) {
                const userData = response.data.user;
                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    dateOfBirth: userData.dateOfBirth,
                    role: userData.role,
                });
            }
        } catch (error) {
            console.error('Google login failed:', error);
            throw error;
        }
    };

    const register = async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        phone: string,
        dateOfBirth: string
    ) => {
        try {
            const response = await authService.register({
                firstName,
                lastName,
                email,
                password,
                phone,
                dateOfBirth,
            });

            if (response.success && response.data) {
                const userData = response.data.user;
                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    dateOfBirth: userData.dateOfBirth,
                    role: userData.role,
                });
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    const refreshProfile = async () => {
        try {
            const userData = await authService.getProfile();
            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                dateOfBirth: userData.dateOfBirth,
                role: userData.role,
            });
        } catch (error) {
            console.error('Refresh profile failed:', error);
            throw error;
        }
    };

    const updateProfile = async (data: any) => {
        try {
            const updatedUser = await authService.updateProfile(data);
            setUser({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                phone: updatedUser.phone,
                dateOfBirth: updatedUser.dateOfBirth,
                role: updatedUser.role,
            });
        } catch (error) {
            console.error('Update profile failed:', error);
            throw error;
        }
    };

    const activateHosting = async () => {
        try {
            if (!user) throw new Error('User not logged in');

            // Update user with landlord flag (client-side only)
            const updatedUser = {
                ...user,
                isLandlord: true
            };

            setUser(updatedUser);
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Activate hosting failed:', error);
            throw error;
        }
    };

    const continueAsGuest = () => {
        // User continues without login
        // No need to set anything, just let them browse
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isLoading,
                login,
                loginWithGoogle,
                register,
                logout,
                refreshProfile,
                updateProfile,
                activateHosting,
                continueAsGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
