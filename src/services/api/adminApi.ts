// Admin API Service
// Centralized API management for all admin operations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Management Types
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: 'individual' | 'vendor' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  emailVerified: boolean;
  joinDate: string;
  lastLogin?: string;
  totalBookings: number;
  totalSpent: number;
  preferredServices: string[];
  location?: string;
  avatar?: string;
}

// Vendor Management Types  
export interface AdminVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  rating: number;
  reviewCount: number;
  joinDate: string;
  lastActive: string;
  totalBookings: number;
  totalRevenue: number;
  commissionRate: number;
  documents: {
    businessLicense: string;
    insurance: string;
    portfolio: string[];
  };
  services: string[];
  description: string;
  website?: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

// Booking Management Types
export interface AdminBooking {
  id: string;
  bookingReference: string;
  userId: string;
  vendorId: string;
  serviceId: string;
  userName: string;
  vendorName: string;
  serviceName: string;
  serviceCategory: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  bookingDate: string;
  eventDate: string;
  duration: number;
  totalAmount: number;
  paidAmount: number;
  commission: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  clientContact: {
    email: string;
    phone?: string;
  };
  vendorContact: {
    email: string;
    phone?: string;
  };
}

// Analytics Types
export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    totalVendors: number;
    totalBookings: number;
    totalRevenue: number;
    monthlyGrowth: {
      users: number;
      vendors: number;
      bookings: number;
      revenue: number;
    };
  };
  userMetrics: {
    activeUsers: number;
    newRegistrations: number;
    userRetention: number;
    avgBookingsPerUser: number;
  };
  vendorMetrics: {
    activeVendors: number;
    pendingApprovals: number;
    avgRating: number;
    topCategories: Array<{ category: string; count: number }>;
  };
  bookingMetrics: {
    todayBookings: number;
    weeklyBookings: number;
    completionRate: number;
    avgBookingValue: number;
    popularServices: Array<{ service: string; count: number }>;
  };
  financialMetrics: {
    totalRevenue: number;
    commission: number;
    pendingPayouts: number;
    refunds: number;
  };
}

