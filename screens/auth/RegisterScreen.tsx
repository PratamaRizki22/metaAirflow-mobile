import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { useThemeColors } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { FormInput } from '../../components/common';

interface RegisterScreenProps {
    onRegisterSuccess: () => void;
    onNavigateToLogin: () => void;
}

export function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
    const navigation = useNavigation();
    const { register, loginWithGoogle } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

    const handleRegister = async () => {
        setError('');

        const errors: { [key: string]: boolean } = {};
        if (!firstName) errors.firstName = true;
        if (!lastName) errors.lastName = true;
        if (!email) errors.email = true;
        if (!password) errors.password = true;
        if (!confirmPassword) errors.confirmPassword = true;
        if (!phone) errors.phone = true;
        if (!dateOfBirth) errors.dateOfBirth = true;

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateOfBirth)) {
            setError('Date of birth must be in YYYY-MM-DD format');
            return;
        }

        setIsLoading(true);

        try {
            await register(
                firstName,
                lastName,
                email,
                password,
                phone,
                dateOfBirth
            );

            Alert.alert(
                'Success',
                'Registration successful!',
                [
                    {
                        text: 'OK',
                        onPress: onRegisterSuccess,
                    },
                ]
            );
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setError('');

            GoogleSignin.configure({
                webClientId: GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true,
            });

            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.type === 'success' && userInfo.data) {
                const idToken = (userInfo.data as any).idToken;

                if (!idToken) {
                    throw new Error('Failed to get ID token from Google');
                }

                await loginWithGoogle(idToken);
                onRegisterSuccess();
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                setError('Sign in was cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                setError('Sign in is already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                setError('Play services not available');
            } else {
                setError(error.message || 'Google Sign-In failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const { bgColor, textColor, secondaryTextColor, borderColor, isDark } = useThemeColors();
    const inputBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgColor}`}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 justify-center px-6 py-12">
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => {
                            // Reset navigation to Home tab to avoid redirect loop
                            (navigation as any).reset({
                                index: 0,
                                routes: [{ name: 'MainTabs' }],
                            });
                        }}
                        className="absolute top-12 left-6 w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark items-center justify-center"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color={isDark ? '#F1F5F9' : '#1F2937'} />
                    </TouchableOpacity>

                    <View className="mb-8">
                        <Text className={`text-4xl font-bold mb-2 ${textColor}`}>
                            Create Account
                        </Text>
                        <Text className={`text-base ${secondaryTextColor}`}>
                            Sign up to get started with Rentverse
                        </Text>
                    </View>

                    {error ? (
                        <View className="bg-error-light/10 border border-error-light rounded-lg p-4 mb-6">
                            <Text className="text-error-light">{error}</Text>
                        </View>
                    ) : null}

                    <View className="space-y-0 mb-6">
                        <FormInput
                            label="First Name"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChangeText={(text) => {
                                setFirstName(text);
                                if (text) setFieldErrors(prev => ({ ...prev, firstName: false }));
                            }}
                            editable={!isLoading}
                            error={fieldErrors.firstName ? "First name is required" : undefined}
                        />

                        <FormInput
                            label="Last Name"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChangeText={(text) => {
                                setLastName(text);
                                if (text) setFieldErrors(prev => ({ ...prev, lastName: false }));
                            }}
                            editable={!isLoading}
                            error={fieldErrors.lastName ? "Last name is required" : undefined}
                        />

                        <FormInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (text) setFieldErrors(prev => ({ ...prev, email: false }));
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                            error={fieldErrors.email ? "Email is required" : undefined}
                        />

                        <FormInput
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                if (text) setFieldErrors(prev => ({ ...prev, phone: false }));
                            }}
                            keyboardType="phone-pad"
                            editable={!isLoading}
                            error={fieldErrors.phone ? "Phone number is required" : undefined}
                        />

                        <FormInput
                            label="Date of Birth"
                            placeholder="YYYY-MM-DD"
                            value={dateOfBirth}
                            onChangeText={(text) => {
                                setDateOfBirth(text);
                                if (text) setFieldErrors(prev => ({ ...prev, dateOfBirth: false }));
                            }}
                            editable={!isLoading}
                            error={fieldErrors.dateOfBirth ? "Date of birth is required" : undefined}
                        />

                        <FormInput
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (text) setFieldErrors(prev => ({ ...prev, password: false }));
                            }}
                            secureTextEntry={!showPassword}
                            editable={!isLoading}
                            error={fieldErrors.password ? "Password is required" : undefined}
                            rightElement={
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color={isDark ? '#94A3B8' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        <FormInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (text) setFieldErrors(prev => ({ ...prev, confirmPassword: false }));
                            }}
                            secureTextEntry={!showConfirmPassword}
                            editable={!isLoading}
                            error={fieldErrors.confirmPassword ? "Please confirm your password" : undefined}
                            rightElement={
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color={isDark ? '#94A3B8' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            }
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={isLoading}
                        className={`bg-primary rounded-lg py-4 mb-6 ${isLoading ? 'opacity-50' : ''}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-semibold text-base">
                                Create Account
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row items-center mb-6">
                        <View className={`flex-1 h-px ${isDark ? 'bg-border-dark' : 'bg-border-light'}`} />
                        <Text className={`mx-4 ${secondaryTextColor}`}>or</Text>
                        <View className={`flex-1 h-px ${isDark ? 'bg-border-dark' : 'bg-border-light'}`} />
                    </View>

                    <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                        className={`${inputBg} ${borderColor} border rounded-lg py-4 mb-6 ${isLoading ? 'opacity-50' : ''}`}
                    >
                        <Text className={`text-center font-semibold text-base ${textColor}`}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center">
                        <Text className={secondaryTextColor}>
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
                            <Text className="text-primary font-semibold">
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

