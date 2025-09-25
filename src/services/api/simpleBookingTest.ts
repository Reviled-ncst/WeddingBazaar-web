// Simple booking test service for debugging
// This bypasses the complex bookingApiService and tests the fetch directly

export const simpleBookingTest = async (request: any, userId: string) => {
  console.log('🔥 [SimpleBookingTest] Starting simple booking test...');
  console.log('🔥 [SimpleBookingTest] Request:', request);
  console.log('🔥 [SimpleBookingTest] User ID:', userId);
  
  const API_URL = 'https://weddingbazaar-web.onrender.com';
  
  try {
    console.log('🔥 [SimpleBookingTest] About to fetch...');
    
    const startTime = Date.now();
    
    const response = await fetch(`${API_URL}/api/bookings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify(request)
    });
    
    const endTime = Date.now();
    console.log(`🔥 [SimpleBookingTest] Fetch completed in ${endTime - startTime}ms`);
    console.log('🔥 [SimpleBookingTest] Response status:', response.status);
    console.log('🔥 [SimpleBookingTest] Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('🔥 [SimpleBookingTest] Response text:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('🔥 [SimpleBookingTest] SUCCESS! Parsed data:', data);
      return data.data; // Return the booking data
    } else {
      console.error('🔥 [SimpleBookingTest] ERROR! Response not ok');
      throw new Error(`Request failed: ${response.status} - ${responseText}`);
    }
    
  } catch (error) {
    console.error('🔥 [SimpleBookingTest] CATCH! Error:', error);
    throw error;
  }
};
