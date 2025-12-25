import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
    key: string;
    ttl?: number; // Time to live in milliseconds (default: 5 minutes)
}

interface CachedData<T> {
    data: T;
    timestamp: number;
}

/**
 * Custom hook for caching API responses
 * Reduces redundant API calls and improves performance
 * 
 * @param fetchFn - Async function to fetch data
 * @param options - Cache options (key, ttl)
 * @returns [data, loading, error, refetch]
 */
export function useCache<T>(
    fetchFn: () => Promise<T>,
    options: CacheOptions
) {
    const { key, ttl = 5 * 60 * 1000 } = options; // Default 5 minutes
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const getCachedData = async (): Promise<T | null> => {
        try {
            const cached = await AsyncStorage.getItem(`cache_${key}`);
            if (cached) {
                const parsedCache: CachedData<T> = JSON.parse(cached);
                const now = Date.now();

                // Check if cache is still valid
                if (now - parsedCache.timestamp < ttl) {
                    console.log(`[Cache] Hit for key: ${key}`);
                    return parsedCache.data;
                } else {
                    console.log(`[Cache] Expired for key: ${key}`);
                    await AsyncStorage.removeItem(`cache_${key}`);
                }
            }
        } catch (err) {
            console.error('[Cache] Error reading cache:', err);
        }
        return null;
    };

    const setCachedData = async (newData: T) => {
        try {
            const cacheData: CachedData<T> = {
                data: newData,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
            console.log(`[Cache] Saved for key: ${key}`);
        } catch (err) {
            console.error('[Cache] Error saving cache:', err);
        }
    };

    const fetchData = useCallback(async (useCache = true) => {
        try {
            setLoading(true);
            setError(null);

            // Try to get cached data first
            if (useCache) {
                const cachedData = await getCachedData();
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // Fetch fresh data
            console.log(`[Cache] Fetching fresh data for key: ${key}`);
            const freshData = await fetchFn();
            setData(freshData);

            // Cache the fresh data
            await setCachedData(freshData);
        } catch (err: any) {
            setError(err);
            console.error('[Cache] Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, key]);

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => fetchData(false); // Force fresh fetch

    return { data, loading, error, refetch };
}

/**
 * Clear all cache
 */
export async function clearAllCache() {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(key => key.startsWith('cache_'));
        await AsyncStorage.multiRemove(cacheKeys);
        console.log('[Cache] Cleared all cache');
    } catch (err) {
        console.error('[Cache] Error clearing cache:', err);
    }
}

/**
 * Clear specific cache by key
 */
export async function clearCache(key: string) {
    try {
        await AsyncStorage.removeItem(`cache_${key}`);
        console.log(`[Cache] Cleared cache for key: ${key}`);
    } catch (err) {
        console.error('[Cache] Error clearing cache:', err);
    }
}
