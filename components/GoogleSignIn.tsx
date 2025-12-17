import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

interface GoogleUser {
    idToken: string | null;
    serverAuthCode: string | null;
    scopes: string[];
    user: {
        email: string;
        familyName: string | null;
        givenName: string | null;
        id: string;
        name: string | null;
        photo: string | null;
    };
}

export function GoogleSignIn() {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [userInfo, setUserInfo] = useState<GoogleUser | null>(null);

    useEffect(() => {
        // Configure Google Sign-In
        GoogleSignin.configure({
            webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Google Cloud Console
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });

        // Check if user is already signed in
        checkIfSignedIn();
    }, []);

    const checkIfSignedIn = async () => {
        try {
            const currentUser = await GoogleSignin.getCurrentUser();
            if (currentUser) {
                setUserInfo(currentUser as GoogleUser);
            }
        } catch (error) {
            console.error('Error checking sign-in status:', error);
        }
    };

    const signIn = async () => {
        try {
            setIsSigningIn(true);
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (response.type === 'success') {
                const currentUser = await GoogleSignin.getCurrentUser();
                setUserInfo(currentUser as GoogleUser);
                Alert.alert('Success', `Welcome ${currentUser?.user?.name || 'User'}!`);
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert('Cancelled', 'Sign in was cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('In Progress', 'Sign in is already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Play services not available');
            } else {
                Alert.alert('Error', error.message || 'Something went wrong');
            }
            console.error('Sign in error:', error);
        } finally {
            setIsSigningIn(false);
        }
    };

    const signOut = async () => {
        try {
            await GoogleSignin.signOut();
            setUserInfo(null);
            Alert.alert('Success', 'Signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    if (userInfo) {
        return (
            <View className="flex-1 items-center justify-center p-6 bg-white">
                <View className="items-center mb-8">
                    <Text className="text-2xl font-bold mb-2">Welcome!</Text>
                    <Text className="text-lg text-gray-700">{userInfo.user.name}</Text>
                    <Text className="text-sm text-gray-500">{userInfo.user.email}</Text>
                </View>

                <TouchableOpacity
                    onPress={signOut}
                    className="bg-red-500 px-8 py-4 rounded-lg"
                >
                    <Text className="text-white font-semibold text-lg">Sign Out</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center p-6 bg-white">
            <View className="items-center mb-12">
                <Text className="text-3xl font-bold mb-2">Listing Property</Text>
                <Text className="text-gray-600 text-center">
                    Sign in to continue
                </Text>
            </View>

            <TouchableOpacity
                onPress={signIn}
                disabled={isSigningIn}
                className="bg-blue-500 px-8 py-4 rounded-lg flex-row items-center"
            >
                {isSigningIn ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-semibold text-lg">
                        Sign in with Google
                    </Text>
                )}
            </TouchableOpacity>

            <Text className="text-gray-500 text-sm mt-8 text-center">
                By signing in, you agree to our Terms & Privacy Policy
            </Text>
        </View>
    );
}
