// TEMPORARY: Simplified booking service for debugging
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

export class SimpleBookingService {
  static async getCoupleBookings(userId: string) {
    console.log('🧪 [SimpleBookingService] Fetching bookings for user:', userId);
    
    const url = `${API_BASE_URL}/api/bookings/enhanced?coupleId=${userId}&page=1&limit=50&sortBy=created_at&sortOrder=desc`;
    console.log('🌐 [SimpleBookingService] URL:', url);
    
    try {
      // Simple fetch without complex timeout logic
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 [SimpleBookingService] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ [SimpleBookingService] Success! Bookings:', data.bookings?.length);
      console.log('🔍 [SimpleBookingService] Response structure:', {
        success: data.success,
        count: data.count,
        bookingsArray: Array.isArray(data.bookings)
      });
      
      return data;
      
    } catch (error) {
      console.error('❌ [SimpleBookingService] Error:', error);
      throw error;
    }
  }
}

// Export as window global for testing
if (typeof window !== 'undefined') {
  (window as any).SimpleBookingService = SimpleBookingService;
}
