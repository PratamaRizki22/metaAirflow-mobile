import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    type: 'booking' | 'message' | 'review' | 'payment' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: any; // Additional data for navigation
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = '@notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    // Load notifications on mount
    useEffect(() => {
        if (isLoggedIn) {
            loadNotifications();
        } else {
            setNotifications([]);
        }
    }, [isLoggedIn, user?.id]);

    /**
     * Load notifications from storage
     * TODO: Replace with API call when backend is ready
     */
    const loadNotifications = async () => {
        try {
            setLoading(true);
            const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);

            if (stored) {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
            } else {
                // Mock notifications for demo
                const mockNotifications: Notification[] = [
                    {
                        id: '1',
                        type: 'booking',
                        title: 'Booking Confirmed',
                        message: 'Your booking for Villa Sunset has been confirmed',
                        read: false,
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        type: 'message',
                        title: 'New Message',
                        message: 'You have a new message from John Doe',
                        read: false,
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                    },
                ];
                setNotifications(mockNotifications);
                await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mockNotifications));
            }
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save notifications to storage
     */
    const saveNotifications = async (notifs: Notification[]) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
        } catch (err) {
            console.error('Error saving notifications:', err);
        }
    };

    /**
     * Mark notification as read
     */
    const markAsRead = async (id: string) => {
        setNotifications(prev => {
            const updated = prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            );
            saveNotifications(updated);
            return updated;
        });
    };

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = async () => {
        setNotifications(prev => {
            const updated = prev.map(notif => ({ ...notif, read: true }));
            saveNotifications(updated);
            return updated;
        });
    };

    /**
     * Delete a notification
     */
    const deleteNotification = async (id: string) => {
        setNotifications(prev => {
            const updated = prev.filter(notif => notif.id !== id);
            saveNotifications(updated);
            return updated;
        });
    };

    /**
     * Clear all notifications
     */
    const clearAll = async () => {
        setNotifications([]);
        await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    };

    /**
     * Refresh notifications
     */
    const refreshNotifications = useCallback(async () => {
        if (isLoggedIn) {
            await loadNotifications();
        }
    }, [isLoggedIn]);

    /**
     * Add a new notification (for real-time updates)
     */
    const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            saveNotifications(updated);
            return updated;
        });
    };

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications,
        addNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
