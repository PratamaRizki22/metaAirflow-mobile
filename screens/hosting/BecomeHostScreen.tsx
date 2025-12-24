import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function BecomeHostScreen({ navigation }: any) {
    const { activateHosting } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleActivateHosting = async () => {
        Alert.alert(
            'Aktifkan Fitur Hosting',
            'Anda akan dapat mengelola properti dan menerima booking. Lanjutkan?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Aktifkan',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Simulate module download
                            await new Promise(resolve => setTimeout(resolve, 1500));

                            // Activate hosting
                            await activateHosting();

                            Alert.alert(
                                'Berhasil!',
                                'Fitur hosting telah diaktifkan. Anda sekarang bisa mengelola properti!',
                                [
                                    {
                                        text: 'Mulai',
                                        onPress: () => navigation.replace('Main')
                                    }
                                ]
                            );
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Menjadi Tuan Rumah
            </Text>

            <Text style={{ fontSize: 16, marginBottom: 20, color: '#666' }}>
                Mulai menyewakan properti Anda dan dapatkan penghasilan tambahan
            </Text>

            <View style={{ marginBottom: 30 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                    Fitur yang akan Anda dapatkan:
                </Text>

                <Text style={{ marginBottom: 5 }}>• Kelola properti Anda</Text>
                <Text style={{ marginBottom: 5 }}>• Terima dan kelola booking</Text>
                <Text style={{ marginBottom: 5 }}>• Lihat statistik pendapatan</Text>
                <Text style={{ marginBottom: 5 }}>• Chat dengan penyewa</Text>
            </View>

            {loading ? (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 10 }}>Mengaktifkan fitur hosting...</Text>
                </View>
            ) : (
                <Button
                    title="Aktifkan Sekarang"
                    onPress={handleActivateHosting}
                />
            )}

            <Button
                title="Nanti Saja"
                onPress={() => navigation.goBack()}
                color="#999"
            />
        </View>
    );
}
