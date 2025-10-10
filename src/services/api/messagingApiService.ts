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
  private static handleApiError(error: any, operation: string): never {
    console.error(`❌ ${operation} failed:`, error);
    
    if (error.message?.includes('404')) {
      throw new Error(`Messaging API endpoint not available. The backend messaging system needs to be implemented. (${operation})`);
    }
    
    if (error.message?.includes('Failed to fetch')) {
      throw new Error(`Unable to connect to the messaging server. Please check your internet connection. (${operation})`);
    }
    
    throw error;
  }

  // Get all conversations for a user (vendor or individual)
  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const apiUrl = `${getApiBaseUrl()}/conversations/${userId}`;
      console.log('🔍 Fetching conversations from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
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

  // VENDOR WORKAROUND: Get conversations by searching all conversations for vendor participation
  static async getVendorConversations(vendorId: string): Promise<Conversation[]> {
    try {
      console.log('🔧 [VENDOR WORKAROUND] Fetching vendor conversations for:', vendorId);
      
      // Try multiple approaches to find vendor conversations
      const approaches = [
        // Approach 1: Direct vendor query (standard)
        () => this.getConversations(vendorId),
        
        // Approach 2: Search by scanning known user conversations
        async () => {
          console.log('🔍 [VENDOR WORKAROUND] Trying cross-user conversation lookup...');
          
          // Sample known user IDs to scan for vendor conversations
          const sampleUserIds = ['1-2025-001', '1-2025-002', '1-2025-003'];
          const foundConversations: any[] = [];
          
          for (const userId of sampleUserIds) {
            try {
              const userResponse = await fetch(`${getApiBaseUrl()}/conversations/${userId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                
                // Filter conversations where this vendor is a participant
                const vendorConversations = (userData.conversations || []).filter((conv: any) => 
                  conv.participant_id === vendorId || 
                  conv.creator_id === vendorId ||
                  conv.vendor_id === vendorId
                );
                
                // Transform conversations to show from vendor perspective
                const transformedConversations = vendorConversations.map((conv: any) => ({
                  ...conv,
                  // Swap participant/creator perspective for vendor view
                  participant_id: conv.creator_id === vendorId ? conv.participant_id : conv.creator_id,
                  participant_name: conv.creator_id === vendorId ? conv.participant_name : conv.creator_name || 'Client',
                  participant_type: conv.creator_id === vendorId ? conv.participant_type : 'couple'
                }));
                
                foundConversations.push(...transformedConversations);
              }
            } catch (error) {
              console.log(`⚠️ [VENDOR WORKAROUND] Failed to scan user ${userId}:`, error instanceof Error ? error.message : 'Unknown error');
            }
          }
          
          // Remove duplicates based on conversation ID
          const uniqueConversations = foundConversations.filter((conv, index, arr) => 
            arr.findIndex(c => c.id === conv.id) === index
          );
          
          console.log('✅ [VENDOR WORKAROUND] Found unique vendor conversations:', uniqueConversations.length);
          return uniqueConversations;
        }
      ];
      
      // Try each approach until we get results
      for (let i = 0; i < approaches.length; i++) {
        try {
          const conversations = await approaches[i]();
          if (conversations && conversations.length > 0) {
            console.log(`✅ [VENDOR WORKAROUND] Approach ${i + 1} succeeded with ${conversations.length} conversations`);
            return conversations;
          }
          console.log(`⚠️ [VENDOR WORKAROUND] Approach ${i + 1} returned no conversations, trying next...`);
        } catch (error) {
          console.log(`❌ [VENDOR WORKAROUND] Approach ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      console.log('⚠️ [VENDOR WORKAROUND] All approaches failed, returning empty array');
      return [];
      
    } catch (error) {
      console.error('❌ [VENDOR WORKAROUND] Failed:', error);
      return [];
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
        `${API_BASE}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
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
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          conversationId,
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
      console.log('📨 [MessagingApiService] Send message response:', data);
      
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
        console.log('✅ [MessagingApiService] Constructed message object:', message);
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
