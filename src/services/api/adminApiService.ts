/**
 * Admin API Service - Modular API endpoints for admin operations
 * Handles all admin-related API calls with proper error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// AUTHENTICATION API
// ============================================
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  verify: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getRecentActivity: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/activity?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
  },

  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/alerts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  }
};

// ============================================
// USER MANAGEMENT API
// ============================================
export const userApi = {
  getAll: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getById: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  update: async (userId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  delete: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  suspend: async (userId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to suspend user');
    return response.json();
  },

  activate: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/activate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to activate user');
    return response.json();
  }
};

// ============================================
// VENDOR MANAGEMENT API
// ============================================
export const vendorApi = {
  getAll: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/vendors?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch vendors');
    return response.json();
  },

  getById: async (vendorId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/vendors/${vendorId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch vendor');
    return response.json();
  },

  approve: async (vendorId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/vendors/${vendorId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to approve vendor');
    return response.json();
  },

  reject: async (vendorId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/vendors/${vendorId}/reject`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to reject vendor');
    return response.json();
  },

  suspend: async (vendorId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/vendors/${vendorId}/suspend`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to suspend vendor');
    return response.json();
  },

  update: async (vendorId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/vendors/${vendorId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update vendor');
    return response.json();
  }
};

// ============================================
// VERIFICATION API
// ============================================
export const verificationApi = {
  getPending: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/verifications/pending`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch pending verifications');
    return response.json();
  },

  getAll: async (status?: string) => {
    const url = status 
      ? `${API_BASE_URL}/api/admin/verifications?status=${status}`
      : `${API_BASE_URL}/api/admin/verifications`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch verifications');
    return response.json();
  },

  approve: async (verificationId: string, notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/verifications/${verificationId}/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ notes })
    });
    if (!response.ok) throw new Error('Failed to approve verification');
    return response.json();
  },

  reject: async (verificationId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/verifications/${verificationId}/reject`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to reject verification');
    return response.json();
  }
};

// ============================================
// BOOKING MANAGEMENT API
// ============================================
export const bookingApi = {
  getAll: async (page = 1, limit = 50, status?: string) => {
    const url = status
      ? `${API_BASE_URL}/api/admin/bookings?page=${page}&limit=${limit}&status=${status}`
      : `${API_BASE_URL}/api/admin/bookings?page=${page}&limit=${limit}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  getById: async (bookingId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  },

  updateStatus: async (bookingId: string, status: string, notes?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status, notes })
    });
    if (!response.ok) throw new Error('Failed to update booking status');
    return response.json();
  },

  cancel: async (bookingId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
  }
};

// ============================================
// ANALYTICS API
// ============================================
export const analyticsApi = {
  getOverview: async (period = '30d') => {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics/overview?period=${period}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },

  getRevenue: async (startDate: string, endDate: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics/revenue?start=${startDate}&end=${endDate}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch revenue data');
    return response.json();
  },

  getUserGrowth: async (period = '12m') => {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics/users?period=${period}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user growth');
    return response.json();
  },

  getVendorMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics/vendors`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch vendor metrics');
    return response.json();
  }
};

// ============================================
// REVIEW MANAGEMENT API
// ============================================
export const reviewApi = {
  getAll: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/reviews?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  getFlagged: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/reviews/flagged`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch flagged reviews');
    return response.json();
  },

  approve: async (reviewId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to approve review');
    return response.json();
  },

  remove: async (reviewId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to remove review');
    return response.json();
  }
};

// ============================================
// NOTIFICATION API
// ============================================
export const notificationApi = {
  sendBulk: async (userIds: string[], message: string, title: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/bulk`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userIds, message, title })
    });
    if (!response.ok) throw new Error('Failed to send notifications');
    return response.json();
  },

  getHistory: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications/history?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch notification history');
    return response.json();
  }
};

// ============================================
// SETTINGS API
// ============================================
export const settingsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  update: async (settings: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  }
};

// Export all APIs
export default {
  auth: authApi,
  dashboard: dashboardApi,
  users: userApi,
  vendors: vendorApi,
  verifications: verificationApi,
  bookings: bookingApi,
  analytics: analyticsApi,
  reviews: reviewApi,
  notifications: notificationApi,
  settings: settingsApi
};
