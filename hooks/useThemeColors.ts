import { useTheme } from '../contexts/ThemeContext';

/**
 * Custom hook untuk mendapatkan theme colors yang sering digunakan
 * Mengurangi duplikasi kode di setiap screen/component
 */
export function useThemeColors() {
    const { isDark } = useTheme();

    return {
        // Background colors
        bgColor: isDark ? 'bg-background-dark' : 'bg-background-light',
        cardBg: isDark ? 'bg-card-dark' : 'bg-card-light',
        surfaceBg: isDark ? 'bg-surface-dark' : 'bg-surface-light',

        // Text colors
        textColor: isDark ? 'text-text-primary-dark' : 'text-text-primary-light',
        secondaryTextColor: isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light',
        mutedTextColor: isDark ? 'text-gray-400' : 'text-gray-500',

        // Border colors
        borderColor: isDark ? 'border-gray-700' : 'border-gray-200',
        dividerColor: isDark ? 'border-gray-800' : 'border-gray-100',

        // Icon colors (hex values for Ionicons)
        iconColor: isDark ? '#9CA3AF' : '#6B7280',
        iconColorPrimary: '#00D9A3',
        iconColorSecondary: isDark ? '#D1D5DB' : '#4B5563',

        // Utility
        isDark,
    };
}
