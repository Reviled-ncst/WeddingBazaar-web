// Messaging Modal Types
export interface VendorInfo {
  id: string;
  name: string;
  businessName?: string;
  image?: string;
  email?: string;
  phone?: string;
  website?: string;
  category?: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
}

export interface OpenModalParams {
  vendorId: string;
  vendorName: string;
  vendorInfo?: Partial<VendorInfo>;
  serviceName?: string;
  serviceCategory?: string;
  serviceInfo?: Partial<ServiceInfo>;
}

export interface MessagingModalMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'vendor' | 'couple' | 'admin'; // Match UnifiedMessage type
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  attachments?: string[];
}

export interface MessagingModalConversation {
  id: string;
  vendorId: string;
  vendorName: string;
  serviceName?: string;
  serviceCategory?: string;
  lastMessage?: MessagingModalMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessagingModalState {
  isOpen: boolean;
  loading: boolean;
  sending: boolean;
  error: string | null;
  conversationId: string | null;
  vendorInfo: VendorInfo | null;
  serviceInfo: ServiceInfo | null;
  messages: MessagingModalMessage[];
}

export interface MessagingModalActions {
  openModal: (params: OpenModalParams) => Promise<void>;
  closeModal: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

export type MessagingModalContextType = MessagingModalState & MessagingModalActions;

// Quick start message templates
export interface QuickStartMessage {
  id: string;
  text: string;
  category: 'general' | 'pricing' | 'availability' | 'packages';
}

export const QUICK_START_MESSAGES: QuickStartMessage[] = [
  { id: '1', text: "Tell me about your packages", category: 'packages' },
  { id: '2', text: "What's your availability for my wedding date?", category: 'availability' },
  { id: '3', text: "Can you send me a detailed quote?", category: 'pricing' },
  { id: '4', text: "I'd like to schedule a consultation", category: 'general' },
  { id: '5', text: "What's included in your basic package?", category: 'packages' },
  { id: '6', text: "Do you offer customizable packages?", category: 'packages' }
];
