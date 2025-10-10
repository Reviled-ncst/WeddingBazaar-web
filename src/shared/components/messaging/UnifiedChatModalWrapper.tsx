import React from 'react';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { UnifiedChatModal } from './UnifiedChatModal';

export const UnifiedChatModalWrapper: React.FC = () => {
  const { 
    isModalOpen, 
    setModalOpen, 
    activeConversation, 
    messages, 
    sendMessage,
    conversations
  } = useUnifiedMessaging();

  const handleSendMessage = async (message: string) => {
    if (activeConversation?.id) {
      try {
        await sendMessage(activeConversation.id, message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  // Get participant name from active conversation
  const getParticipantName = () => {
    if (activeConversation) {
      // Get the other participant (not the current user)
      const otherParticipantId = activeConversation.participants.find(p => p !== activeConversation.id);
      return activeConversation.participantNames?.[otherParticipantId || ''] || 'Vendor';
    }
    
    // Fallback: get from the most recent conversation
    if (conversations.length > 0) {
      const recentConv = conversations[0];
      const participantNames = Object.values(recentConv.participantNames);
      return participantNames[0] || 'Vendor';
    }
    
    return 'Vendor';
  };

  // Convert messages to modal format
  const formatMessages = () => {
    return messages.map(msg => ({
      content: msg.content,
      isFromUser: msg.senderType === 'individual',
      timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
  };

  return (
    <UnifiedChatModal
      isOpen={isModalOpen}
      onClose={handleClose}
      activeConversation={activeConversation}
      messages={formatMessages()}
      onSendMessage={handleSendMessage}
      participantName={getParticipantName()}
    />
  );
};

export default UnifiedChatModalWrapper;
