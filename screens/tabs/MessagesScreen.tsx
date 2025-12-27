import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors } from '../../hooks';
import { messageService, Conversation as ServiceConversation } from '../../services';

interface Conversation {
    id: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage?: string;
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
    hasActiveBooking: boolean;
    bookingStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

export function MessagesScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);

    const { bgColor, textColor, cardBg } = useThemeColors();

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await messageService.getConversations();
            // Convert service conversations to local format
            const localConversations: Conversation[] = response.data.map((conv: ServiceConversation) => ({
                id: conv.id,
                propertyId: conv.propertyId,
                propertyTitle: 'Property', // TODO: Get from property service
                propertyImage: undefined,
                otherUserId: conv.tenantId,
                otherUserName: 'User', // TODO: Get from user service
                lastMessage: conv.lastMessage?.content || '',
                timestamp: conv.updatedAt,
                unreadCount: conv.unreadCount,
                unread: conv.unreadCount > 0,
                hasActiveBooking: true, // TODO: Check from booking service
            }));
            setConversations(localConversations);
        } catch (error: any) {
            console.error('Error loading conversations:', error);
            // Fallback to empty state
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConversationPress = (conversation: Conversation) => {
        // Check if user has active booking
        if (!conversation.hasActiveBooking) {
            Alert.alert(
                'Booking Required',
                'You need an active booking to chat with this property owner. Would you like to book now?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Book Now',
                        onPress: () => navigation.navigate('PropertyDetail', {
                            propertyId: conversation.propertyId
                        })
                    }
                ]
            );
            return;
        }

        // Navigate to chat detail
        navigation.navigate('ChatDetail', {
            conversationId: conversation.id,
            propertyId: conversation.propertyId,
            otherUserId: conversation.otherUserId,
            otherUserName: conversation.otherUserName,
            hasActiveBooking: conversation.hasActiveBooking,
        });
    };

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="px-6 pt-16 pb-6">
                {/* Header */}
                <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                    Messages
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </Text>

                {/* Info Banner */}
                <View className="bg-blue-500/10 p-4 rounded-2xl mb-6 flex-row items-start">
                    <Ionicons name="information-circle" size={24} color="#3B82F6" />
                    <View className="flex-1 ml-3">
                        <Text className="text-blue-600 dark:text-blue-400 font-semibold mb-1">
                            Secure Messaging
                        </Text>
                        <Text className="text-blue-600/80 dark:text-blue-400/80 text-sm">
                            Chat is available after booking confirmation. This protects both tenants and landlords.
                        </Text>
                    </View>
                </View>

                {/* Empty State */}
                {conversations.length === 0 ? (
                    <View className="items-center justify-center px-8" style={{ marginTop: 60 }}>
                        {/* Icon */}
                        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                            }`}>
                            <Ionicons
                                name="chatbubbles-outline"
                                size={48}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        {/* Title */}
                        <Text className={`text-2xl font-bold mb-3 ${textColor}`}>
                            No Messages Yet
                        </Text>

                        {/* Description */}
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-center mb-6 leading-6">
                            Book a property to start chatting with owners. Your conversations will appear here.
                        </Text>

                        {/* CTA Button */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Home')}
                            className="bg-primary px-8 py-4 rounded-xl"
                        >
                            <Text className="text-white font-semibold text-base">
                                Browse Properties
                            </Text>
                        </TouchableOpacity>

                        {/* Features */}
                        <View className="mt-12 w-full">
                            <Text className={`text-sm font-semibold mb-4 ${textColor}`}>
                                Why book through our platform?
                            </Text>

                            <View className="gap-3">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center mr-3">
                                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                                    </View>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark flex-1">
                                        Secure payment protection
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                                        <Ionicons name="chatbubbles" size={16} color="#3B82F6" />
                                    </View>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark flex-1">
                                        Direct communication with owners
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                                        <Ionicons name="document-text" size={16} color="#8B5CF6" />
                                    </View>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark flex-1">
                                        Verified booking records
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                                        <Ionicons name="headset" size={16} color="#F59E0B" />
                                    </View>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark flex-1">
                                        24/7 customer support
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : (
                    /* Conversation List */
                    <View className="gap-3">
                        {conversations.map((conversation) => (
                            <TouchableOpacity
                                key={conversation.id}
                                onPress={() => handleConversationPress(conversation)}
                                className={`${cardBg} p-4 rounded-2xl flex-row`}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                {/* Avatar */}
                                <View className="mr-3">
                                    {conversation.otherUserAvatar ? (
                                        <Image
                                            source={{ uri: conversation.otherUserAvatar }}
                                            className="w-14 h-14 rounded-full"
                                        />
                                    ) : (
                                        <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center">
                                            <Ionicons name="person" size={28} color="#14B8A6" />
                                        </View>
                                    )}
                                    {conversation.unread && (
                                        <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                                    )}
                                    {conversation.hasActiveBooking && (
                                        <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 items-center justify-center">
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        </View>
                                    )}
                                </View>

                                {/* Content */}
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className={`font-bold text-base ${textColor}`}>
                                            {conversation.otherUserName}
                                        </Text>
                                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
                                            {conversation.timestamp}
                                        </Text>
                                    </View>

                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-2">
                                        📍 {conversation.propertyTitle}
                                    </Text>

                                    <Text
                                        className={`text-sm ${conversation.unread
                                            ? `font-semibold ${textColor}`
                                            : 'text-text-secondary-light dark:text-text-secondary-dark'
                                            }`}
                                        numberOfLines={1}
                                    >
                                        {conversation.lastMessage}
                                    </Text>

                                    {!conversation.hasActiveBooking && (
                                        <View className="mt-2 bg-orange-500/10 px-3 py-1.5 rounded-lg self-start">
                                            <Text className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                                                🔒 Book to unlock chat
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
