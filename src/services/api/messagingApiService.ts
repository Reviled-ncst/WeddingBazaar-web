import type { Conversation, Message } from '../../pages/shared/messenger/types';

const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  return `${baseUrl}/api`;
};

const API_BASE = getApiBaseUrl();

export interface MessagingApiResponse<T> {
  conversations?: T;
  messages?: T;
  message?: T;
  conversation?: T;
  success?: boolean;
  error?: string;
}

export class MessagingApiService {
  // Helper method to handle API errors consistently
  private static silentMode = false;

  // Set silent mode to suppress error logging when fallbacks are available
  static setSilentMode(silent: boolean) {
    this.silentMode = silent;
  }

  private static handleApiError(error: any, operation: string): never {
    if (!this.silentMode) {
      console.error(`❌ ${operation} failed:`, error);
    }
    
    if (error.message?.includes('404')) {
      throw new Error(`Failed to ${operation.toLowerCase()}: `);
    }
    
    if (error.message?.includes('Failed to fetch')) {
      throw new Error(`Failed to ${operation.toLowerCase()}: `);
    }
    
    throw new Error(`Failed to ${operation.toLowerCase()}: `);
  }

  // Get all conversations for a user (vendor or individual)
  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const apiUrl = `${getApiBaseUrl()}/conversations/${userId}`;
      console.log('🔍 Fetching conversations from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      console.log('🔍 Conversations response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('404 - Conversations endpoint not found');
        }
        throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
      }
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Non-JSON response received:', contentType);
        throw new Error('Server configuration error. Please contact support.');
      }
      
      const data: any = await response.json();
      console.log('✅ Conversations data received:', data);
      
      // Backend returns {success: true, conversations: [...]}
      if (data.success && data.conversations) {
        return data.conversations;
      }
      
      return data.conversations || [];
    } catch (error) {
      return this.handleApiError(error, 'Get Conversations');
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
      const apiUrl = `${getApiBaseUrl()}/conversations`;
      console.log('📤 Creating conversation at:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('📤 Create conversation response status:', response.status);
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Non-JSON response received:', contentType);
        throw new Error('Server configuration error. Please contact support.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }
      
      const result: MessagingApiResponse<any> = await response.json();
      return result.conversation || result;
    } catch (error) {
      return this.handleApiError(error, 'Create Conversation');
    }
  }

  // Get messages for a specific conversation
  static async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const response = await fetch(
        `${API_BASE}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('404 - Messages endpoint not found');
        }
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      
      const data: any = await response.json();
      
      // Backend returns {success: true, messages: [...]}
      if (data.success && data.messages) {
        return data.messages;
      }
      
      return data.messages || [];
    } catch (error) {
      return this.handleApiError(error, 'Get Messages');
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
        if (response.status === 404) {
          throw new Error('404 - Send message endpoint not found');
        }
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
      
      const data: any = await response.json();
      
      // Backend returns {success: true, messageId: ..., conversationId: ..., timestamp: ...}
      // We need to construct a message object from the response
      if (data.success && data.messageId) {
        const message: Message = {
          id: data.messageId,
          conversationId: data.conversationId || conversationId,
          senderId,
          senderName,
          senderRole: senderType,
          content,
          timestamp: data.timestamp,
          type: messageType,
        };
        return message;
      }
      
      throw new Error('Failed to send message - invalid response from server');
    } catch (error) {
      return this.handleApiError(error, 'Send Message');
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
        if (response.status === 404) {
          throw new Error('404 - Mark as read endpoint not found');
        }
        throw new Error(`Failed to mark messages as read: ${response.statusText}`);
      }
      
      const data: MessagingApiResponse<boolean> = await response.json();
      return data.success || false;
    } catch (error) {
      return this.handleApiError(error, 'Mark As Read');
    }
  }
}

export default MessagingApiService;
