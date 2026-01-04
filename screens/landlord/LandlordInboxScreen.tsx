import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { messageService, refundService, Conversation, type RefundRequest } from '../../services';
import { LoadingState } from '../../components/common';

export function LandlordInboxScreen({ navigation }: any) {
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'messages' | 'refunds' | 'unread'>('all');

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
                refundService.getRefundRequests(),
            ]);

            const allConversations = conversationsResponse.data || [];

            // Parse and format conversations
            const parsedConversations = allConversations.map(conv => {
                // Parse system messages to show "Asking about [Property]"
                if (conv.lastMessage) {
                    const msgType = conv.lastMessage.type?.toUpperCase();
                    let formattedContent = conv.lastMessage.content;

                    if (msgType === 'SYSTEM') {
                        try {
                            if (formattedContent.trim().startsWith('{')) {
                                const parsed = JSON.parse(formattedContent);
                                formattedContent = parsed.title
                                    ? `Asking about ${parsed.title}`
                                    : 'System Message';
                            }
                        } catch (e) {
                            // Keep original if parsing fails
                        }
                    } else if (msgType === 'IMAGE') {
                        formattedContent = 'Sent an image';
                    }

                    // Add 'Me:' prefix if message was sent by current user (landlord)
                    if (conv.lastMessage.senderId === user?.id) {
                        formattedContent = `Me: ${formattedContent}`;
                    }

                    // Update the lastMessage content
                    conv.lastMessage = {
                        ...conv.lastMessage,
                        content: formattedContent
                    };
                }

                return conv;
            });

            // Group conversations by tenant (show only latest conversation per tenant)
            const groupedByTenant = new Map<string, Conversation>();
            parsedConversations.forEach(conv => {
                const tenantId = conv.tenantId;
                const existing = groupedByTenant.get(tenantId);

                if (!existing) {
                    groupedByTenant.set(tenantId, conv);
                } else {
                    // Keep the most recent conversation
                    const existingDate = new Date(existing.updatedAt || existing.createdAt);
                    const currentDate = new Date(conv.updatedAt || conv.createdAt);

                    if (currentDate > existingDate) {
                        groupedByTenant.set(tenantId, conv);
                    }
                }
            });

            // Convert map to array and sort by most recent
            const groupedConversations = Array.from(groupedByTenant.values()).sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                return dateB - dateA;
            });

            setConversations(groupedConversations);
            setRefundRequests(refundRequestsResponse || []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setConversations([]);
            setRefundRequests([]);
        } finally {
            // setLoading(false); // Moved to try block
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadConversations();
        setRefreshing(false);
    };

    const handleConversationPress = (conversation: Conversation) => {
        // Get tenant name, fallback to 'Tenant' if not available
        const tenantName = conversation.tenant?.name || `Tenant #${conversation.tenantId.substring(0, 8)}`;

        navigation.navigate('ChatDetail', {
            conversationId: conversation.id,
            propertyId: conversation.propertyId,
            otherUserId: conversation.tenantId,
            otherUserName: tenantName,
            hasActiveBooking: true, // Landlord always has full access
        });
    };

    // Filter conversations based on search and filter
    const filteredConversations = conversations.filter(conv => {
        const tenantName = conv.tenant?.name || '';
        const lastMessage = conv.lastMessage?.content || '';

        const matchesSearch = tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter logic
        if (filter === 'refunds') return false; // Hide messages when showing refunds
        if (filter === 'messages') return matchesSearch; // Show all messages
        if (filter === 'unread') return matchesSearch && conv.unreadCount > 0;
        return matchesSearch; // 'all' - show all
    });

    // Filter refund requests based on search and filter
    const filteredRefundRequests = refundRequests.filter(req => {
        if (filter === 'messages') return false; // Hide refunds when showing messages
        if (filter === 'unread') return false; // Hide refunds when showing unread

        // For 'all' and 'refunds', show pending requests
        return req.status === 'PENDING';
    });

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
                    onRefresh={onRefresh}
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

                {/* Search Bar */}
                <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl px-4 py-3 mb-4`}>
                    <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    <TextInput
                        placeholder="Search messages"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className={`flex-1 ml-2 ${textColor}`}
                    />
                </View>

                {/* Filter Tabs */}
                <View className="flex-row mb-6 gap-2 flex-wrap">
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                    >
                        <Text className={`${filter === 'all' ? 'text-white' : textColor} font-medium`}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('messages')}
                        className={`px-4 py-2 rounded-lg ${filter === 'messages' ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                    >
                        <Text className={`${filter === 'messages' ? 'text-white' : textColor} font-medium`}>
                            Messages
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('refunds')}
                        className={`px-4 py-2 rounded-lg ${filter === 'refunds' ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                    >
                        <Text className={`${filter === 'refunds' ? 'text-white' : textColor} font-medium`}>
                            Refunds
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                    >
                        <Text className={`${filter === 'unread' ? 'text-white' : textColor} font-medium`}>
                            Unread
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Refund Requests Section */}
                {(filter === 'all' || filter === 'refunds') && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className={`text-lg font-semibold ${textColor}`}>
                                Refund Requests
                            </Text>
                            {filteredRefundRequests.length > 0 && (
                                <View className="bg-red-500 rounded-full px-2 py-1">
                                    <Text className="text-white text-xs font-bold">
                                        {filteredRefundRequests.length}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {filteredRefundRequests.length === 0 ? (
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
                                        View Refund Requests ({filteredRefundRequests.length})
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {filteredConversations.length === 0 ? (
                    /* Empty State */
                    <View className={`${cardBg} p-12 rounded-2xl items-center mt-8`}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={64}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text className={`text-lg font-semibold mt-6 ${textColor}`}>
                            {searchQuery
                                ? 'No Results Found'
                                : filter === 'unread'
                                    ? 'No Unread Messages'
                                    : filter === 'messages'
                                        ? 'No Messages Yet'
                                        : filter === 'refunds'
                                            ? 'No Refund Requests'
                                            : 'No Messages Yet'}
                        </Text>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
                            {searchQuery
                                ? 'Try adjusting your search terms'
                                : filter === 'unread'
                                    ? 'All messages have been read'
                                    : filter === 'messages'
                                        ? 'Messages from tenants will appear here'
                                        : filter === 'refunds'
                                            ? 'No pending refund requests'
                                            : 'Messages from tenants will appear here'}
                        </Text>
                    </View>
                ) : (
                    /* Conversations List */
                    <View className="gap-3">
                        {filteredConversations.map((conversation) => (
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
                                                {conversation.tenantId === user?.id
                                                    ? 'Me'
                                                    : conversation.tenant?.name || `Tenant #${conversation.tenantId.substring(0, 8)}`}
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
