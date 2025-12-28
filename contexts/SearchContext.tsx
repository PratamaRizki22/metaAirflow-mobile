import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PropertyFilters {
    city?: string;
    state?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyTypeId?: string;
    furnished?: boolean;
    isAvailable?: boolean;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
    amenities?: string;
}

export interface SavedFilter {
    id: string;
    name: string;
    filters: PropertyFilters;
    createdAt: string;
}

interface SearchContextType {
    // Recent searches
    recentSearches: string[];
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;

    // Saved filters
    savedFilters: SavedFilter[];
    saveFilter: (name: string, filters: PropertyFilters) => void;
    deleteFilter: (id: string) => void;
    applyFilter: (id: string) => PropertyFilters | null;

    // Current search state
    currentFilters: PropertyFilters;
    setCurrentFilters: (filters: PropertyFilters) => void;
    clearCurrentFilters: () => void;
    hasActiveFilters: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const RECENT_SEARCHES_KEY = '@recent_searches';
const SAVED_FILTERS_KEY = '@saved_filters';
const MAX_RECENT_SEARCHES = 10;

export function SearchProvider({ children }: { children: ReactNode }) {
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
    const [currentFilters, setCurrentFilters] = useState<PropertyFilters>({});

    // Load data on mount
    useEffect(() => {
        loadRecentSearches();
        loadSavedFilters();
    }, []);

    /**
     * Load recent searches from storage
     */
    const loadRecentSearches = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Error loading recent searches:', err);
        }
    };

    /**
     * Load saved filters from storage
     */
    const loadSavedFilters = async () => {
        try {
            const stored = await AsyncStorage.getItem(SAVED_FILTERS_KEY);
            if (stored) {
                setSavedFilters(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Error loading saved filters:', err);
        }
    };

    /**
     * Add a search query to recent searches
     */
    const addRecentSearch = useCallback(async (query: string) => {
        if (!query.trim()) return;

        setRecentSearches(prev => {
            // Remove duplicates and add to front
            const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
            const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);

            // Save to storage
            AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

            return updated;
        });
    }, []);

    /**
     * Clear all recent searches
     */
    const clearRecentSearches = useCallback(async () => {
        setRecentSearches([]);
        await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    }, []);

    /**
     * Save a filter preset
     */
    const saveFilter = useCallback(async (name: string, filters: PropertyFilters) => {
        const newFilter: SavedFilter = {
            id: Date.now().toString(),
            name,
            filters,
            createdAt: new Date().toISOString(),
        };

        setSavedFilters(prev => {
            const updated = [newFilter, ...prev];
            AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    /**
     * Delete a saved filter
     */
    const deleteFilter = useCallback(async (id: string) => {
        setSavedFilters(prev => {
            const updated = prev.filter(f => f.id !== id);
            AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    /**
     * Apply a saved filter
     */
    const applyFilter = useCallback((id: string): PropertyFilters | null => {
        const filter = savedFilters.find(f => f.id === id);
        if (filter) {
            setCurrentFilters(filter.filters);
            return filter.filters;
        }
        return null;
    }, [savedFilters]);

    /**
     * Clear current filters
     */
    const clearCurrentFilters = useCallback(() => {
        setCurrentFilters({});
    }, []);

    /**
     * Check if there are active filters
     */
    const hasActiveFilters = Object.keys(currentFilters).length > 0;

    const value: SearchContextType = {
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        savedFilters,
        saveFilter,
        deleteFilter,
        applyFilter,
        currentFilters,
        setCurrentFilters,
        clearCurrentFilters,
        hasActiveFilters,
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
