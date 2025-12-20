import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, View, Appearance } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    // Start with 'system' theme to follow device settings
    // When device is in dark mode, app will be dark; when light, app will be light
    // Users can override by selecting 'light' or 'dark' explicitly
    const [theme, setTheme] = useState<Theme>('system');

    const isDark = theme === 'system'
        ? (systemColorScheme ?? 'light') === 'dark'
        : theme === 'dark';

    // Force the app to use the selected color scheme
    useEffect(() => {
        if (theme === 'system') {
            // Reset to system preference
            Appearance.setColorScheme(null);
        } else {
            // Force light or dark mode
            Appearance.setColorScheme(theme);
        }

        console.log('=== APPEARANCE SET ===');
        console.log('Setting Appearance to:', theme === 'system' ? 'null (system)' : theme);
        console.log('======================');
    }, [theme]);

    // Log on initial mount to verify system detection
    useEffect(() => {
        console.log('=== INITIAL MOUNT ===');
        console.log('System detected as:', systemColorScheme);
        console.log('====================');
    }, []);

    useEffect(() => {
        console.log('=== THEME DEBUG ===');
        console.log('Selected theme:', theme);
        console.log('System color scheme:', systemColorScheme);
        console.log('Calculated isDark:', isDark);
        console.log('Should show DARK UI:', isDark ? 'YES' : 'NO');
        console.log('Should show LIGHT UI:', isDark ? 'NO' : 'YES');
        console.log('==================');
    }, [theme, isDark, systemColorScheme]);

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
