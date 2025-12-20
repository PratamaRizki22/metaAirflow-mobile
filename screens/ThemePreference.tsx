import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ThemePreferenceProps {
    onComplete: () => void;
}

export function ThemePreference({ onComplete }: ThemePreferenceProps) {
    const { isDark, toggleTheme } = useTheme();

    const handleSelectTheme = (theme: 'light' | 'dark') => {
        if ((theme === 'dark' && !isDark) || (theme === 'light' && isDark)) {
            toggleTheme();
        }
        setTimeout(() => onComplete(), 300);
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
            <View className="flex-1 justify-center px-6">
                <View className="mb-12">
                    <Text className={`text-4xl font-bold mb-4 text-center ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
                        Choose Your Theme
                    </Text>
                    <Text className={`text-base text-center ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
                        Select your preferred appearance
                    </Text>
                </View>

                <View className="gap-4">
                    <TouchableOpacity
                        onPress={() => handleSelectTheme('light')}
                        className={`rounded-2xl p-6 border-2 ${!isDark
                                ? 'bg-primary border-primary'
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
                        <View className="items-center">
                            <View className="w-16 h-16 rounded-full bg-white items-center justify-center mb-4">
                                <Text className="text-4xl">☀️</Text>
                            </View>
                            <Text className={`text-xl font-bold mb-2 ${!isDark ? 'text-white' : 'text-text-primary-light'}`}>
                                Light Mode
                            </Text>
                            <Text className={`text-sm text-center ${!isDark ? 'text-white/80' : 'text-text-secondary-light'}`}>
                                Bright and clear interface
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleSelectTheme('dark')}
                        className={`rounded-2xl p-6 border-2 ${isDark
                                ? 'bg-primary border-primary'
                                : 'bg-surface-dark border-border-dark'
                            }`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <View className="items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center mb-4">
                                <Text className="text-4xl">🌙</Text>
                            </View>
                            <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-text-primary-dark'}`}>
                                Dark Mode
                            </Text>
                            <Text className={`text-sm text-center ${isDark ? 'text-white/80' : 'text-text-secondary-dark'}`}>
                                Easy on the eyes
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="mt-12">
                    <View className="flex-row justify-center gap-2">
                        <View className="w-8 h-2 rounded-full bg-primary" />
                        <View className="w-2 h-2 rounded-full bg-border-light dark:bg-border-dark" />
                    </View>
                </View>
            </View>
        </View>
    );
}
