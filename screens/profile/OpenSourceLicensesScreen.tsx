import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

export default function OpenSourceLicensesScreen() {
    const { bgColor, textColor, cardBg, secondaryTextColor, isDark, borderColor } = useThemeColors();

    const LicenseItem = ({ library, license, description, url }: any) => (
        <TouchableOpacity
            onPress={() => url && Linking.openURL(url)}
            disabled={!url}
            className={`${cardBg} p-5 rounded-2xl mb-4 border ${borderColor}`}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text
                    className={`font-bold text-lg ${textColor}`}
                    style={{ fontFamily: 'VisbyRound-Bold' }}
                >
                    {library}
                </Text>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-primary">{license}</Text>
                </View>
            </View>
            <Text className={`text-sm ${secondaryTextColor} leading-5 mb-2`}>{description}</Text>
            {url && (
                <View className="flex-row items-center mt-2">
                    <Text className="text-xs text-primary font-semibold mr-1">View License</Text>
                    <Ionicons name="open-outline" size={12} color="#00D9A3" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center py-6 mb-6">
                    <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-primary/20' : 'bg-primary/10'} items-center justify-center mb-4`}>
                        <Ionicons name="code-slash-outline" size={40} color="#00D9A3" />
                    </View>
                    <Text
                        className={`text-2xl text-center ${textColor}`}
                        style={{ fontFamily: 'VisbyRound-Bold' }}
                    >
                        Open Source
                    </Text>
                    <Text className={`text-center mt-2 ${secondaryTextColor} px-4`}>
                        Rentverse is built with these awesome open source technologies.
                    </Text>
                </View>

                <LicenseItem
                    library="React Native"
                    license="MIT"
                    description="A framework for building native apps using React."
                    url="https://github.com/facebook/react-native"
                />

                <LicenseItem
                    library="Expo"
                    license="MIT"
                    description="The global platform for writing universal React applications."
                    url="https://expo.dev"
                />

                <LicenseItem
                    library="NativeWind"
                    license="MIT"
                    description="A utility-first CSS framework for React Native, bringing Tailwind CSS to mobile."
                    url="https://www.nativewind.dev/"
                />

                <LicenseItem
                    library="React Navigation"
                    license="MIT"
                    description="Routing and navigation for your Expo and React Native apps."
                    url="https://reactnavigation.org/"
                />

                <LicenseItem
                    library="Axios"
                    license="MIT"
                    description="Promise based HTTP client for the browser and node.js"
                    url="https://axios-http.com/"
                />

                <LicenseItem
                    library="Stripe React Native"
                    license="MIT"
                    description="React Native library for Stripe payment processing."
                    url="https://github.com/stripe/stripe-react-native"
                />

            </ScrollView>
        </View>
    );
}
