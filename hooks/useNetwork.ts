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
        // Get initial state
        NetInfo.fetch().then(state => {
            console.log('Initial network state:', state);
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
        });

        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log('Network state changed:', {
                isConnected: state.isConnected,
                isInternetReachable: state.isInternetReachable,
                type: state.type
            });
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const isOffline = isConnected === false || isInternetReachable === false;
    
    console.log('useNetwork state:', { isConnected, isInternetReachable, isOffline });

    return {
        isConnected,
        isInternetReachable,
        isOffline,
    };
}
