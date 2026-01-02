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
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/common';
import { Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';

interface PasswordEntryScreenProps {
    email: string;
    onBack: () => void;
    onLoginSuccess: () => void;
}

export function PasswordEntryScreen({
    email,
    onBack,
    onLoginSuccess,
}: PasswordEntryScreenProps) {
    const { refreshProfile } = useAuth();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldError, setFieldError] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleLogin = async () => {
        if (!password) {
            setFieldError(true);
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.login({ email, password });

            if (response.success) {
                await refreshProfile();
                showToast('Login successful!', 'success');
                setTimeout(() => {
                    onLoginSuccess();
                }, 1000);
            }
        } catch (err: any) {
            showToast(err.message || 'Login failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <LinearGradient
                colors={['#FFFFFF', '#DAF3FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-1 px-6 pt-16">
                            {/* Back Button */}
                            <TouchableOpacity
                                onPress={onBack}
                                className="mb-6 w-6 h-6 items-center justify-center"
                            >
                                <Ionicons name="chevron-back" size={24} color="#334155" />
                            </TouchableOpacity>

                            {/* Title */}
                            <View className="items-center mb-12">
                                <Text className="text-lg font-semibold text-[#0f172a] mb-2">
                                    Log in
                                </Text>
                                <Text className="text-sm text-[#475569] text-center px-8">
                                    One step closer for experience the journey.
                                </Text>
                            </View>

                            {/* Password Input */}
                            <View className="mb-4">
                                <Text className="text-sm text-[#475569] mb-2">Password</Text>
                                <View className="relative">
                                    <TextInput
                                        className={`bg-white border ${fieldError ? 'border-red-500' : 'border-[#10A0F7]'
                                            } rounded-md px-4 py-3 pr-12 text-[#64748b]`}
                                        placeholder="akuganteng123"
                                        placeholderTextColor="#64748b"
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (text) setFieldError(false);
                                        }}
                                        secureTextEntry={!showPassword}
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-0 bottom-0 justify-center"
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={16}
                                            color="#475569"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity className="mb-6">
                                <Text className="text-sm text-[#10A0F7] underline">
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>

                            {/* Next Button */}
                            <View className="mt-auto pb-8">
                                <Button
                                    onPress={handleLogin}
                                    loading={isLoading}
                                    size="lg"
                                    fullWidth
                                >
                                    Next
                                </Button>
                            </View>
                        </View>
                    </ScrollView>
                    <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}
