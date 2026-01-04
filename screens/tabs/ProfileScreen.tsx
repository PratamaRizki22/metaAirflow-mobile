import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ViewStyle, RefreshControl, Alert, ImageBackground, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMode } from '../../contexts/ModeContext';
import { AuthFlowScreen } from '../auth/AuthFlowScreen';
import { useThemeColors } from '../../hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler, // Restore this
    interpolate,
    Extrapolate,
    runOnJS,
    withTiming
} from 'react-native-reanimated';
// import { useTabBarAnimation } from '../../contexts/TabBarAnimationContext'; // Remove unused import
import { useFocusEffect } from '@react-navigation/native';

type Language = 'id' | 'en';

// MenuItem Component with icon and chevron
interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
    iconColor?: string;
    textColor?: string;
}

const MenuItem = ({ icon, title, subtitle, onPress, showChevron = true, iconColor, textColor }: MenuItemProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between py-4"
        activeOpacity={0.7}
    >
        <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 items-center justify-center mr-3">
                <Ionicons name={icon} size={24} color={iconColor || '#6B7280'} />
            </View>
            <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: textColor || '#1F2937' }}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        {subtitle}
                    </Text>
                )}
            </View>
        </View>
        {showChevron && (
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        )}
    </TouchableOpacity>
);

