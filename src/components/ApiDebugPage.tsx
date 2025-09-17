import React from 'react';

export const ApiDebugPage: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com/api';
  
  React.useEffect(() => {
    console.log('🔍 Current API Base URL:', baseUrl);
    console.log('🔍 Environment variables:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });
  }, []);

  const testEndpoint = async (endpoint: string) => {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`🔄 Testing: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      console.log(`✅ ${endpoint}:`, { status: response.status, data });
    } catch (error) {
      console.error(`❌ ${endpoint}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
          <div className="space-y-2">
            <p><strong>API Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{baseUrl}</code></p>
            <p><strong>Environment:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{import.meta.env.MODE}</code></p>
            <p><strong>Development Mode:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{import.meta.env.DEV ? 'Yes' : 'No'}</code></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <p><strong>VITE_API_URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{import.meta.env.VITE_API_URL || 'Not set'}</code></p>
            <p><strong>NODE_ENV:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{import.meta.env.NODE_ENV || 'Not set'}</code></p>
            <p><strong>MODE:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{import.meta.env.MODE || 'Not set'}</code></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoint Tests</h2>
          <div className="space-y-3">
            <button
              onClick={() => testEndpoint('/health')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-3"
            >
              Test Health Endpoint
            </button>
            <button
              onClick={() => testEndpoint('/bookings/couple/1-2025-001')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-3"
            >
              Test Couple Bookings
            </button>
            <button
              onClick={() => testEndpoint('/vendors/featured')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Test Featured Vendors
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600">Check the browser console for test results.</p>
        </div>
      </div>
    </div>
  );
};
