import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoginPrompt } from '../../components/auth';

export function AddPropertyScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { isLoggedIn, user } = useAuth();

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const cardBg = isDark ? 'bg-card-dark' : 'bg-card-light';

    // If not logged in, show login prompt
    if (!isLoggedIn) {
        return (
            <View className={`flex-1 ${bgColor}`}>
                <ScrollView className="flex-1 px-6 pt-16">
                    <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                        Add Property
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                        List your property for rent or sale
                    </Text>

                    <LoginPrompt
                        variant="inline"
                        title="Login Required"
                        message="Please sign in to list your property"
                        onLoginPress={() => navigation.navigate('Profile')}
                    />

                    {/* Bottom padding for tab bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        );
    }

    // If logged in but not a landlord, prompt to become host
    if (!user?.isLandlord) {
        return (
            <View className={`flex-1 ${bgColor}`}>
                <ScrollView className="flex-1 px-6 pt-16">
                    <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                        Add Property
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                        List your property for rent or sale
                    </Text>

                    {/* Become Host Prompt */}
                    <View className={`${cardBg} rounded-2xl p-6 mb-4`}>
                        <View className="items-center mb-4">
                            <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4">
                                <Ionicons name="home" size={40} color="#14B8A6" />
                            </View>
                            <Text className={`text-xl font-bold mb-2 text-center ${textColor}`}>
                                Become a Host First
                            </Text>
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-center mb-6">
                                Activate hosting features to start listing your properties and earn income
                            </Text>
                        </View>

                        <View className="space-y-3 mb-6">
                            <View className="flex-row items-start">
                                <Ionicons name="checkmark-circle" size={24} color="#14B8A6" style={{ marginRight: 12 }} />
                                <View className="flex-1">
                                    <Text className={`font-semibold ${textColor}`}>Manage Properties</Text>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                        List and manage multiple properties
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-start">
                                <Ionicons name="checkmark-circle" size={24} color="#14B8A6" style={{ marginRight: 12 }} />
                                <View className="flex-1">
                                    <Text className={`font-semibold ${textColor}`}>Handle Bookings</Text>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                        Approve or reject booking requests
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-start">
                                <Ionicons name="checkmark-circle" size={24} color="#14B8A6" style={{ marginRight: 12 }} />
                                <View className="flex-1">
                                    <Text className={`font-semibold ${textColor}`}>Track Earnings</Text>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                        View statistics and revenue insights
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            className="bg-primary rounded-xl py-4"
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                Activate Hosting Now
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom padding for tab bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        );
    }

    // If logged in and is landlord, navigate to CreateProperty
    // This will happen automatically when tab is pressed
    React.useEffect(() => {
        if (isLoggedIn && user?.isLandlord) {
            navigation.navigate('CreateProperty');
        }
    }, [isLoggedIn, user?.isLandlord, navigation]);

    return (
        <View className={`flex-1 ${bgColor} justify-center items-center`}>
            <Text className={textColor}>Redirecting to Create Property...</Text>
        </View>
    );
}