export function ProfileScreen({ navigation }: any) {
    const { theme, setTheme } = useTheme();
    const { user, isLoggedIn, logout, refreshProfile } = useAuth();
    const { mode, switchMode, canSwitchMode, isLandlordMode, isTenantMode } = useMode();
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('id');
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    // Animation Shared Values
    const scrollY = useSharedValue(0);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshProfile();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };



    // Drive animations based on scroll
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });



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

    const textPrimaryColor = getColor('#1F2937', '#F1F5F9');
    const textSecondaryColor = getColor('#6B7280', '#CBD5E1');
    const iconColor = '#00B87C';
    const selectedLangData = languages.find(l => l.code === selectedLanguage);

    // Header Opacity Animations (Reanimated)
    const stickyHeaderStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [60, 100], [0, 1], Extrapolate.CLAMP),
        };
    });

    const heroTitleStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, 100], [1, 0], Extrapolate.CLAMP),
        };
    });

    return (
        <View className="flex-1 bg-gray-50">
            <Animated.ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={iconColor}
                        colors={[iconColor]}
                        progressViewOffset={insets.top + 10}
                    />
                }>
                {/* Header with Background Image */}
                <View style={{ height: 250, marginBottom: -80 }}>
                    <ImageBackground
                        source={require('../../assets/profile-hero.png')}
                        style={{ flex: 1 }}
                        resizeMode="cover"
                        borderBottomLeftRadius={35}
                        borderBottomRightRadius={35}
                    >
                        <View className="flex-1 items-center justify-top pt-12">
                            <Animated.Text
                                className="text-white text-2xl font-bold"
                                style={heroTitleStyle}
                            >
                                Profile
                            </Animated.Text>
                        </View>
                    </ImageBackground>
                </View>

                {/* Profile Picture and Info - Overlapping the hero */}
                <View className="items-center mb-6" style={{ zIndex: 10 }}>
                    {/* Profile Picture */}
                    <View className="w-28 h-28 rounded-full bg-white items-center justify-center mb-3"
                        style={{
                            borderWidth: 4,
                            borderColor: 'white',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                    >
                        {isLoggedIn ? (
                            <View className="w-full h-full rounded-full bg-primary items-center justify-center">
                                <Text className="text-white text-4xl font-bold">
                                    {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                                </Text>
                            </View>
                        ) : (
                            <Ionicons name="person-circle" size={100} color="#E5E7EB" />
                        )}
                    </View>

                    {/* User Name and Role */}
                    {isLoggedIn ? (
                        <>
                            <Text className="text-3xl font-bold text-gray-900 mb-1">
                                {user?.name || `${user?.firstName} ${user?.lastName}`}
                            </Text>
                            <Text className="text-xl text-gray-500">
                                {user?.isLandlord ? 'Landlord' : 'Guest'}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-xl font-bold text-gray-900 mb-2">Guest</Text>
                            <TouchableOpacity
                                onPress={() => setShowAuthModal(true)}
                                className="bg-[#00B87C] px-8 py-2.5 rounded-full flex-row items-center justify-center"
                                activeOpacity={0.8}
                                style={{
                                    shadowColor: '#00B87C',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <Ionicons name="log-in-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-base">Sign In</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View
                    className="flex-1"
                >
                    {/* Content Container */}
                    <View className="px-5">
                        {/* New to Rentverse Card - Only show if logged in and in guest/tenant mode */}
                        {isLoggedIn && isTenantMode && (
                            <View className="bg-white rounded-2xl p-4 mb-5 flex-row items-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                <View className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: '#E0F2FE' }}
                                >
                                    <Ionicons name="sparkles-outline" size={24} color="#0EA5E9" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-semibold text-gray-900 mb-0.5">
                                        New to Rentverse?
                                    </Text>
                                    <Text className="text-xs text-gray-500">
                                        Discover tips and best practices shared by top-rated hosts
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Menu Items Container */}
                        <View className="bg-white rounded-2xl px-4 mb-5"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                        >
                            {isLoggedIn ? (
                                <>
                                    <MenuItem
                                        icon="settings-outline"
                                        title="Account settings"
                                        onPress={() => navigation.navigate('EditProfile')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    {/* Agent-specific menu items */}
                                    {isLandlordMode && (
                                        <>
                                            <MenuItem
                                                icon="home-outline"
                                                title="Hosting Resources"
                                                onPress={() => { }}
                                                iconColor="#6B7280"
                                                textColor="#1F2937"
                                            />
                                            <View className="h-px bg-gray-100" />
                                        </>
                                    )}

                                    <MenuItem
                                        icon="help-circle-outline"
                                        title="Get help"
                                        onPress={() => navigation.navigate('GetHelp')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    {/* Agent-specific menu items */}
                                    {isLandlordMode && (
                                        <>
                                            <MenuItem
                                                icon="add-circle-outline"
                                                title="Create a new listing"
                                                onPress={() => navigation.navigate('CreateProperty')}
                                                iconColor="#6B7280"
                                                textColor="#1F2937"
                                            />
                                            <View className="h-px bg-gray-100" />
                                        </>
                                    )}

                                    <MenuItem
                                        icon="document-text-outline"
                                        title="Terms of Service"
                                        onPress={() => navigation.navigate('TermsOfService')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    <MenuItem
                                        icon="lock-closed-outline"
                                        title="Privacy Policy"
                                        onPress={() => navigation.navigate('PrivacyPolicy')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    <MenuItem
                                        icon="code-slash-outline"
                                        title="Open Source Licenses"
                                        onPress={() => navigation.navigate('OpenSourceLicenses')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    <MenuItem
                                        icon="log-out-outline"
                                        title="Log Out"
                                        onPress={handleLogout}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                </>
                            ) : (
                                <>
                                    <MenuItem
                                        icon="help-circle-outline"
                                        title="Get help"
                                        onPress={() => navigation.navigate('GetHelp')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    <MenuItem
                                        icon="document-text-outline"
                                        title="Terms of Service"
                                        onPress={() => navigation.navigate('TermsOfService')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    <MenuItem
                                        icon="lock-closed-outline"
                                        title="Privacy Policy"
                                        onPress={() => navigation.navigate('PrivacyPolicy')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                    <View className="h-px bg-gray-100" />

                                    <MenuItem
                                        icon="code-slash-outline"
                                        title="Open Source Licenses"
                                        onPress={() => navigation.navigate('OpenSourceLicenses')}
                                        iconColor="#6B7280"
                                        textColor="#1F2937"
                                    />
                                </>
                            )}
                        </View>

                        {/* Switch Mode Button - placed below menu items */}
                        {isLoggedIn && (
                            <TouchableOpacity
                                onPress={async () => {
                                    if (isTenantMode && !user?.isHost) {
                                        navigation.navigate('BecomeHost');
                                    } else {
                                        await switchMode();
                                    }
                                }}
                                className="rounded-full mt-5 mb-5"
                                activeOpacity={0.8}
                                style={{ overflow: 'hidden' }}
                            >
                                <LinearGradient
                                    colors={['#10A0F7', '#01E8AD']}
                                    start={{ x: 0, y: 1 }}
                                    end={{ x: 1, y: 0 }}
                                    className="py-4 flex-row items-center justify-center"
                                    style={{
                                        shadowColor: '#10A0F7',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                >
                                    <Ionicons name="swap-horizontal" size={20} color="white" style={{ marginRight: 8 }} />
                                    <Text className="text-white font-semibold text-base">
                                        Switch to {isTenantMode ? 'agent' : 'guest'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>


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
                        <View className="w-80 rounded-3xl p-6 bg-white">
                            <Text className="text-xl font-bold mb-6 text-center text-gray-900">
                                Select Language
                            </Text>

                            {languages.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    onPress={() => {
                                        setSelectedLanguage(lang.code);
                                        setShowLanguageModal(false);
                                    }}
                                    className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${selectedLanguage === lang.code ? 'bg-primary' : 'bg-gray-50'
                                        }`}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name="globe-outline"
                                            size={28}
                                            color={selectedLanguage === lang.code ? '#FFFFFF' : iconColor}
                                            style={{ marginRight: 12 }}
                                        />
                                        <Text className={`text-base font-medium ${selectedLanguage === lang.code ? 'text-white' : 'text-gray-900'
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
            </Animated.ScrollView>
        </View>
    );
}
