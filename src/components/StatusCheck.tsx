import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusItem {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  details?: string;
}

export const StatusCheck: React.FC = () => {
  const [statusItems, setStatusItems] = useState<StatusItem[]>([
    { name: 'Backend Health', status: 'loading', message: 'Checking...' },
    { name: 'Database Connection', status: 'loading', message: 'Checking...' },
    { name: 'Featured Vendors API', status: 'loading', message: 'Checking...' },
    { name: 'Authentication API', status: 'loading', message: 'Checking...' },
    { name: 'Ping Endpoint', status: 'loading', message: 'Checking...' },
  ]);

  useEffect(() => {
    const checkStatus = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      
      // Check backend health
      try {
        const healthResponse = await fetch(`${apiBaseUrl}/api/health`);
        const healthData = await healthResponse.json();
        
        setStatusItems(prev => prev.map(item => 
          item.name === 'Backend Health' 
            ? { 
                ...item, 
                status: 'success', 
                message: `OK - Version ${healthData.version}`,
                details: `Uptime: ${Math.floor(healthData.uptime / 60)} minutes`
              }
            : item
        ));

        setStatusItems(prev => prev.map(item => 
          item.name === 'Database Connection' 
            ? { 
                ...item, 
                status: healthData.database === 'Connected' ? 'success' : 'error', 
                message: healthData.database,
                details: `Conversations: ${healthData.databaseStats.conversations}, Messages: ${healthData.databaseStats.messages}`
              }
            : item
        ));
      } catch (error) {
        setStatusItems(prev => prev.map(item => 
          item.name === 'Backend Health' 
            ? { ...item, status: 'error', message: 'Backend not responding' }
            : item
        ));
      }

      // Check featured vendors API
      try {
        const vendorsResponse = await fetch(`${apiBaseUrl}/api/vendors/featured`);
        const vendorsData = await vendorsResponse.json();
        
        setStatusItems(prev => prev.map(item => 
          item.name === 'Featured Vendors API' 
            ? { 
                ...item, 
                status: vendorsData.success ? 'success' : 'error', 
                message: vendorsData.success ? `OK - ${vendorsData.vendors.length} vendors` : 'Failed',
                details: vendorsData.vendors ? `Sample: ${vendorsData.vendors[0]?.name}` : ''
              }
            : item
        ));
      } catch (error) {
        setStatusItems(prev => prev.map(item => 
          item.name === 'Featured Vendors API' 
            ? { ...item, status: 'error', message: 'API not responding' }
            : item
        ));
      }

      // Check ping endpoint
      try {
        const pingResponse = await fetch(`${apiBaseUrl}/api/ping`);
        const pingData = await pingResponse.json();
        
        setStatusItems(prev => prev.map(item => 
          item.name === 'Ping Endpoint' 
            ? { 
                ...item, 
                status: pingData.success ? 'success' : 'error', 
                message: pingData.message || 'OK'
              }
            : item
        ));
      } catch (error) {
        setStatusItems(prev => prev.map(item => 
          item.name === 'Ping Endpoint' 
            ? { ...item, status: 'error', message: 'Endpoint not responding' }
            : item
        ));
      }

      // Check auth verify endpoint (this one might not exist)
      try {
        const token = localStorage.getItem('auth_token') || 'test-token';
        const authResponse = await fetch(`${apiBaseUrl}/api/auth/verify`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token })
        });
        
        if (authResponse.status === 404) {
          setStatusItems(prev => prev.map(item => 
            item.name === 'Authentication API' 
              ? { ...item, status: 'error', message: 'Verify endpoint not found', details: 'Using token validation instead' }
              : item
          ));
        } else {
          const authData = await authResponse.json();
          setStatusItems(prev => prev.map(item => 
            item.name === 'Authentication API' 
              ? { 
                  ...item, 
                  status: authData.success ? 'success' : 'error', 
                  message: authData.success ? 'Working' : 'Auth failed'
                }
              : item
          ));
        }
      } catch (error) {
        setStatusItems(prev => prev.map(item => 
          item.name === 'Authentication API' 
            ? { ...item, status: 'error', message: 'Auth API not responding' }
            : item
        ));
      }
    };

    checkStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const overallStatus = statusItems.every(item => item.status === 'success') ? 'success' : 
                       statusItems.some(item => item.status === 'error') ? 'error' : 'loading';

  return (
    <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 max-w-md z-50">
      <div className="flex items-center gap-3 mb-4">
        {getStatusIcon(overallStatus)}
        <h3 className="font-bold text-lg">System Status</h3>
      </div>
      
      <div className="space-y-3">
        {statusItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            {getStatusIcon(item.status)}
            <div className="flex-1">
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-gray-600">{item.message}</div>
              {item.details && (
                <div className="text-xs text-gray-500 mt-1">{item.details}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        API: {import.meta.env.VITE_API_URL || 'Default'}
      </div>
    </div>
  );
};