// Utility function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Utility function for paginated API calls
async function paginatedApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PaginatedResponse<T>> {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      data: data.data || data.items || [],
      message: data.message,
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// ============================================================================
// USER MANAGEMENT API
// ============================================================================

export const userApi = {
  // Get all users with pagination and filters
  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<AdminUser>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return paginatedApiCall<AdminUser>(endpoint);
  },

  // Get single user details
  getUser: async (userId: string): Promise<ApiResponse<AdminUser>> => {
    return apiCall<AdminUser>(`/api/admin/users/${userId}`);
  },

  // Update user status
  updateUserStatus: async (userId: string, status: AdminUser['status']): Promise<ApiResponse<AdminUser>> => {
    return apiCall<AdminUser>(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Update user details
  updateUser: async (userId: string, updates: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> => {
    return apiCall<AdminUser>(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Delete user
  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Get user activity logs
  getUserActivity: async (userId: string): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>(`/api/admin/users/${userId}/activity`);
  },

  // Export users data
  exportUsers: async (filters?: any): Promise<ApiResponse<string>> => {
    return apiCall<string>('/api/admin/users/export', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  },
};

// ============================================================================
// VENDOR MANAGEMENT API
// ============================================================================

export const vendorApi = {
  // Get all vendors with pagination and filters
  getVendors: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    verificationStatus?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<AdminVendor>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/admin/vendors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return paginatedApiCall<AdminVendor>(endpoint);
  },

  // Get single vendor details
  getVendor: async (vendorId: string): Promise<ApiResponse<AdminVendor>> => {
    return apiCall<AdminVendor>(`/api/admin/vendors/${vendorId}`);
  },

  // Update vendor status
  updateVendorStatus: async (vendorId: string, status: AdminVendor['status']): Promise<ApiResponse<AdminVendor>> => {
    return apiCall<AdminVendor>(`/api/admin/vendors/${vendorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Update vendor verification
  updateVendorVerification: async (
    vendorId: string, 
    verificationStatus: AdminVendor['verificationStatus'],
    notes?: string
  ): Promise<ApiResponse<AdminVendor>> => {
    return apiCall<AdminVendor>(`/api/admin/vendors/${vendorId}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus, notes }),
    });
  },

  // Update vendor details
  updateVendor: async (vendorId: string, updates: Partial<AdminVendor>): Promise<ApiResponse<AdminVendor>> => {
    return apiCall<AdminVendor>(`/api/admin/vendors/${vendorId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Get vendor documents
  getVendorDocuments: async (vendorId: string): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>(`/api/admin/vendors/${vendorId}/documents`);
  },

  // Approve/Reject vendor application
  processVendorApplication: async (
    vendorId: string,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<ApiResponse<AdminVendor>> => {
    return apiCall<AdminVendor>(`/api/admin/vendors/${vendorId}/application`, {
      method: 'PATCH',
      body: JSON.stringify({ action, notes }),
    });
  },

  // Export vendors data
  exportVendors: async (filters?: any): Promise<ApiResponse<string>> => {
    return apiCall<string>('/api/admin/vendors/export', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  },
};

// ============================================================================
// BOOKING MANAGEMENT API
// ============================================================================

export const bookingApi = {
  // Get all bookings with pagination and filters
  getBookings: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    vendorId?: string;
    userId?: string;
    serviceCategory?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<AdminBooking>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/admin/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return paginatedApiCall<AdminBooking>(endpoint);
  },

  // Get single booking details
  getBooking: async (bookingId: string): Promise<ApiResponse<AdminBooking>> => {
    return apiCall<AdminBooking>(`/api/admin/bookings/${bookingId}`);
  },

  // Update booking status
  updateBookingStatus: async (
    bookingId: string, 
    status: AdminBooking['status'],
    notes?: string
  ): Promise<ApiResponse<AdminBooking>> => {
    return apiCall<AdminBooking>(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  // Process refund
  processRefund: async (
    bookingId: string,
    amount: number,
    reason: string
  ): Promise<ApiResponse<AdminBooking>> => {
    return apiCall<AdminBooking>(`/api/admin/bookings/${bookingId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },

  // Get booking analytics
  getBookingAnalytics: async (dateRange?: {
    from: string;
    to: string;
  }): Promise<ApiResponse<any>> => {
    const queryParams = dateRange ? new URLSearchParams({
      from: dateRange.from,
      to: dateRange.to,
    }) : new URLSearchParams();

    return apiCall<any>(`/api/admin/bookings/analytics?${queryParams.toString()}`);
  },

  // Export bookings data
  exportBookings: async (filters?: any): Promise<ApiResponse<string>> => {
    return apiCall<string>('/api/admin/bookings/export', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
  // Get dashboard overview
  getOverview: async (dateRange?: {
    from: string;
    to: string;
  }): Promise<ApiResponse<AdminAnalytics>> => {
    const queryParams = dateRange ? new URLSearchParams({
      from: dateRange.from,
      to: dateRange.to,
    }) : new URLSearchParams();

    return apiCall<AdminAnalytics>(`/api/admin/analytics/overview?${queryParams.toString()}`);
  },

  // Get detailed user analytics
  getUserAnalytics: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/api/admin/analytics/users?period=${period}`);
  },

  // Get detailed vendor analytics
  getVendorAnalytics: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/api/admin/analytics/vendors?period=${period}`);
  },

  // Get financial analytics
  getFinancialAnalytics: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/api/admin/analytics/financial?period=${period}`);
  },

  // Get platform health metrics
  getPlatformHealth: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/api/admin/analytics/health');
  },
};

// ============================================================================
// SYSTEM MANAGEMENT API
// ============================================================================

export const systemApi = {
  // Get system settings
  getSettings: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/api/admin/system/settings');
  },

  // Update system settings
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    return apiCall<any>('/api/admin/system/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  // Get system logs
  getLogs: async (params: {
    level?: 'error' | 'warn' | 'info' | 'debug';
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<PaginatedResponse<any>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return paginatedApiCall<any>(`/api/admin/system/logs?${queryParams.toString()}`);
  },

  // Backup data
  createBackup: async (): Promise<ApiResponse<string>> => {
    return apiCall<string>('/api/admin/system/backup', {
      method: 'POST',
    });
  },

  // Send system notifications
  sendNotification: async (notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    recipients: 'all' | 'users' | 'vendors' | 'admins';
  }): Promise<ApiResponse<void>> => {
    return apiCall<void>('/api/admin/system/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },
};

// ============================================================================
// CONTENT MANAGEMENT API
// ============================================================================

export const contentApi = {
  // Get service categories
  getServiceCategories: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/api/admin/content/categories');
  },

  // Update service categories
  updateServiceCategories: async (categories: any[]): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/api/admin/content/categories', {
      method: 'PUT',
      body: JSON.stringify({ categories }),
    });
  },

  // Get featured content
  getFeaturedContent: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/api/admin/content/featured');
  },

  // Update featured content
  updateFeaturedContent: async (content: any): Promise<ApiResponse<any>> => {
    return apiCall<any>('/api/admin/content/featured', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  },

  // Get reviews for moderation
  getReviewsForModeration: async (params: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected';
  } = {}): Promise<PaginatedResponse<any>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return paginatedApiCall<any>(`/api/admin/content/reviews?${queryParams.toString()}`);
  },

  // Moderate review
  moderateReview: async (
    reviewId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/api/admin/content/reviews/${reviewId}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  },
};

// Export all APIs
export const adminApi = {
  users: userApi,
  vendors: vendorApi,
  bookings: bookingApi,
  analytics: analyticsApi,
  system: systemApi,
  content: contentApi,
};

export default adminApi;
