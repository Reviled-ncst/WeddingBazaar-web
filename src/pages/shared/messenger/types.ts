export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'couple' | 'vendor' | 'admin';
  content: string;
  timestamp: string | Date; // API returns string, but we might convert to Date
  type: 'text' | 'image' | 'file';
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: 'couple' | 'vendor' | 'admin';
    avatar?: string;
    isOnline: boolean;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt?: string | Date; // API returns string
  updatedAt?: string | Date; // API returns string
}

export interface MessengerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
}
