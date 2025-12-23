import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UseRequireAuthOptions {
    title?: string;
    message?: string;
    onLogin?: () => void;
    onRegister?: () => void;
}

/**
 * Hook untuk fitur yang memerlukan authentication
 * Menampilkan login prompt jika user belum login
 * 
 * Usage:
 * const { requireAuth, LoginPromptComponent } = useRequireAuth({
 *   title: 'Save Favorite',
 *   message: 'Login to save your favorite properties'
 * });
 * 
 * const handleFavorite = requireAuth(() => {
 *   // Logic untuk save favorite
 * });
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
    const { isLoggedIn } = useAuth();
    const [showPrompt, setShowPrompt] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    /**
     * Wrapper function yang check auth sebelum execute action
     * Jika belum login, tampilkan prompt
     * Jika sudah login, langsung execute action
     */
    const requireAuth = (action: () => void) => {
        return () => {
            if (isLoggedIn) {
                action();
            } else {
                setPendingAction(() => action);
                setShowPrompt(true);
            }
        };
    };

    const handleLogin = () => {
        setShowPrompt(false);
        if (options.onLogin) {
            options.onLogin();
        }
        // After login success, execute pending action
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleRegister = () => {
        setShowPrompt(false);
        if (options.onRegister) {
            options.onRegister();
        }
    };

    const handleClose = () => {
        setShowPrompt(false);
        setPendingAction(null);
    };

    return {
        requireAuth,
        showPrompt,
        setShowPrompt,
        handleLogin,
        handleRegister,
        handleClose,
        promptOptions: {
            title: options.title,
            message: options.message,
        },
    };
}
