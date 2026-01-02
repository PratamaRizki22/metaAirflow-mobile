import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export type UserMode = 'tenant' | 'landlord';

interface ModeContextType {
    mode: UserMode;
    switchMode: () => Promise<void>;
    canSwitchMode: boolean;
    isLandlordMode: boolean;
    isTenantMode: boolean;
    isSwitchingMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = '@user_mode';

export function ModeProvider({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth();
    const [mode, setMode] = useState<UserMode>('tenant');
    const [isSwitchingMode, setIsSwitchingMode] = useState(false);

    // Check if user can switch mode (any logged-in user can switch)
    const canSwitchMode = !!user;

    // Load saved mode preference whenever auth loading finishes or user changes
    useEffect(() => {
        const loadMode = async () => {
            // Only proceed if auth loading is done
            if (isLoading) return;

            try {
                const savedMode = await AsyncStorage.getItem(MODE_STORAGE_KEY);

                // Logic:
                // 1. If saved mode exists, restore it
                // 2. Otherwise, default to Tenant
                if (savedMode === 'landlord' || savedMode === 'tenant') {
                    setMode(savedMode);
                } else {
                    setMode('tenant');
                }
            } catch (error) {
                console.error('Error loading mode preference:', error);
                setMode('tenant');
            }
        };

        loadMode();
    }, [isLoading, user]);

    const switchMode = async () => {
        if (!user) {
            console.warn('User must be logged in to switch mode');
            return;
        }

        const newMode: UserMode = mode === 'tenant' ? 'landlord' : 'tenant';

        try {
            setIsSwitchingMode(true);
            await AsyncStorage.setItem(MODE_STORAGE_KEY, newMode);

            // Small delay to show loading state and allow screens to prepare
            await new Promise(resolve => setTimeout(resolve, 800));

            setMode(newMode);
        } catch (error) {
            console.error('Error saving mode preference:', error);
        } finally {
            // Keep loading a bit longer to ensure navigation completes
            setTimeout(() => {
                setIsSwitchingMode(false);
            }, 300);
        }
    };

    const value: ModeContextType = {
        mode,
        switchMode,
        canSwitchMode,
        isLandlordMode: mode === 'landlord',
        isTenantMode: mode === 'tenant',
        isSwitchingMode,
    };

    return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
    const context = useContext(ModeContext);
    if (context === undefined) {
        throw new Error('useMode must be used within a ModeProvider');
    }
    return context;
}
