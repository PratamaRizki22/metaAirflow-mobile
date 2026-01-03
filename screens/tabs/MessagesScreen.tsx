import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors } from '../../hooks';
import { TabBarBottomSpacer } from '../../components/common';
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
    unreadCount?: number;
    hasActiveBooking: boolean;
    bookingStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        // Today - show time
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (days < 7) {
        // This week - show day name
        return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    } else {
        // Older - show date
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

export function MessagesScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
            const conversationsData = response.data || [];
            const localConversations: Conversation[] = conversationsData.map((conv: ServiceConversation) => ({
                id: conv.id,
                propertyId: conv.propertyId,
                propertyTitle: 'Property',
                propertyImage: undefined,
                otherUserId: conv.tenantId,
                otherUserName: 'User',
                lastMessage: conv.lastMessage?.content || '',
                timestamp: conv.updatedAt,
                unreadCount: conv.unreadCount,
                unread: conv.unreadCount > 0,
                hasActiveBooking: true,
            }));
            setConversations(localConversations);
        } catch (error: any) {
            console.error('Error loading conversations:', error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConversationPress = (conversation: Conversation) => {
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

        navigation.navigate('ChatDetail', {
            conversationId: conversation.id,
            propertyId: conversation.propertyId,
            otherUserId: conversation.otherUserId,
            otherUserName: conversation.otherUserName,
            hasActiveBooking: conversation.hasActiveBooking,
        });
    };

    // Filter conversations
    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'unread' && conv.unread);
        return matchesSearch && matchesFilter;
    });

    return (
        <ScrollView className={`flex-1 ${bgColor}`}>
            <View className="px-6 pt-16 pb-6">
                {/* Header */}
                <Text className={`text-3xl font-bold mb-6 ${textColor}`} style={{ fontFamily: 'VisbyRound-Bold' }}>
                    Messages
                </Text>

                {/* Search Bar */}
                <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl px-4 py-3 mb-4`}>
                    <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    <TextInput
                        placeholder="Search all messages"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className={`flex-1 ml-2 ${textColor}`}
                        style={{ fontFamily: 'VisbyRound-Regular', fontSize: 14 }}
                    />
                </View>

                {/* Filter Tabs */}
                <View className="flex-row mb-6 gap-2">
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                    >
                        <Text className={`${filter === 'all' ? 'text-white' : textColor}`} style={{ fontFamily: 'VisbyRound-Medium', fontSize: 14 }}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                    >
                        <Text className={`${filter === 'unread' ? 'text-white' : textColor}`} style={{ fontFamily: 'VisbyRound-Medium', fontSize: 14 }}>
                            Unread
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Empty State */}
                {filteredConversations.length === 0 ? (
                    <View className="items-center justify-center px-8" style={{ marginTop: 60 }}>
                        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <Ionicons
                                name="chatbubbles-outline"
                                size={48}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <Text className={`text-2xl font-bold mb-3 ${textColor}`} style={{ fontFamily: 'VisbyRound-Bold' }}>
                            No Messages Yet
                        </Text>

                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-center mb-6 leading-6" style={{ fontFamily: 'VisbyRound-Regular' }}>
                            {filter === 'unread' ? 'No unread messages' : 'Book a property to start chatting with owners. Your conversations will appear here.'}
                        </Text>

                        {filter === 'all' && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Search')}
                                className="bg-primary px-8 py-4 rounded-xl"
                            >
                                <Text className="text-white font-semibold text-base" style={{ fontFamily: 'VisbyRound-Bold' }}>
                                    Browse Properties
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    /* Conversation List */
                    <View className="gap-3">
                        {filteredConversations.map((conversation) => (
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
                                </View>

                                {/* Content */}
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className={`font-bold text-base ${textColor}`} style={{ fontFamily: 'VisbyRound-Bold' }}>
                                            {conversation.otherUserName}
                                        </Text>
                                        <Text className="text-primary text-xs" style={{ fontFamily: 'VisbyRound-Medium' }}>
                                            {formatTime(conversation.timestamp)}
                                        </Text>
                                    </View>

                                    <Text
                                        className={`text-sm ${conversation.unread
                                            ? `font-semibold ${textColor}`
                                            : 'text-text-secondary-light dark:text-text-secondary-dark'
                                            }`}
                                        numberOfLines={1}
                                        style={{ fontFamily: conversation.unread ? 'VisbyRound-Medium' : 'VisbyRound-Regular' }}
                                    >
                                        {conversation.lastMessage}
                                    </Text>
                                </View>

                                {/* Unread Badge */}
                                {conversation.unread && conversation.unreadCount && conversation.unreadCount > 0 && (
                                    <View className="ml-2 bg-primary w-6 h-6 rounded-full items-center justify-center">
                                        <Text className="text-white text-xs font-bold" style={{ fontFamily: 'VisbyRound-Bold' }}>
                                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Bottom Padding */}
                <TabBarBottomSpacer />
            </View>
        </ScrollView>
    );
}
