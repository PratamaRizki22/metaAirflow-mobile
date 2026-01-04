import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import Config from '../config/app.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extract base URL from API_URL (remove /api/v1 or just use domain)
const API_URL = Config.api.baseURL;
const SOCKET_URL = API_URL.replace('/api/v1', '').replace('/v1/m', '').replace('/api', ''); // Adjust stripping logic to get root domain

export const useSocket = () => {
    const { isLoggedIn } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Fetch token when logged in state changes
    useEffect(() => {
        const fetchToken = async () => {
            if (isLoggedIn) {
                try {
                    const t = await AsyncStorage.getItem('authToken');
                    setToken(t);
                } catch (e) {
                    console.error('Error fetching token for socket:', e);
                }
            } else {
                setToken(null);
            }
        };
        fetchToken();
    }, [isLoggedIn]);

    useEffect(() => {
        // Only connect if we have a token
        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Initialize socket connection
        console.log('🔌 Connecting to socket URL:', SOCKET_URL);
        const socket = io(SOCKET_URL, {
            transports: ['polling', 'websocket'], // Use default strategy
            auth: {
                token
            },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            forceNew: true,
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.log('⚠️ Socket connection error:', error);
            setIsConnected(false);
        });

        socketRef.current = socket;

        // Cleanup on unmount or token change
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [token]);

    return {
        socket: socketRef.current,
        isConnected
    };
};
