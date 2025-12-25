import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * Prevents excessive API calls during rapid user input
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up the timeout
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timeout if value changes before delay
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * Limits how often a function can be called
 * 
 * @param callback - Function to throttle
 * @param delay - Delay in milliseconds (default: 1000ms)
 */
export function useThrottle(callback: Function, delay: number = 1000) {
    const lastRun = useRef(Date.now());

    return (...args: any[]) => {
        const now = Date.now();

        if (now - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = now;
        }
    };
}
