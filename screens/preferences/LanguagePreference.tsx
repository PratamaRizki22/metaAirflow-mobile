import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LanguagePreferenceProps {
    onComplete: () => void;
}

type Language = 'en' | 'id' | 'ms';

export function LanguagePreference({ onComplete }: LanguagePreferenceProps) {
    const { isDark } = useTheme();
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

    const languages = [
        { code: 'en' as Language, name: 'English', flag: '🇬🇧', description: 'English (US)' },
        { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩', description: 'Indonesian' },
        { code: 'ms' as Language, name: 'Bahasa Melayu', flag: '🇲🇾', description: 'Malay' },
    ];

    const handleSelectLanguage = (lang: Language) => {
        setSelectedLanguage(lang);
        setTimeout(() => onComplete(), 300);
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
            <View className="flex-1 justify-center px-6">
                <View className="mb-12">
                    <Text className={`text-4xl font-bold mb-4 text-center ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
                        Choose Language
                    </Text>
                    <Text className={`text-base text-center ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
                        Select your preferred language
                    </Text>
                </View>

                <View className="gap-4">
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => handleSelectLanguage(lang.code)}
                            className={`rounded-2xl p-6 border-2 ${selectedLanguage === lang.code
                                    ? 'bg-primary border-primary'
                                    : isDark
                                        ? 'bg-surface-dark border-border-dark'
                                        : 'bg-surface-light border-border-light'
                                }`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-16 h-16 rounded-full bg-white items-center justify-center mr-4">
                                    <Text className="text-4xl">{lang.flag}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-xl font-bold mb-1 ${selectedLanguage === lang.code
                                            ? 'text-white'
                                            : isDark
                                                ? 'text-text-primary-dark'
                                                : 'text-text-primary-light'
                                        }`}>
                                        {lang.name}
                                    </Text>
                                    <Text className={`text-sm ${selectedLanguage === lang.code
                                            ? 'text-white/80'
                                            : isDark
                                                ? 'text-text-secondary-dark'
                                                : 'text-text-secondary-light'
                                        }`}>
                                        {lang.description}
                                    </Text>
                                </View>
                                {selectedLanguage === lang.code && (
                                    <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                                        <Text className="text-primary text-lg font-bold">✓</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-12">
                    <View className="flex-row justify-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-border-light dark:bg-border-dark" />
                        <View className="w-8 h-2 rounded-full bg-primary" />
                    </View>
                </View>
            </View>
        </View>
    );
}
