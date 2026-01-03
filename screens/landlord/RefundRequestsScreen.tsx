import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { stripeService } from '../../services';
import { RefundRequest } from '../../services/stripeService';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/useToast';

export default function RefundRequestsScreen({ navigation }: any) {
    const [requests, setRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processLoading, setProcessLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const { isDark } = useTheme();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await stripeService.getRefundRequests('PENDING');
            setRequests(data);
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (request: RefundRequest) => {
        Alert.alert(
            'Approve Refund',
            `Are you sure you want to approve the refund of MYR ${request.amount.toLocaleString()} for ${request.tenant.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => processRefund(request.id, true),
                    style: 'default',
                },
            ]
        );
    };

    const handleReject = (request: RefundRequest) => {
        setSelectedRequest(request);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (selectedRequest && rejectReason.trim()) {
            await processRefund(selectedRequest.id, false, rejectReason);
            setShowRejectModal(false);
        }
    };

    const processRefund = async (requestId: string, approve: boolean, notes?: string) => {
        try {
            setProcessLoading(true);
            await stripeService.processRefundRequest(requestId, approve, notes);
            showToast(approve ? 'Refund approved' : 'Refund rejected', 'success');
            loadRequests(); // Reload list
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setProcessLoading(false);
        }
    };

    const renderItem = ({ item }: { item: RefundRequest }) => (
        <View className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            {/* Header: Tenant Info */}
            <View className="flex-row items-center mb-3">
                <Image
                    source={{ uri: item.tenant.profilePicture || 'https://ui-avatars.com/api/?name=' + item.tenant.name }}
                    className="w-10 h-10 rounded-full bg-gray-200"
                />
                <View className="ml-3 flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.tenant.name}</Text>
                    <Text className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View className="bg-yellow-100 px-2 py-1 rounded-md">
                    <Text className="text-yellow-800 text-xs font-medium">Pending</Text>
                </View>
            </View>

            {/* Property Info */}
            <View className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Text className={`font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.lease.property.title}</Text>
                <Text className="text-xs text-gray-500 mb-2">
                    {new Date(item.lease.startDate).toLocaleDateString()} - {new Date(item.lease.endDate).toLocaleDateString()}
                </Text>
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>MYR {item.amount.toLocaleString()}</Text>
            </View>

            {/* Reason */}
            <View className="mb-4">
                <Text className="text-xs text-gray-500 mb-1">Reason for refund:</Text>
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.reason}</Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => handleReject(item)}
                    disabled={processLoading}
                    className="flex-1 border border-red-500 py-2 rounded-lg items-center"
                >
                    <Text className="text-red-500 font-medium">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleApprove(item)}
                    disabled={processLoading}
                    className="flex-1 bg-green-500 py-2 rounded-lg items-center"
                >
                    <Text className="text-white font-medium">Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-4 py-3 flex-row items-center border-b border-gray-200 dark:border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Refund Requests</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00D9A3" />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Ionicons name="documents-outline" size={64} color="gray" />
                            <Text className="text-gray-500 mt-4">No pending refund requests</Text>
                        </View>
                    }
                />
            )}

            {/* Reject Modal */}
            <Modal
                visible={showRejectModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRejectModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-4">
                    <View className={`w-full rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reject Refund</Text>
                        <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Please provide a reason for rejection:</Text>

                        <TextInput
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            placeholder="Reason..."
                            placeholderTextColor="gray"
                            multiline
                            numberOfLines={3}
                            className={`border rounded-lg p-3 mb-4 h-24 text-top ${isDark ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-gray-900 bg-gray-50'
                                }`}
                            style={{ textAlignVertical: 'top' }}
                        />

                        <View className="flex-row justify-end gap-3">
                            <TouchableOpacity onPress={() => setShowRejectModal(false)} className="px-4 py-2">
                                <Text className="text-gray-500">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmReject}
                                disabled={!rejectReason.trim() || processLoading}
                                className={`px-4 py-2 rounded-lg ${!rejectReason.trim() ? 'bg-gray-300' : 'bg-red-500'}`}
                            >
                                <Text className="text-white font-medium">Reject Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
