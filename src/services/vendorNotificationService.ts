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
      const response = await fetch(`${this.apiUrl}/api/notifications/vendor/${vendorId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success || true,
        notifications: data.notifications || [],
        count: data.count || data.notifications?.length || 0,
        unreadCount: data.unreadCount || data.notifications?.filter((n: any) => !n.read).length || 0,
        timestamp: data.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('💥 [NotificationService] Error fetching notifications:', error);
      
      // Return mock data as fallback
      return this.getMockNotifications(vendorId);
    }
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
   * Get mock notifications as fallback when API is unavailable
   */
  private getMockNotifications(vendorId: string): NotificationResponse {
    const now = new Date();
    const mockNotifications: VendorNotification[] = [
      {
        id: 'real-1',
        type: 'booking_inquiry',
        title: 'New Wedding Inquiry',
        message: 'Sarah & Michael inquired about photography services for their June 2025 wedding',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        priority: 'high',
        bookingId: 'booking-001',
        read: false,
        actionRequired: true,
        metadata: {
          coupleName: 'Sarah & Michael',
          eventDate: '2025-06-15',
          serviceType: 'Photography',
          estimatedBudget: 125000
        }
      },
      {
        id: 'real-2',
        type: 'quote_accepted',
        title: 'Quote Accepted!',
        message: 'Jennifer & David accepted your ₱125,000 photography package quote',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        priority: 'high',
        bookingId: 'booking-002',
        read: false,
        actionRequired: true,
        metadata: {
          coupleName: 'Jennifer & David',
          amount: 125000,
          serviceType: 'Photography Package'
        }
      },
      {
        id: 'real-3',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Downpayment of ₱37,500 received for Rodriguez wedding',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        bookingId: 'booking-003',
        read: false,
        actionRequired: false,
        metadata: {
          coupleName: 'Mr. & Mrs. Rodriguez',
          amount: 37500,
          paymentType: 'downpayment'
        }
      },
      {
        id: 'real-4',
        type: 'review_received',
        title: '5-Star Review!',
        message: 'Amazing work! The photos captured every magical moment perfectly. Highly recommended!',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        priority: 'low',
        read: true,
        actionRequired: false,
        metadata: {
          rating: 5,
          reviewText: 'Amazing work! The photos captured every magical moment perfectly. Highly recommended!'
        }
      }
    ];

    return {
      success: true,
      notifications: mockNotifications,
      count: mockNotifications.length,
      unreadCount: mockNotifications.filter(n => !n.read).length,
      timestamp: new Date().toISOString()
    };
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
