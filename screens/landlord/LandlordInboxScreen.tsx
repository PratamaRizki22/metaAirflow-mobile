import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../hooks';
import { messageService, Conversation } from '../../services';
import { LoadingState } from '../../components/common';

export function LandlordInboxScreen({ navigation }: any) {
    const { bgColor, textColor, cardBg, isDark } = useThemeColors();
    const [conversations, setConversations] = useState<Conversation[]>([]);
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
            const response = await messageService.getConversations();
            setConversations(response.data || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setConversations([]);
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
                    Pesan dari tenant Anda
                </Text>

                {conversations.length === 0 ? (
                    /* Empty State */
                    <View className={`${cardBg} p-12 rounded-2xl items-center mt-8`}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={64}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                        <Text className={`text-lg font-semibold mt-6 ${textColor}`}>
                            Belum Ada Pesan
                        </Text>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-center">
                            Pesan dari tenant akan muncul di sini
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
