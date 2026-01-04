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
    isHost?: boolean;      // Backend field for hosting status
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
            // First check if token exists
            const token = await authService.getToken();
            if (!token) {
                setIsLoading(false);
                return;
            }

            // Try to get fresh profile from backend
            try {
                const currentUser = await authService.getProfile();

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
                        isLandlord: currentUser.isHost || currentUser.isLandlord || false,
                    });
                }
            } catch (profileError) {
                console.log('Failed to fetch profile (offline?), falling back to local storage', profileError);
                // Fallback to local storage if offline
                const cachedUser = await authService.getCurrentUser();
                if (cachedUser) {
                    setUser(cachedUser);
                }
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
                    isHost: userData.isHost,
                    isLandlord: userData.isHost || userData.isLandlord || false,
                });
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed in context:', error);
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
                    isHost: userData.isHost,
                    isLandlord: userData.isHost || userData.isLandlord || false,
                });
            } else {
                throw new Error(response.message || 'Google login failed');
            }
        } catch (error) {
            console.error('Google login failed in context:', error);
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
                    isHost: userData.isHost,
                    isLandlord: userData.isHost || userData.isLandlord || false,
                });
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration failed in context:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            // Clear local persistence flag
            await AsyncStorage.removeItem('hasActivatedHosting');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
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
                isHost: userData.isHost,
                isLandlord: userData.isHost || userData.isLandlord || false, // Sync from backend using isHost
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
                isHost: updatedUser.isHost,
                isLandlord: updatedUser.isHost || updatedUser.isLandlord || false,
            });
        } catch (error) {
            console.error('Update profile failed:', error);
            throw error;
        }
    };

    const activateHosting = async () => {
        try {
            if (!user) throw new Error('User not logged in');

            // Call backend to activate hosting
            const updatedUser = await authService.activateHosting();

            setUser({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                phone: updatedUser.phone,
                dateOfBirth: updatedUser.dateOfBirth,
                role: updatedUser.role,
                isHost: true, // Force true
                isLandlord: true, // Force true
            });

            // Navigate to creating property handled by UI
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
