import api from './api';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: 'text' | 'image' | 'system';
    createdAt: string;
    readAt?: string;
}

export interface Conversation {
    id: string;
    propertyId: string;
    tenantId: string;
    landlordId: string;
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

class MessageService {
    /**
     * Get all conversations for current user
     */
    async getConversations(): Promise<{ success: boolean; data: Conversation[] }> {
        try {
            const response = await api.get('/v1/m/conversations');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get conversations');
        }
    }

    /**
     * Get messages in a conversation
     */
    async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<{ success: boolean; data: { messages: Message[]; sentCount: number } }> {
        try {
            const response = await api.get(`/v1/m/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get messages');
        }
    }

    /**
     * Send a message
     */
    async sendMessage(conversationId: string, content: string, type: 'text' | 'image' = 'text'): Promise<{ success: boolean; data: Message }> {
        try {
            const response = await api.post(`/v1/m/conversations/${conversationId}/messages`, {
                content,
                type
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to send message');
        }
    }

    /**
     * Create or get conversation between tenant and landlord for a property
     */
    async createConversation(propertyId: string): Promise<{ success: boolean; data: Conversation }> {
        try {
            const response = await api.post('/v1/m/conversations', { propertyId });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create conversation');
        }
    }

    /**
     * Mark messages as read
     */
    async markAsRead(conversationId: string): Promise<{ success: boolean }> {
        try {
            const response = await api.patch(`/v1/m/conversations/${conversationId}/read`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to mark as read');
        }
    }
}

export default new MessageService();
