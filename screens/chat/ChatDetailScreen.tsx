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
}

interface ChatDetailScreenProps {
    route: {
        params: {
            conversationId: string;
            propertyId: string;
            otherUserId: string;
            otherUserName: string;
            hasActiveBooking: boolean;
        };
    };
    navigation: any;
}

export default function ChatDetailScreen({ route, navigation }: any) {
    const { conversationId, propertyId, otherUserId, otherUserName, hasActiveBooking } = route.params;
    const { isDark } = useTheme();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sentMessagesCount, setSentMessagesCount] = useState(0);

    const flatListRef = useRef<FlatList>(null);

    const bgColor = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#F1F5F9' : '#1E293B';
    const inputBg = isDark ? '#334155' : '#F8FAFC';

    const MAX_PRE_BOOKING_MESSAGES = 3;

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await messageService.getMessages(conversationId);
            // Convert service messages to local format
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
            // Fallback to empty state
            setMessages([]);
            setSentMessagesCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        // Check if user can send message
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

        // Validate message content
        const validation = validateMessage(inputText);

        if (!validation.isAllowed) {
            Alert.alert(
                'Message Blocked',
                validation.reason,
                [{ text: 'OK' }]
            );
            return;
        }

        // Show warning if message was censored
        if (validation.flagged && validation.censoredMessage) {
            Alert.alert(
                'Message Modified',
                'Contact information has been censored for your safety. We recommend using our secure booking system.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Send Anyway',
                        onPress: () => sendMessage(validation.censoredMessage!),
                    }
                ]
            );
            return;
        }

        if (validation.flagged) {
            // Log suspicious message for admin review
            console.warn('[FLAGGED MESSAGE]', {
                userId: user?.id,
                conversationId,
                message: inputText,
            });
        }

        await sendMessage(inputText);
    };

    const sendMessage = async (text: string) => {
        try {
            setSending(true);
            await messageService.sendMessage(conversationId, text);

            // Reload messages to get the new one
            await loadMessages();
            setInputText('');

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.senderId === user?.id;

        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                    paddingHorizontal: 16,
                }}
            >
                <View
                    style={{
                        maxWidth: '75%',
                        backgroundColor: isMe ? '#00D9A3' : (isDark ? '#334155' : '#F1F5F9'),
                        borderRadius: 16,
                        padding: 12,
                    }}
                >
                    <Text
                        style={{
                            color: isMe ? '#FFFFFF' : textColor,
                            fontSize: 15,
                        }}
                    >
                        {item.text}
                    </Text>
                    {item.censored && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="warning" size={11} color={isMe ? '#FFFFFF' : '#9CA3AF'} />
                            <Text style={{ color: isMe ? '#FFFFFF' : '#9CA3AF', fontSize: 11, marginLeft: 4 }}>
                                Message was modified for safety
                            </Text>
                        </View>
                    )}
                    <Text
                        style={{
                            color: isMe ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                            fontSize: 11,
                            marginTop: 4,
                        }}
                    >
                        {new Date(item.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    const remainingMessages = getRemainingMessages(sentMessagesCount, MAX_PRE_BOOKING_MESSAGES);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: bgColor }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Header */}
            <View
                style={{
                    paddingTop: 60,
                    paddingBottom: 16,
                    paddingHorizontal: 16,
                    backgroundColor: isDark ? '#334155' : '#F8FAFC',
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#475569' : '#E2E8F0',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                        <Ionicons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
                            {otherUserName}
                        </Text>
                        {!hasActiveBooking && remainingMessages > 0 && (
                            <Text style={{ fontSize: 12, color: '#F59E0B', marginTop: 2 }}>
                                {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining • Book to unlock
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Warning Banner for Pre-Booking */}
            {!hasActiveBooking && (
                <View style={{ backgroundColor: '#FEF3C7', padding: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="warning" size={20} color="#F59E0B" />
                    <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#92400E' }}>
                        Limited chat. Book this property for unlimited messaging & secure payment.
                    </Text>
                </View>
            )}

            {/* Messages List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                            <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 16 }}>
                                No messages yet
                            </Text>
                            <Text style={{ color: '#9CA3AF', marginTop: 8, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>
                                Start the conversation! {!hasActiveBooking && `You have ${remainingMessages} messages before booking.`}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Input Area */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: isDark ? '#334155' : '#F8FAFC',
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#475569' : '#E2E8F0',
                }}
            >
                <TextInput
                    style={{
                        flex: 1,
                        backgroundColor: inputBg,
                        borderRadius: 24,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        marginRight: 12,
                        color: textColor,
                        fontSize: 15,
                    }}
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
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: inputText.trim() ? '#00D9A3' : '#9CA3AF',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
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
