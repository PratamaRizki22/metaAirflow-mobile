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
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = '@user_mode';

export function ModeProvider({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth();
    const [mode, setMode] = useState<UserMode>('tenant');

    // Check if user can switch mode (has landlord access)
    const canSwitchMode = user?.isLandlord === true;

    // Load saved mode preference whenever auth loading finishes or user changes
    useEffect(() => {
        const loadMode = async () => {
            // Only proceed if auth loading is done
            if (isLoading) return;

            try {
                const savedMode = await AsyncStorage.getItem(MODE_STORAGE_KEY);

                // Logic:
                // 1. If saved is 'landlord' AND user is actually a landlord => Restore Landlord
                // 2. Otherwise => Default to Tenant
                if (savedMode === 'landlord' && user?.isLandlord) {
                    setMode('landlord');
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
        if (!canSwitchMode) {
            console.warn('User cannot switch mode - not a landlord');
            return;
        }

        const newMode: UserMode = mode === 'tenant' ? 'landlord' : 'tenant';

        try {
            await AsyncStorage.setItem(MODE_STORAGE_KEY, newMode);
            setMode(newMode);
        } catch (error) {
            console.error('Error saving mode preference:', error);
        }
    };

    const value: ModeContextType = {
        mode,
        switchMode,
        canSwitchMode,
        isLandlordMode: mode === 'landlord',
        isTenantMode: mode === 'tenant',
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
