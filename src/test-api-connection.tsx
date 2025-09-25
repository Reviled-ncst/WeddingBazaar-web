// Temporary test component to verify API connection
import { useEffect, useState } from 'react';

const TestApiConnection = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [bookingsData, setBookingsData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    setApiUrl(baseUrl);

    // Test the bookings API
    const testApi = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/bookings?vendorId=2-2025-003`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBookingsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API Connection Test</h2>
      <p><strong>API URL:</strong> {apiUrl}</p>
      
      {error && (
        <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', marginBottom: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {bookingsData && (
        <div style={{ background: '#e6ffe6', padding: '10px' }}>
          <h3>API Response:</h3>
          <p><strong>Success:</strong> {bookingsData.success ? 'true' : 'false'}</p>
          <p><strong>Total Bookings:</strong> {bookingsData.data?.total || 0}</p>
          <p><strong>Bookings Array Length:</strong> {bookingsData.data?.bookings?.length || 0}</p>
          
          {bookingsData.data?.bookings?.length > 0 && (
            <div>
              <h4>First Booking:</h4>
              <pre>{JSON.stringify(bookingsData.data.bookings[0], null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestApiConnection;
