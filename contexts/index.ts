// Authentication & User
export { AuthProvider, useAuth } from './AuthContext';

// Theme & Appearance
export { ThemeProvider, useTheme } from './ThemeContext';

// User Mode (Tenant/Landlord)
export { ModeProvider, useMode } from './ModeContext';
export type { UserMode } from './ModeContext';

// Onboarding
export { OnboardingProvider, useOnboarding } from './OnboardingContext';

// Favorites
export { FavoritesProvider, useFavorites } from './FavoritesContext';

// Notifications
export { NotificationProvider, useNotifications } from './NotificationContext';
export type { Notification } from './NotificationContext';

// Search & Filters
export { SearchProvider, useSearch } from './SearchContext';
export type { PropertyFilters, SavedFilter } from './SearchContext';
