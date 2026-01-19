import React, { useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { EmailEntryScreen } from './EmailEntryScreen';
import { PasswordEntryScreen } from './PasswordEntryScreen';
import { RegisterScreen } from './RegisterScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

interface AuthFlowScreenProps {
    onAuthSuccess: () => void;
    onClose: () => void;
}

type AuthStep = 'email' | 'password' | 'register' | 'forgot-password';

export function AuthFlowScreen({ onAuthSuccess, onClose }: AuthFlowScreenProps) {
    const { refreshProfile } = useAuth();
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState<AuthStep>('email');
    const [email, setEmail] = useState('');

    const handleEmailNotRegistered = (userEmail: string) => {
        setEmail(userEmail);
        setCurrentStep('register');
    };

    const handleEmailRegistered = (userEmail: string) => {
        setEmail(userEmail);
        setCurrentStep('password');
    };

    const handleBackToEmail = () => {
        setCurrentStep('email');
        setEmail('');
    };

    const handleForgotPassword = () => {
        setCurrentStep('forgot-password');
    };

    const handleGoogleSignIn = async () => {
        try {
            // Configure Google Sign-In
            GoogleSignin.configure({
                webClientId: GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true,
            });

            // Check Play Services
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign in
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.type === 'success' && userInfo.data) {
                const idToken = (userInfo.data as any).idToken;

                if (!idToken) {
                    throw new Error('Failed to get ID token from Google');
                }

                const response = await authService.loginWithGoogle(idToken);

                if (response.success) {
                    // Refresh the auth context to update UI
                    await refreshProfile();
                    showToast('Google Sign-In successful!', 'success');
                    setTimeout(() => {
                        onAuthSuccess();
                    }, 1000);
                }
            }
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                showToast('Sign in was cancelled', 'info');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                showToast('Sign in is already in progress', 'warning');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                showToast('Play services not available', 'error');
            } else {
                showToast(error.message || 'Google Sign-In failed', 'error');
            }
        }
    };

    // Render based on current step
    if (currentStep === 'email') {
        return (
            <EmailEntryScreen
                onEmailNotRegistered={handleEmailNotRegistered}
                onEmailRegistered={handleEmailRegistered}
                onGoogleSignIn={handleGoogleSignIn}
                onForgotPassword={handleForgotPassword}
                onClose={onClose}
            />
        );
    }

    if (currentStep === 'password') {
        return (
            <PasswordEntryScreen
                email={email}
                onBack={handleBackToEmail}
                onLoginSuccess={onAuthSuccess}
                onForgotPassword={handleForgotPassword}
            />
        );
    }

    if (currentStep === 'register') {
        return (
            <RegisterScreen
                email={email}
                onRegisterSuccess={onAuthSuccess}
                onBack={handleBackToEmail}
            />
        );
    }

    if (currentStep === 'forgot-password') {
        return (
            <ForgotPasswordScreen
                onBack={handleBackToEmail}
                onClose={onClose}
            />
        );
    }

    return null;
}
