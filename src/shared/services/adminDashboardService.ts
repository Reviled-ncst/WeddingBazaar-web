import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  totalRevenue: number;
  completedBookings: number;
  activeUsers: number;
  pendingVerifications: number;
  recentBookings: RecentBooking[];
  bookingsByStatus: Record<string, number>;
  timestamp: string;
}

export interface RecentBooking {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  vendorName: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: {
    amount?: number;
    status?: string;
    userEmail?: string;
  };
}

/**
 * Fetch comprehensive dashboard statistics
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`);
    if (response.data.success) {
      return response.data.stats;
    }
    throw new Error('Failed to fetch dashboard stats');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch recent platform activities
 */
export const fetchRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/dashboard/activities`, {
      params: { limit }
    });
    if (response.data.success) {
      return response.data.activities;
    }
    throw new Error('Failed to fetch recent activities');
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Fetch system statistics (legacy endpoint)
 */
export const fetchSystemStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/stats`);
    if (response.data.success) {
      return response.data.stats;
    }
    throw new Error('Failed to fetch system stats');
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

export const adminDashboardService = {
  fetchDashboardStats,
  fetchRecentActivities,
  fetchSystemStats,
};
