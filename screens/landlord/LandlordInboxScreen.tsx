import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../hooks';
import { messageService, refundService, Conversation, type RefundRequest } from '../../services';
import { LoadingState } from '../../components/common';

export function LandlordInboxScreen({ navigation }: any) {
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadConversations();
        }, [])
    );

    const loadConversations = async () => {
        try {
            setLoading(true);
            const [conversationsResponse, refundRequestsResponse] = await Promise.all([
                messageService.getConversations(),
                refundService.getRefundRequests()
            ]);
            
            setConversations(conversationsResponse.data || []);
            setRefundRequests(refundRequestsResponse || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setConversations([]);
            setRefundRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadConversations();
        setRefreshing(false);
    };

    const handleConversationPress = (conversation: Conversation) => {
        navigation.navigate('ChatDetail', {
            conversationId: conversation.id,
            propertyId: conversation.propertyId,
            otherUserId: conversation.tenantId,
            otherUserName: 'Tenant', // You can enhance this with actual tenant name
            hasActiveBooking: true, // Landlord always has full access
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (loading) {
        return <LoadingState message="Loading conversations..." />;
    }

    return (
        <ScrollView
            className={`flex-1 ${bgColor}`}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    progressViewOffset={100}
                />
            }
        >
            <View className="px-6 pt-16 pb-6">
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Inbox
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                    Messages from your tenants
                </Text>

                {/* Refund Requests Section */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-lg font-semibold ${textColor}`}>
                            Refund Requests
                        </Text>
                        {refundRequests.filter(r => r.status === 'PENDING').length > 0 && (
                            <View className="bg-red-500 rounded-full px-2 py-1">
                                <Text className="text-white text-xs font-bold">
                                    {refundRequests.filter(r => r.status === 'PENDING').length}
                                </Text>
                            </View>
                        )}
                    </View>

                    {refundRequests.filter(r => r.status === 'PENDING').length === 0 ? (
                        <View className={`${cardBg} p-4 rounded-2xl`}>
                            <Text className="text-gray-500 text-center">No pending refund requests</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('RefundRequests')}
                            className={`${cardBg} p-4 rounded-2xl flex-row items-center justify-between`}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="card-outline" size={24} color="#EF4444" />
                                <Text className={`ml-3 font-medium ${textColor}`}>
                                    View Refund Requests ({refundRequests.filter(r => r.status === 'PENDING').length})
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {conversations.length === 0 ? (
                    /* Empty State */
                    <View className={`${cardBg} p-12 rounded-2xl items-center mt-8`}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={64}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text className={`text-lg font-semibold mt-6 ${textColor}`}>
                            No Messages Yet
                        </Text>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
                            Messages from tenants will appear here
                        </Text>
                    </View>
                ) : (
                    /* Conversations List */
                    <View className="gap-3">
                        {conversations.map((conversation) => (
                            <TouchableOpacity
                                key={conversation.id}
                                onPress={() => handleConversationPress(conversation)}
                                className={`${cardBg} p-4 rounded-2xl`}
                            >
                                <View className="flex-row items-center">
                                    {/* Avatar */}
                                    <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                                        <Ionicons name="person" size={24} color="white" />
                                    </View>

                                    {/* Content */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className={`text-base font-semibold ${textColor}`}>
                                                Tenant #{conversation.tenantId.substring(0, 8)}
                                            </Text>
                                            {conversation.lastMessage && (
                                                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
                                                    {formatTime(conversation.lastMessage.createdAt)}
                                                </Text>
                                            )}
                                        </View>

                                        <View className="flex-row items-center justify-between">
                                            <Text
                                                className="text-text-secondary-light dark:text-text-secondary-dark text-sm flex-1"
                                                numberOfLines={1}
                                            >
                                                {conversation.lastMessage?.content || 'No messages yet'}
                                            </Text>

                                            {/* Unread Badge */}
                                            {conversation.unreadCount > 0 && (
                                                <View className="bg-primary rounded-full w-6 h-6 items-center justify-center ml-2">
                                                    <Text className="text-white text-xs font-bold">
                                                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
