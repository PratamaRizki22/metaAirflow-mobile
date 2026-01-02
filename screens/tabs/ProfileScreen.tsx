import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ViewStyle, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMode } from '../../contexts/ModeContext';
import { AuthFlowScreen } from '../auth/AuthFlowScreen';
import { useThemeColors } from '../../hooks';
import { Button, TabBarBottomSpacer } from '../../components/common';

type Language = 'id' | 'en';
type ThemeOption = 'light' | 'dark';

// Reusable card style
const CARD_STYLE: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 12,
};

// Radio Button Component
const RadioButton = ({ selected }: { selected: boolean }) => (
    <View className={`w-6 h-6 rounded-full border-2 ${selected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
        {selected && <View className="w-3 h-3 rounded-full bg-white m-auto" />}
    </View>
);

export function ProfileScreen({ navigation }: any) {
    const { theme, setTheme } = useTheme();
    const { user, isLoggedIn, logout, refreshProfile } = useAuth();
    const { mode, switchMode, canSwitchMode, isLandlordMode, isTenantMode } = useMode();
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('id');
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (isLoggedIn) {
                await refreshProfile();
            } else {
                // Determine if we should try to restore session or just wait
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => logout()
                }
            ]
        );
    };


    const languages = [
        { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    ];

    const { bgColor, textColor, isDark } = useThemeColors();

    const getColor = (lightColor: string, darkColor: string) => {
        if (theme === 'light') return lightColor;
        if (theme === 'dark') return darkColor;
        return isDark ? darkColor : lightColor;
    };

    const surfaceColor = getColor('#FFFFFF', '#1E293B');
    const textPrimaryColor = getColor('#1F2937', '#F1F5F9');
    const textSecondaryColor = getColor('#6B7280', '#CBD5E1');
    const iconColor = isDark ? '#00D9A3' : '#00B87C';
    const selectedLangData = languages.find(l => l.code === selectedLanguage);

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView
                className="flex-1 px-6 pt-16"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={iconColor}
                        colors={[iconColor]}
                    />
                }
            >
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

                                {/* Edit Profile Button */}
                                <View className="mb-2">
                                    <Button
                                        onPress={() => navigation.navigate('EditProfile')}
                                        variant="primary"
                                        fullWidth
                                    >
                                        Edit Profile
                                    </Button>
                                </View>

                                {/* Logout Button */}
                                <View>
                                    <Button
                                        onPress={handleLogout}
                                        variant="secondary"
                                        fullWidth
                                        className="bg-red-500"
                                    >
                                        <Text className="text-white">Logout</Text>
                                    </Button>
                                </View>
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
                                <View className="mb-3">
                                    <Button
                                        onPress={() => setShowAuthModal(true)}
                                        variant="primary"
                                        fullWidth
                                    >
                                        Create Account
                                    </Button>
                                </View>
                                <View>
                                    <Button
                                        onPress={() => setShowAuthModal(true)}
                                        variant="outline"
                                        fullWidth
                                    >
                                        Sign In
                                    </Button>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Payment History - Only show for Tenant Mode */}
                {isLoggedIn && isTenantMode && (
                    <View className="mb-6">
                        <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                            Payments
                        </Text>
                        <TouchableOpacity
                            onPress={() => (navigation as any).navigate('PaymentHistory')}
                            className="flex-row items-center justify-between p-4 rounded-2xl"
                            style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="receipt-outline" size={22} color={iconColor} style={{ marginRight: 12 }} />
                                <View>
                                    <Text className="text-base font-medium" style={{ color: textPrimaryColor }}>
                                        Payment History
                                    </Text>
                                    <Text className="text-xs" style={{ color: textSecondaryColor }}>
                                        View all your transactions
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
                        </TouchableOpacity>
                    </View>
                )}

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
                            <Button
                                onPress={() => (navigation as any).navigate('BecomeHost')}
                                variant="primary"
                                fullWidth
                            >
                                Mulai Sekarang
                            </Button>
                        </View>
                    </View>
                )}

                {/* Hosting Dashboard Link - Only show if landlord */}
                {isLoggedIn && canSwitchMode && (
                    <View className="mb-6">
                        <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                            Hosting
                        </Text>

                        {/* Current Mode Indicator */}
                        <View className="mb-3 p-3 rounded-xl" style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }}>
                            <View className="flex-row items-center">
                                <Text className="text-sm" style={{ color: textSecondaryColor }}>
                                    Mode Saat Ini:{' '}
                                </Text>
                                <Ionicons
                                    name={isTenantMode ? 'home' : 'business'}
                                    size={16}
                                    color={textPrimaryColor}
                                />
                                <Text className="font-semibold text-sm ml-1" style={{ color: textPrimaryColor }}>
                                    {isTenantMode ? 'Tenant' : 'Landlord'}
                                </Text>
                            </View>
                        </View>


                        {/* Analytics Link - Only for Landlord Mode */}
                        {!isTenantMode && (
                            <TouchableOpacity
                                onPress={() => (navigation as any).navigate('Analytics')}
                                className="flex-row items-center justify-between p-4 rounded-2xl mb-3"
                                style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="stats-chart" size={22} color={iconColor} style={{ marginRight: 12 }} />
                                    <Text className="text-base font-medium" style={{ color: textPrimaryColor }}>
                                        Analytics & Statistics
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />
                            </TouchableOpacity>
                        )}


                        {/* Switch Mode Button */}
                        <TouchableOpacity
                            onPress={async () => {
                                await switchMode();
                                // Mode switch will automatically update the tab navigator
                                // No need to navigate manually
                            }}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={isTenantMode ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="p-4 rounded-xl"
                                style={CARD_STYLE}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <Ionicons
                                                name="swap-horizontal"
                                                size={22}
                                                color="#FFFFFF"
                                                style={{ marginRight: 12 }}
                                            />
                                            <Text className="text-white text-base font-semibold">
                                                Beralih ke Mode {isTenantMode ? 'Landlord' : 'Tenant'}
                                            </Text>
                                        </View>
                                        <Text className="text-white/80 text-sm ml-8">
                                            {isTenantMode
                                                ? 'Kelola properti yang Anda sewakan'
                                                : 'Cari properti untuk disewa'}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                                </View>
                            </LinearGradient>
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
                <TabBarBottomSpacer />
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

            {/* Auth Flow Modal */}
            <Modal
                visible={showAuthModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAuthModal(false)}
            >
                <AuthFlowScreen
                    onAuthSuccess={() => {
                        setShowAuthModal(false);
                    }}
                    onClose={() => setShowAuthModal(false)}
                />
            </Modal>
        </View>
    );
}
