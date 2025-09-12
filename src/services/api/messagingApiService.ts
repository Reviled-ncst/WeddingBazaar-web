import type { Conversation, Message } from '../../pages/shared/messenger/types';

const API_BASE = '/api/messaging';

export interface MessagingApiResponse<T> {
  conversations?: T;
  messages?: T;
  message?: T;
  conversation?: T;
  success?: boolean;
  error?: string;
}

export class MessagingApiService {
  // Get all conversations for a vendor
  static async getConversations(vendorId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`${API_BASE}/conversations/${vendorId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }
      
      const data: MessagingApiResponse<Conversation[]> = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Create a new conversation
  static async createConversation(data: {
    conversationId: string;
    vendorId: string;
    vendorName: string;
    serviceName: string;
    userId: string;
    userName: string;
    userType: 'couple' | 'vendor' | 'admin';
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }
      
      const result: MessagingApiResponse<any> = await response.json();
      return result.conversation || result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get messages for a specific conversation
  static async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const response = await fetch(
        `${API_BASE}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      
      const data: MessagingApiResponse<Message[]> = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a new message
  static async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    senderName: string,
    senderType: 'couple' | 'vendor' | 'admin',
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<Message> {
    try {
      const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId,
          senderName,
          senderType,
          messageType
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
      
      const data: MessagingApiResponse<Message> = await response.json();
      
      if (!data.message) {
        throw new Error('No message returned from server');
      }
      
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark messages as read
  static async markAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.statusText}`);
      }
      
      const data: MessagingApiResponse<boolean> = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

export default MessagingApiService;
