import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors } from '../../hooks';
import { useCustomAlert } from '../../components/common';

export default function BecomeHostScreen({ navigation }: any) {
    const { activateHosting } = useAuth();
    const [loading, setLoading] = useState(false);
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const { showAlert, AlertComponent } = useCustomAlert();

    const handleActivateHosting = async () => {
        showAlert(
            'Aktifkan Fitur Hosting',
            'Anda akan dapat mengelola properti dan menerima booking. Lanjutkan?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Aktifkan',
                    style: 'default',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Simulate module download
                            await new Promise(resolve => setTimeout(resolve, 1500));

                            // Activate hosting (temporary, client-side only)
                            await activateHosting();

                            showAlert(
                                'Berhasil!',
                                'Fitur hosting telah diaktifkan. Buat properti pertama Anda untuk mulai menyewakan!',
                                [
                                    {
                                        text: 'Buat Properti',
                                        style: 'default',
                                        onPress: () => {
                                            // Navigate to CreateProperty screen
                                            // After user creates first property, landlord status will be persistent
                                            navigation.replace('MainTabs', {
                                                screen: 'Profile',
                                                params: {
                                                    screen: 'CreateProperty'
                                                }
                                            });
                                        }
                                    }
                                ]
                            );
                        } catch (error: any) {
                            showAlert('Error', error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const features = [
        {
            icon: 'home-outline',
            title: 'Kelola properti Anda',
            description: 'Tambah, edit, dan kelola semua properti Anda'
        },
        {
            icon: 'calendar-outline',
            title: 'Terima dan kelola booking',
            description: 'Terima permintaan booking dan kelola jadwal'
        },
        {
            icon: 'stats-chart-outline',
            title: 'Lihat statistik pendapatan',
            description: 'Monitor pendapatan dan performa properti'
        },
        {
            icon: 'chatbubbles-outline',
            title: 'Chat dengan penyewa',
            description: 'Komunikasi langsung dengan calon penyewa'
        }
    ];

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="px-6 py-8">
                {/* Header */}
                <Text className={`text-3xl font-bold mb-3 ${textColor}`}>
                    Menjadi Tuan Rumah
                </Text>

                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-base mb-8">
                    Mulai menyewakan properti Anda dan dapatkan penghasilan tambahan
                </Text>

                {/* Features List */}
                <Text className={`text-lg font-semibold mb-4 ${textColor}`}>
                    Fitur yang akan Anda dapatkan:
                </Text>

                <View className="gap-4 mb-8">
                    {features.map((feature, index) => (
                        <View
                            key={index}
                            className={`${cardBg} p-4 rounded-2xl flex-row items-start`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                        >
                            <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                                <Ionicons
                                    name={feature.icon as any}
                                    size={24}
                                    color="#00D9A3"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-base font-semibold mb-1 ${textColor}`}>
                                    {feature.title}
                                </Text>
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                    {feature.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                {loading ? (
                    <View className="items-center py-8">
                        <ActivityIndicator size="large" color="#00D9A3" />
                        <Text className={`mt-4 ${textColor}`}>
                            Mengaktifkan fitur hosting...
                        </Text>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={handleActivateHosting}
                            className="bg-primary rounded-xl py-4 mb-3"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                AKTIFKAN SEKARANG
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className={`${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-xl py-4`}
                        >
                            <Text className={`text-center font-semibold text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                NANTI SAJA
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Bottom Spacing */}
                <View className="h-8" />
            </View>

            {/* Custom Alert */}
            <AlertComponent />
        </ScrollView>
    );
}
