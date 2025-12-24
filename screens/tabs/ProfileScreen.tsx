import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterScreen } from '../auth/RegisterScreen';
import { LoginScreen } from '../auth/LoginScreen';

type Language = 'id' | 'en';
type ThemeOption = 'light' | 'dark' | 'system';

// Reusable card style
const CARD_STYLE: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
};

// Radio Button Component
const RadioButton = ({ selected }: { selected: boolean }) => (
    <View className={`w-6 h-6 rounded-full border-2 ${selected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
        {selected && <View className="w-3 h-3 rounded-full bg-white m-auto" />}
    </View>
);

export function ProfileScreen({ navigation }: any) {
    const { isDark, theme, setTheme } = useTheme();
    const { user, isLoggedIn, logout } = useAuth();
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('id');
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const languages = [
        { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    ];

    const getColor = (lightColor: string, darkColor: string) => {
        if (theme === 'light') return lightColor;
        if (theme === 'dark') return darkColor;
        return isDark ? darkColor : lightColor;
    };

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const surfaceColor = getColor('#FFFFFF', '#1E293B');
    const textPrimaryColor = getColor('#1F2937', '#F1F5F9');
    const textSecondaryColor = getColor('#6B7280', '#CBD5E1');
    const iconColor = isDark ? '#14B8A6' : '#0D9488';
    const selectedLangData = languages.find(l => l.code === selectedLanguage);

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView className="flex-1 px-6 pt-16">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Profile
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                    Manage your account and preferences
                </Text>

                {/* Authentication Section */}
                <View className="mb-6">
                    {isLoggedIn ? (
                        <>
                            <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                                Account
                            </Text>
                            <View
                                className="p-4 rounded-2xl mb-3"
                                style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                            >
                                <View className="flex-row items-center mb-3">
                                    <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mr-4">
                                        <Text className="text-white text-2xl font-bold">
                                            {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold" style={{ color: textPrimaryColor }}>
                                            {user?.name || `${user?.firstName} ${user?.lastName}`}
                                        </Text>
                                        <Text className="text-sm" style={{ color: textSecondaryColor }}>
                                            {user?.email}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={logout}
                                    className="bg-error-light rounded-xl py-3 mt-2"
                                >
                                    <Text className="text-white text-center font-semibold">
                                        Logout
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                                Get Started
                            </Text>
                            <View
                                className="p-4 rounded-2xl mb-3"
                                style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                            >
                                <Text className="text-base mb-4" style={{ color: textSecondaryColor }}>
                                    Sign in to save favorites, post properties, and more
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowRegisterModal(true)}
                                    className="bg-primary rounded-xl py-3 mb-3"
                                >
                                    <Text className="text-white text-center font-semibold">
                                        Create Account
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowLoginModal(true)}
                                    className="border-2 border-primary rounded-xl py-3"
                                >
                                    <Text className="text-primary text-center font-semibold">
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>

                {/* Become a Host Section - Only show if logged in and not landlord */}
                {isLoggedIn && !user?.isLandlord && (
                    <View className="mb-6">
                        <View
                            className="p-4 rounded-2xl"
                            style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                        >
                            <Text className={`text-lg font-semibold mb-2 ${textColor}`}>
                                Menjadi Tuan Rumah
                            </Text>
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-3">
                                Mulai menyewakan properti Anda dan dapatkan penghasilan tambahan
                            </Text>
                            <TouchableOpacity
                                onPress={() => (navigation as any).navigate('BecomeHost')}
                                className="bg-primary rounded-xl py-3"
                            >
                                <Text className="text-white text-center font-semibold">
                                    Mulai Sekarang
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Hosting Dashboard Link - Only show if landlord */}
                {isLoggedIn && user?.isLandlord && (
                    <View className="mb-6">
                        <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                            Hosting
                        </Text>
                        <TouchableOpacity
                            onPress={() => (navigation as any).navigate('HostingDashboard')}
                            className="flex-row items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="home" size={22} color={iconColor} style={{ marginRight: 12 }} />
                                <Text className="text-base font-medium" style={{ color: textPrimaryColor }}>
                                    Dashboard Hosting
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Theme Settings */}
                <View className="mb-6">
                    <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                        Theme
                    </Text>

                    <View className="gap-3">
                        {/* Dark Mode */}
                        <TouchableOpacity
                            onPress={() => setTheme('dark')}
                            className="flex-row items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="moon" size={22} color={iconColor} style={{ marginRight: 12 }} />
                                <Text className="text-base font-medium" style={{ color: textPrimaryColor }}>
                                    Dark
                                </Text>
                            </View>
                            <RadioButton selected={theme === 'dark'} />
                        </TouchableOpacity>

                        {/* Light Mode */}
                        <TouchableOpacity
                            onPress={() => setTheme('light')}
                            className="flex-row items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="sunny" size={22} color={iconColor} style={{ marginRight: 12 }} />
                                <Text className="text-base font-medium" style={{ color: textPrimaryColor }}>
                                    Light
                                </Text>
                            </View>
                            <RadioButton selected={theme === 'light'} />
                        </TouchableOpacity>

                        {/* System Default */}
                        <TouchableOpacity
                            onPress={() => setTheme('system')}
                            className="flex-row items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="phone-portrait-outline" size={22} color={iconColor} style={{ marginRight: 12 }} />
                                <Text className="text-base font-medium" style={{ color: textPrimaryColor }}>
                                    Sesuai pengaturan perangkat
                                </Text>
                            </View>
                            <RadioButton selected={theme === 'system'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Language Settings */}
                <View className="mb-6">
                    <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                        Language
                    </Text>

                    <TouchableOpacity
                        onPress={() => setShowLanguageModal(true)}
                        className="flex-row items-center justify-between p-4 rounded-2xl"
                        style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="globe-outline" size={22} color={iconColor} style={{ marginRight: 12 }} />
                            <Text className="text-base font-medium" style={{ color: textPrimaryColor }}>
                                {selectedLangData?.name}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
                    </TouchableOpacity>
                </View>

                {/* Bottom padding for tab bar */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Language Modal */}
            <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowLanguageModal(false)}
                    className="flex-1 bg-black/50 justify-center items-center"
                >
                    <View className={`w-80 rounded-3xl p-6 ${isDark ? 'bg-[#1E293B]' : 'bg-white'}`}>
                        <Text className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-[#F1F5F9]' : 'text-[#1F2937]'}`}>
                            Pilih Bahasa
                        </Text>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => {
                                    setSelectedLanguage(lang.code);
                                    setShowLanguageModal(false);
                                }}
                                className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${selectedLanguage === lang.code
                                    ? 'bg-primary'
                                    : isDark ? 'bg-[#0F172A]' : 'bg-[#F9FAFB]'
                                    }`}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name="globe-outline"
                                        size={28}
                                        color={selectedLanguage === lang.code ? '#FFFFFF' : iconColor}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text className={`text-base font-medium ${selectedLanguage === lang.code
                                        ? 'text-white'
                                        : isDark ? 'text-[#F1F5F9]' : 'text-[#1F2937]'
                                        }`}>
                                        {lang.name}
                                    </Text>
                                </View>
                                {selectedLanguage === lang.code && (
                                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Register Modal */}
            <Modal
                visible={showRegisterModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowRegisterModal(false)}
            >
                <RegisterScreen
                    onRegisterSuccess={() => {
                        setShowRegisterModal(false);
                    }}
                    onNavigateToLogin={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                    }}
                />
            </Modal>

            {/* Login Modal */}
            <Modal
                visible={showLoginModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowLoginModal(false)}
            >
                <LoginScreen
                    onLoginSuccess={() => {
                        setShowLoginModal(false);
                    }}
                    onNavigateToRegister={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                    }}
                />
            </Modal>
        </View>
    );
}
