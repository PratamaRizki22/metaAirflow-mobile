import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoriteService } from '../services';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
    favorites: Set<string>; // Set of property IDs
    isFavorited: (propertyId: string) => boolean;
    toggleFavorite: (propertyId: string) => Promise<void>;
    refreshFavorites: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@favorites_cache';

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { user, isLoggedIn } = useAuth();
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load favorites on mount and when user logs in
    useEffect(() => {
        if (isLoggedIn) {
            loadFavorites();
        } else {
            // Clear favorites when logged out
            setFavorites(new Set());
            AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
        }
    }, [isLoggedIn, user?.id]);

    /**
     * Load favorites from API and cache
     */
    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to load from cache first for instant UI
            const cached = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            if (cached) {
                const cachedIds = JSON.parse(cached);
                setFavorites(new Set(cachedIds));
            }

            // Fetch fresh data from API
            const response = await favoriteService.getFavorites(1, 100);
            const favoriteIds = response.data.favorites.map((fav: any) => fav.propertyId);

            setFavorites(new Set(favoriteIds));

            // Update cache
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
        } catch (err: any) {
            console.error('Error loading favorites:', err);
            setError(err.message || 'Failed to load favorites');
            // Keep cached data on error
        } finally {
            setLoading(false);
        }
    };

    /**
     * Check if property is favorited
     */
    const isFavorited = useCallback((propertyId: string): boolean => {
        return favorites.has(propertyId);
    }, [favorites]);

    /**
     * Toggle favorite with optimistic update
     */
    const toggleFavorite = async (propertyId: string) => {
        if (!isLoggedIn) {
            throw new Error('Please login to save favorites');
        }

        const wasFavorited = favorites.has(propertyId);

        // Optimistic update - update UI immediately
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (wasFavorited) {
                newSet.delete(propertyId);
            } else {
                newSet.add(propertyId);
            }
            return newSet;
        });

        // Update cache immediately
        const newFavoritesArray = Array.from(favorites);
        if (wasFavorited) {
            const index = newFavoritesArray.indexOf(propertyId);
            if (index > -1) newFavoritesArray.splice(index, 1);
        } else {
            newFavoritesArray.push(propertyId);
        }
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavoritesArray));

        try {
            // Make API call
            await favoriteService.toggleFavorite(propertyId);
        } catch (err: any) {
            console.error('Error toggling favorite:', err);

            // Rollback on error
            setFavorites(prev => {
                const newSet = new Set(prev);
                if (wasFavorited) {
                    newSet.add(propertyId);
                } else {
                    newSet.delete(propertyId);
                }
                return newSet;
            });

            // Restore cache
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));

            throw err;
        }
    };

    /**
     * Refresh favorites from server
     */
    const refreshFavorites = useCallback(async () => {
        if (isLoggedIn) {
            await loadFavorites();
        }
    }, [isLoggedIn]);

    const value: FavoritesContextType = {
        favorites,
        isFavorited,
        toggleFavorite,
        refreshFavorites,
        loading,
        error,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
