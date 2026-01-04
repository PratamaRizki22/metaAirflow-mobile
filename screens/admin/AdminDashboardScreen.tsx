import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks';

export default function AdminDashboardScreen({ navigation }: any) {
    const { logout, user } = useAuth();
    const { isDark } = useTheme();
    const { bgColor, textColor } = useThemeColors();
    const [viewType, setViewType] = useState<'bookings' | 'properties'>('bookings');
    const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID' | 'APPROVED'>('PAID');
    const [bookings, setBookings] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            if (viewType === 'bookings') {
                const response = await api.get('/v1/m/bookings/admin/all', {
                    params: {
                        status: activeTab,
                        limit: 50,
                    },
                });

                if (response.data.success) {
                    setBookings(response.data.data.bookings);
                }
            } else {
                // Fetch properties - currently only supporting PENDING approvals
                const response = await api.get('/v1/m/properties/admin/pending-approvals', {
                    params: {
                        limit: 50,
                    }
                });

                if (response.data.success) {
                    // The API returns { approvals: [...], pagination: ... }
                    setProperties(response.data.data.approvals);
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${viewType}:`, error);
            // Alert.alert('Error', `Failed to fetch ${viewType}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, viewType]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleApproveBooking = async (bookingId: string) => {
        try {
            const response = await api.post(`/v1/m/bookings/${bookingId}/approve`);
            if (response.data.success) {
                Alert.alert('Success', 'Booking approved successfully');
                fetchData();
            } else {
                Alert.alert('Error', response.data.message || 'Failed to approve booking');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to approve booking');
        }
    };

    const handleRejectBooking = async (bookingId: string) => {
        Alert.prompt(
            'Reject Booking',
            'Please enter a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async (reason: string | undefined) => {
                        try {
                            const response = await api.post(`/v1/m/bookings/${bookingId}/reject`, {
                                reason: reason || 'Rejected by Admin',
                            });
                            if (response.data.success) {
                                Alert.alert('Success', 'Booking rejected successfully');
                                fetchData();
                            } else {
                                Alert.alert('Error', response.data.message || 'Failed to reject booking');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to reject booking');
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handleApproveProperty = async (propertyId: string) => {
        try {
            const response = await api.put(`/v1/m/properties/${propertyId}/approve`);
            if (response.data.success) {
                Alert.alert('Success', 'Property approved successfully');
                fetchData();
            } else {
                Alert.alert('Error', response.data.message || 'Failed to approve property');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to approve property');
        }
    };

    const handleRejectProperty = async (propertyId: string) => {
        Alert.prompt(
            'Reject Property',
            'Please enter a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async (reason: string | undefined) => {
                        try {
                            const response = await api.put(`/v1/m/properties/${propertyId}/reject`, {
                                reason: reason || 'Rejected by Admin',
                            });
                            if (response.data.success) {
                                Alert.alert('Success', 'Property rejected successfully');
                                fetchData();
                            } else {
                                Alert.alert('Error', response.data.message || 'Failed to reject property');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to reject property');
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const renderBookingCard = (item: any) => (
        <View
            key={item.id}
            className={`mb-4 p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className={`font-visby-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                        {item.property.title}
                    </Text>
                    <Text className={`font-visby-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.property.city}
                    </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.status === 'PAID' ? 'bg-blue-100' :
                    item.status === 'APPROVED' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                    <Text className={`text-xs font-visby-bold ${item.status === 'PAID' ? 'text-blue-700' :
                        item.status === 'APPROVED' ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mb-4">
                <View className="flex-1">
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tenant</Text>
                    <Text className={`font-visby-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.tenant.name}</Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.tenant.email}</Text>
                </View>
                <View className="flex-1">
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Landlord</Text>
                    <Text className={`font-visby-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.landlord.name}</Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.landlord.email}</Text>
                </View>
            </View>

            <View className="flex-row justify-between mb-4 border-t border-gray-100 pt-3">
                <View>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dates</Text>
                    <Text className={`font-visby-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</Text>
                    <Text className={`font-visby-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {item.property.currencyCode} {item.rentAmount}
                    </Text>
                </View>
            </View>

            {item.status === 'PAID' && (
                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        onPress={() => handleRejectBooking(item.id)}
                        className="flex-1 bg-red-100 py-3 rounded-xl items-center flex-row justify-center"
                    >
                        <Feather name="x-circle" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                        <Text className="text-red-600 font-visby-bold">Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleApproveBooking(item.id)}
                        className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center flex-row justify-center"
                    >
                        <Feather name="check-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
                        <Text className="text-gray-900 font-visby-bold">Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderPropertyCard = (item: any) => {
        // Item is listingApproval object which contains 'property'
        const property = item.property;
        return (
            <View
                key={property.id}
                className={`mb-4 p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                        <Text className={`font-visby-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                            {property.title}
                        </Text>
                        <Text className={`font-visby-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {property.city}, {property.state}
                        </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full bg-yellow-100`}>
                        <Text className={`text-xs font-visby-bold text-yellow-700`}>
                            PENDING
                        </Text>
                    </View>
                </View>

                {property.images && property.images.length > 0 && (
                    <Image
                        source={{ uri: property.images[0] }}
                        className="w-full h-40 rounded-xl mb-3"
                        resizeMode="cover"
                    />
                )}

                <View className="mb-4">
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Owner</Text>
                    <Text className={`font-visby-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {property.owner?.name || `${property.owner?.firstName} ${property.owner?.lastName}`}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{property.owner?.email}</Text>
                </View>

                <View className="flex-row justify-between mb-4 border-t border-gray-100 pt-3">
                    <View>
                        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Price</Text>
                        <Text className={`font-visby-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {property.currencyCode} {property.price}/mo
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Type</Text>
                        <Text className={`font-visby-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {property.propertyType?.name || 'Property'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        onPress={() => handleRejectProperty(property.id)}
                        className="flex-1 bg-red-100 py-3 rounded-xl items-center flex-row justify-center"
                    >
                        <Feather name="x-circle" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                        <Text className="text-red-600 font-visby-bold">Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleApproveProperty(property.id)}
                        className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center flex-row justify-center"
                    >
                        <Feather name="check-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
                        <Text className="text-gray-900 font-visby-bold">Approve</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top']}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View className={`px-6 py-4 flex-row justify-between items-center bg-transparent`}>
                <View>
                    <Text className={`text-2xl font-visby-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Admin Dashboard
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Welcome back, {user?.name || 'Admin'}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleLogout}
                    className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                    <Feather name="log-out" size={20} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
            </View>

            {/* View Type Toggle */}
            <View className="flex-row px-6 mb-4 space-x-4">
                <TouchableOpacity
                    onPress={() => setViewType('bookings')}
                    className={`flex-1 py-3 items-center rounded-xl border ${viewType === 'bookings'
                        ? 'bg-primary-500 border-primary-500'
                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}
                >
                    <Text className={`font-visby-bold ${viewType === 'bookings' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Bookings
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setViewType('properties')}
                    className={`flex-1 py-3 items-center rounded-xl border ${viewType === 'properties'
                        ? 'bg-primary-500 border-primary-500'
                        : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}
                >
                    <Text className={`font-visby-bold ${viewType === 'properties' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Properties
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tabs (only for bookings for now) */}
            {viewType === 'bookings' ? (
                <View className="flex-row px-6 mb-4">
                    {['PENDING', 'PAID', 'APPROVED'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab as any)}
                            className={`mr-3 px-4 py-2 rounded-full border ${activeTab === tab
                                ? 'bg-primary-500 border-primary-500'
                                : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`font-visby-medium ${activeTab === tab
                                ? 'text-white'
                                : isDark ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <View className="px-6 mb-4">
                    <Text className={`font-visby-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Pending Property Approvals
                    </Text>
                </View>
            )}

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#FFFFFF' : '#000000'} />
                }
            >
                {loading && !refreshing ? (
                    <View className="py-20 items-center">
                        <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading...</Text>
                    </View>
                ) : viewType === 'bookings' ? (
                    bookings.length === 0 ? (
                        <View className="py-20 items-center">
                            <Feather name="inbox" size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
                            <Text className={`mt-4 font-visby-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No {activeTab.toLowerCase()} bookings found
                            </Text>
                        </View>
                    ) : (
                        bookings.map(renderBookingCard)
                    )
                ) : (
                    properties.length === 0 ? (
                        <View className="py-20 items-center">
                            <Feather name="home" size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
                            <Text className={`mt-4 font-visby-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No pending property approvals
                            </Text>
                        </View>
                    ) : (
                        properties.map(renderPropertyCard)
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
