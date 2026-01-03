import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { messageService, Message as ServiceMessage } from '../../services';
import {
    validateMessage,
    canSendMessage,
    getRemainingMessages,
} from '../../utils/chatSecurity';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    censored?: boolean;
    type?: 'text' | 'property_card';
    propertyData?: {
        title: string;
        image: string;
        price: number;
        invoiceNumber: string;
    };
}

interface ChatDetailScreenProps {
    route: {
        params: {
            conversationId: string;
            propertyId: string;
            otherUserId: string;
            otherUserName: string;
            otherUserAvatar?: string;
            hasActiveBooking: boolean;
        };
    };
    navigation: any;
}

const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function ChatDetailScreen({ route, navigation }: any) {
    const { conversationId, propertyId, otherUserId, otherUserName, otherUserAvatar, hasActiveBooking } = route.params;
    const { isDark } = useTheme();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sentMessagesCount, setSentMessagesCount] = useState(0);

    const flatListRef = useRef<FlatList>(null);

    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';
    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const cardBg = isDark ? 'bg-surface-dark' : 'bg-surface-light';

    const MAX_PRE_BOOKING_MESSAGES = 3;

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await messageService.getMessages(conversationId);
            const localMessages: Message[] = response.data.messages.map((msg: ServiceMessage) => ({
                id: msg.id,
                senderId: msg.senderId,
                text: msg.content,
                timestamp: msg.createdAt,
            }));
            setMessages(localMessages);
            setSentMessagesCount(response.data.sentCount);
        } catch (error: any) {
            console.error('Error loading messages:', error);
            setMessages([]);
            setSentMessagesCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const sendCheck = canSendMessage(hasActiveBooking, sentMessagesCount, MAX_PRE_BOOKING_MESSAGES);

        if (!sendCheck.canSend) {
            Alert.alert(
                'Message Limit Reached',
                sendCheck.reason,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Book Now',
                        onPress: () => navigation.navigate('PropertyDetail', { propertyId })
                    }
                ]
            );
            return;
        }

        const validation = validateMessage(inputText);

        if (!validation.isAllowed) {
            Alert.alert('Message Blocked', validation.reason, [{ text: 'OK' }]);
            return;
        }

        if (validation.flagged && validation.censoredMessage) {
            Alert.alert(
                'Message Modified',
                'Contact information has been censored for your safety.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send Anyway', onPress: () => sendMessage(validation.censoredMessage!) }
                ]
            );
            return;
        }

        await sendMessage(inputText);
    };

    const sendMessage = async (text: string) => {
        try {
            setSending(true);
            await messageService.sendMessage(conversationId, text);
            await loadMessages();
            setInputText('');
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const renderDateSeparator = (date: string) => (
        <View className="items-center my-4">
            <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} px-4 py-2 rounded-full`}>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs" style={{ fontFamily: 'VisbyRound-Regular' }}>
                    {date}
                </Text>
            </View>
        </View>
    );

    const renderPropertyCard = (propertyData: any) => (
        <View className={`${cardBg} rounded-2xl p-3 mb-2 mx-4`} style={{ maxWidth: '80%' }}>
            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-2" style={{ fontFamily: 'VisbyRound-Regular' }}>
                You asked about this property
            </Text>
            <View className="flex-row">
                {propertyData.image && (
                    <Image
                        source={{ uri: propertyData.image }}
                        className="w-20 h-20 rounded-xl mr-3"
                    />
                )}
                <View className="flex-1">
                    <Text className={`font-bold text-sm mb-1 ${textColor}`} style={{ fontFamily: 'VisbyRound-Bold' }}>
                        {propertyData.title}
                    </Text>
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1" style={{ fontFamily: 'VisbyRound-Regular' }}>
                        RM {propertyData.price?.toLocaleString()}/Month
                    </Text>
                    <Text className="text-primary text-xs" style={{ fontFamily: 'VisbyRound-Medium' }}>
                        Completed
                    </Text>
                </View>
            </View>
            {propertyData.invoiceNumber && (
                <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex-row items-center">
                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs flex-1" style={{ fontFamily: 'VisbyRound-Regular' }}>
                        No Invoice: {propertyData.invoiceNumber}
                    </Text>
                    <TouchableOpacity>
                        <Ionicons name="copy-outline" size={16} color="#00D9A3" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMe = item.senderId === user?.id;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateSeparator = !prevMessage || formatMessageDate(item.timestamp) !== formatMessageDate(prevMessage.timestamp);

        return (
            <>
                {showDateSeparator && renderDateSeparator(formatMessageDate(item.timestamp))}

                {item.type === 'property_card' && item.propertyData ? (
                    renderPropertyCard(item.propertyData)
                ) : (
                    <View
                        className={`flex-row ${isMe ? 'justify-end' : 'justify-start'} mb-3 px-4`}
                    >
                        <View
                            className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-gray-100'
                                }`}
                        >
                            <Text
                                className={`text-sm ${isMe ? 'text-white' : textColor}`}
                                style={{ fontFamily: 'VisbyRound-Regular' }}
                            >
                                {item.text}
                            </Text>
                            <Text
                                className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-text-secondary-light dark:text-text-secondary-dark'
                                    }`}
                                style={{ fontFamily: 'VisbyRound-Regular' }}
                            >
                                {formatMessageTime(item.timestamp)}
                            </Text>
                        </View>
                    </View>
                )}
            </>
        );
    };

    return (
        <KeyboardAvoidingView
            className={`flex-1 ${bgColor}`}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Header */}
            <View className={`pt-14 pb-4 px-4 ${cardBg} border-b border-gray-200 dark:border-gray-700`}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
                        </TouchableOpacity>

                        {otherUserAvatar ? (
                            <Image
                                source={{ uri: otherUserAvatar }}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        ) : (
                            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                                <Ionicons name="person" size={20} color="#14B8A6" />
                            </View>
                        )}

                        <Text className={`text-lg font-bold ${textColor}`} style={{ fontFamily: 'VisbyRound-Bold' }}>
                            {otherUserName}
                        </Text>
                    </View>

                    <TouchableOpacity>
                        <Ionicons name="ellipsis-vertical" size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00D9A3" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    ListEmptyComponent={
                        <View className="items-center py-10">
                            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-4 text-base" style={{ fontFamily: 'VisbyRound-Medium' }}>
                                No messages yet
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Input Area */}
            <View className={`flex-row items-center p-4 ${cardBg} border-t border-gray-200 dark:border-gray-700`}>
                <TextInput
                    className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full px-4 py-3 mr-3 ${textColor}`}
                    style={{ fontFamily: 'VisbyRound-Regular', fontSize: 14 }}
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={sending || !inputText.trim()}
                    className={`w-12 h-12 rounded-full items-center justify-center ${inputText.trim() ? 'bg-primary' : 'bg-gray-400'
                        }`}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
