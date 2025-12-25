import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Custom hook to monitor network connectivity
 * Returns isConnected and isInternetReachable status
 */
export function useNetwork() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return {
        isConnected,
        isInternetReachable,
        isOffline: isConnected === false || isInternetReachable === false,
    };
}
