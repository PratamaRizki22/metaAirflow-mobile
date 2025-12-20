import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface PreferenceScreenProps {
    onComplete: () => void;
}

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

// Theme Option Component
interface ThemeOptionProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: ThemeOption;
    currentTheme: ThemeOption;
    onPress: () => void;
    surfaceColor: string;
    textColor: string;
    iconColor: string;
}

const ThemeOptionButton = ({ icon, label, value, currentTheme, onPress, surfaceColor, textColor, iconColor }: ThemeOptionProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between p-4 rounded-2xl"
        style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
    >
        <View className="flex-row items-center">
            <Ionicons name={icon} size={24} color={iconColor} style={{ marginRight: 12 }} />
            <Text className="text-base font-medium" style={{ color: textColor }}>
                {label}
            </Text>
        </View>
        <RadioButton selected={currentTheme === value} />
    </TouchableOpacity>
);

export function PreferenceScreen({ onComplete }: PreferenceScreenProps) {
    const { isDark, theme, setTheme } = useTheme();
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('id');
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const languages = [
        { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    ];

    const handleLanguageSelect = (lang: Language) => {
        setSelectedLanguage(lang);
        setShowLanguageModal(false);
    };

    const selectedLangData = languages.find(l => l.code === selectedLanguage);

    // Simplified color logic
    const getColor = (lightColor: string, darkColor: string) => {
        if (theme === 'light') return lightColor;
        if (theme === 'dark') return darkColor;
        return isDark ? darkColor : lightColor;
    };

    const backgroundColor = getColor('#FFFFFF', '#0F172A');
    const surfaceColor = getColor('#FFFFFF', '#1E293B');
    const textPrimaryColor = getColor('#1F2937', '#F1F5F9');
    const textSecondaryColor = getColor('#6B7280', '#CBD5E1');
    const iconColor = isDark ? '#14B8A6' : '#0D9488';
    const houseImage = isDark ? require('../assets/darkmode.webp') : require('../assets/lightmode.webp');

    return (
        <View style={{ flex: 1, backgroundColor }}>
            {/* Top Green Section */}
            <View className="h-64 bg-primary rounded-b-3xl" />

            {/* Content */}
            <View className="flex-1 px-6 -mt-32">
                {/* House Icon */}
                <View className="items-center mb-8">
                    <View
                        className="w-40 h-40 rounded-3xl items-center justify-center overflow-hidden"
                        style={{ backgroundColor: surfaceColor }}
                    >
                        <Image
                            source={houseImage}
                            style={{ width: 120, height: 120, resizeMode: 'contain' }}
                        />
                    </View>
                </View>

                {/* Language Selector */}
                <TouchableOpacity
                    onPress={() => setShowLanguageModal(true)}
                    className="mb-6 p-4 rounded-2xl"
                    style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                >
                    <Text className="text-sm mb-2" style={{ color: textSecondaryColor }}>
                        {selectedLangData?.name} ({selectedLanguage.toUpperCase()})
                    </Text>
                </TouchableOpacity>

                {/* Theme Options */}
                <View className="gap-4 mb-6">
                    <ThemeOptionButton
                        icon="moon"
                        label="Dark"
                        value="dark"
                        currentTheme={theme}
                        onPress={() => setTheme('dark')}
                        surfaceColor={surfaceColor}
                        textColor={textPrimaryColor}
                        iconColor={iconColor}
                    />
                    <ThemeOptionButton
                        icon="sunny"
                        label="Light"
                        value="light"
                        currentTheme={theme}
                        onPress={() => setTheme('light')}
                        surfaceColor={surfaceColor}
                        textColor={textPrimaryColor}
                        iconColor={iconColor}
                    />
                    <ThemeOptionButton
                        icon="phone-portrait-outline"
                        label="Sesuai pengaturan perangkat"
                        value="system"
                        currentTheme={theme}
                        onPress={() => setTheme('system')}
                        surfaceColor={surfaceColor}
                        textColor={textPrimaryColor}
                        iconColor={iconColor}
                    />
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    onPress={onComplete}
                    className="rounded-full py-4 px-8 self-center"
                    style={{ backgroundColor: surfaceColor, ...CARD_STYLE }}
                >
                    <Text className="text-primary font-semibold text-base">
                        Simpan
                    </Text>
                </TouchableOpacity>
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
                    <View className={`w-80 rounded-3xl p-6 ${isDark ? 'bg-[#1E293B]' : 'bg-white'}`}>
                        <Text className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-[#F1F5F9]' : 'text-[#1F2937]'}`}>
                            Pilih Bahasa
                        </Text>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleLanguageSelect(lang.code)}
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
        </View>
    );
}
