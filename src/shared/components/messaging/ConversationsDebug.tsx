// Create a debug component to show conversation data structure
import React, { useEffect, useState } from 'react';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { useAuth } from '../../contexts/HybridAuthContext';

export const ConversationsDebug: React.FC = () => {
  const { user } = useAuth();
  const { conversations, loadConversations } = useUnifiedMessaging();
  const [rawApiData, setRawApiData] = useState<any>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const fetchRawData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`https://weddingbazaar-web.onrender.com/api/conversations/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const data = await response.json();
      setRawApiData(data);
    } catch (error) {
      console.error('Failed to fetch raw data:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔍 Conversations Debug</h3>
      
      <div className="mb-4">
        <p><strong>Current User:</strong> {user?.id} ({user?.role})</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>
      
      <button 
        onClick={fetchRawData}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Fetch Raw API Data
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Context Conversations ({conversations.length})</h4>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-60">
            {JSON.stringify(conversations, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold">Raw API Response</h4>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-60">
            {rawApiData ? JSON.stringify(rawApiData, null, 2) : 'Click "Fetch Raw API Data"'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ConversationsDebug;
