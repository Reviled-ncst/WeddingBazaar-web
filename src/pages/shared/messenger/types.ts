export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName?: string;
  senderRole?: 'couple' | 'vendor' | 'admin';
  content: string;
  timestamp: string | Date; // API returns string, but we might convert to Date
  type?: 'text' | 'image' | 'file';
  attachments?: Array<{url: string, fileName: string, fileType: string, fileSize: number}>;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participants?: {
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
  serviceInfo?: {
    id?: string;
    name?: string;
    category?: string;
    price?: string;
    image?: string;
    description?: string;
  };
  // Backend API format support
  creator_id?: string;
  creator_name?: string;
  creator_first_name?: string;
  creator_last_name?: string;
  creator_email?: string;
  creator_type?: 'couple' | 'vendor' | 'admin';
  participant_id?: string;
  participant_name?: string;
  participant_first_name?: string;
  participant_last_name?: string;
  participant_email?: string;
  participant_type?: 'couple' | 'vendor' | 'admin';
  service_name?: string;
  business_name?: string;
  vendor_business_name?: string;
}

export interface MessengerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
}
