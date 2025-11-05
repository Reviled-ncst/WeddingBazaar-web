/**
 * Vendor Notification Service
 * Handles fetching and managing real vendor notifications from the backend
 */

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface VendorNotification {
  id: string;
  type: 'booking_inquiry' | 'message_received' | 'payment_received' | 'booking_confirmed' | 'quote_accepted' | 'quote_rejected' | 'booking_cancelled' | 'review_received';
  title: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  bookingId?: string;
  coupleId?: string;
  read: boolean;
  actionRequired?: boolean;
  metadata?: any; // Additional data specific to notification type
}

export interface NotificationResponse {
  success: boolean;
  notifications: VendorNotification[];
  count: number;
  unreadCount: number;
  timestamp: string;
}

class VendorNotificationService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_BASE_URL;
  }

  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Fetch notifications for a specific vendor
   */
  async getVendorNotifications(vendorId: string): Promise<NotificationResponse> {
    try {
      console.log('🔔 [NotificationService] Fetching notifications for vendor:', vendorId);
      
      const response = await fetch(`${this.apiUrl}/api/notifications/vendor/${vendorId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        console.error('❌ [NotificationService] API error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [NotificationService] Received notifications:', data);
      
      // Map notifications to match frontend interface
      const mappedNotifications: VendorNotification[] = (data.notifications || []).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        type: this.mapNotificationType(n.type as string),
        title: n.title as string,
        message: n.message as string,
        timestamp: (n.created_at || n.timestamp) as string,
        priority: this.determinePriority(n.type as string),
        bookingId: (n.booking_id || (n.metadata as Record<string, unknown>)?.bookingId) as string | undefined,
        coupleId: (n.couple_id || (n.metadata as Record<string, unknown>)?.coupleId) as string | undefined,
        read: (n.is_read || n.read || false) as boolean,
        actionRequired: (n.type === 'booking' || (n.action_url as string)?.includes('bookings')) as boolean,
        metadata: (n.metadata || {}) as Record<string, unknown>
      }));
      
      return {
        success: data.success || true,
        notifications: mappedNotifications,
        count: mappedNotifications.length,
        unreadCount: mappedNotifications.filter(n => !n.read).length,
        timestamp: data.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('💥 [NotificationService] Error fetching notifications:', error);
      
      // Return empty notifications instead of mock data
      return {
        success: false,
        notifications: [],
        count: 0,
        unreadCount: 0,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Map database notification type to frontend type
   */
  private mapNotificationType(dbType: string): VendorNotification['type'] {
    const typeMap: Record<string, VendorNotification['type']> = {
      'booking': 'booking_inquiry',
      'message': 'message_received',
      'payment': 'payment_received',
      'confirmed': 'booking_confirmed',
      'quote_accept': 'quote_accepted',
      'quote_reject': 'quote_rejected',
      'cancelled': 'booking_cancelled',
      'review': 'review_received'
    };
    
    return typeMap[dbType] || 'booking_inquiry';
  }
  
  /**
   * Determine notification priority based on type
   */
  private determinePriority(type: string): 'high' | 'medium' | 'low' {
    const highPriority = ['booking', 'payment', 'quote_accept'];
    const lowPriority = ['review', 'profile'];
    
    if (highPriority.includes(type)) return 'high';
    if (lowPriority.includes(type)) return 'low';
    return 'medium';
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || true;
    } catch (error) {
      console.error('💥 [NotificationService] Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a vendor
   */
  async markAllAsRead(vendorId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/notifications/vendor/${vendorId}/read-all`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || true;
    } catch (error) {
      console.error('💥 [NotificationService] Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Generate real notifications based on booking events
   */
  async generateBookingNotification(bookingData: {
    bookingId: string;
    vendorId: string;
    eventType: 'new_inquiry' | 'quote_accepted' | 'payment_received' | 'booking_confirmed' | 'review_received';
    coupleName?: string;
    amount?: number;
    message?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/notifications/generate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || true;
    } catch (error) {
      console.error('💥 [NotificationService] Error generating notification:', error);
      return false;
    }
  }



  /**
   * Subscribe to real-time notification updates (WebSocket)
   */
  subscribeToNotifications(vendorId: string, callback: (notification: VendorNotification) => void): () => void {
    // In a real implementation, this would set up WebSocket connection
    // For now, simulate with periodic polling
    const pollInterval = setInterval(async () => {
      try {
        const response = await this.getVendorNotifications(vendorId);
        if (response.notifications.length > 0) {
          // Check for new notifications since last poll
          const latestNotification = response.notifications[0];
          const lastCheck = localStorage.getItem(`lastNotificationCheck_${vendorId}`);
          
          if (!lastCheck || new Date(latestNotification.timestamp) > new Date(lastCheck)) {
            callback(latestNotification);
            localStorage.setItem(`lastNotificationCheck_${vendorId}`, new Date().toISOString());
          }
        }
      } catch (error) {
        console.error('💥 [NotificationService] Error in real-time polling:', error);
      }
    }, 30000); // Poll every 30 seconds

    // Return cleanup function
    return () => {
      clearInterval(pollInterval);
    };
  }
}

// Export singleton instance
export const vendorNotificationService = new VendorNotificationService();
export default vendorNotificationService;
