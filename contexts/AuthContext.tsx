import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
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
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        } catch (error) {
            console.error('Failed to check auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        // Mock login - replace with actual API call in production
        const mockUser: User = {
            id: '1',
            name: 'John Doe',
            email: email,
            avatar: 'https://i.pravatar.cc/150?img=1',
        };

        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
    };

    const register = async (name: string, email: string, password: string) => {
        // Mock register - replace with actual API call in production
        const mockUser: User = {
            id: Date.now().toString(),
            name: name,
            email: email,
        };

        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser(null);
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
                register,
                logout,
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
