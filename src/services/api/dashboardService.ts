/**
 * DASHBOARD API SERVICE
 * 
 * Provides dashboard-specific data aggregation for:
 * - Individual/Couple dashboards
 * - Vendor dashboards
 * - Admin dashboards
 * 
 * Aggregates data from multiple sources:
 * - Bookings
 * - Budget tracking
 * - Task management
 * - Guest lists
 * - Recent activities
 */

import { centralizedBookingAPI } from './CentralizedBookingAPI';
import type { Booking } from '../../shared/types/comprehensive-booking.types';

// ==================== INTERFACES ====================

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalSpent: number;
  upcomingEvents: number;
}

export interface BudgetData {
  total: number;
  spent: number;
  remaining: number;
  categories: {
    category: string;
    allocated: number;
    spent: number;
  }[];
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'task' | 'message' | 'budget' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  metadata?: any;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  vendor: string;
  vendorId: string;
  location?: string;
  type: string;
  bookingId?: string;
}

export interface IndividualDashboardData {
  stats: DashboardStats;
  budget: BudgetData;
  recentActivities: RecentActivity[];
  upcomingEvents: UpcomingEvent[];
  bookings: Booking[];
}

// ==================== DASHBOARD SERVICE ====================

class DashboardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    console.log('📊 [DashboardService] Initialized with base URL:', this.baseUrl);
  }

  /**
   * Get complete dashboard data for an individual/couple user
   */
  async getIndividualDashboard(userId: string): Promise<IndividualDashboardData> {
    console.log('📊 [DashboardService] Fetching individual dashboard data for user:', userId);

    try {
      // Fetch bookings for the user
      const bookingsResponse = await centralizedBookingAPI.getCoupleBookings(userId, {
        limit: 100 // Get all bookings for stats
      });

      const bookings = bookingsResponse.bookings || [];
      console.log('📋 [DashboardService] Fetched bookings:', bookings.length);

      // Calculate stats from bookings
      const stats = this.calculateStats(bookings);
      console.log('📊 [DashboardService] Calculated stats:', stats);

      // Calculate budget from bookings
      const budget = this.calculateBudget(bookings);
      console.log('💰 [DashboardService] Calculated budget:', budget);

      // Get recent activities from bookings
      const recentActivities = this.getRecentActivities(bookings);
      console.log('📅 [DashboardService] Recent activities:', recentActivities.length);

      // Get upcoming events from confirmed bookings
      const upcomingEvents = this.getUpcomingEvents(bookings);
      console.log('🗓️ [DashboardService] Upcoming events:', upcomingEvents.length);

      return {
        stats,
        budget,
        recentActivities,
        upcomingEvents,
        bookings
      };
    } catch (error) {
      console.error('❌ [DashboardService] Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Calculate dashboard statistics from bookings
   */
  private calculateStats(bookings: Booking[]): DashboardStats {
    const totalBookings = bookings.length;
    
    const pendingBookings = bookings.filter(b => 
      ['request', 'quote_requested', 'quote_sent'].includes(b.status)
    ).length;
    
    const confirmedBookings = bookings.filter(b => 
      ['confirmed', 'deposit_paid', 'downpayment_paid', 'paid_in_full', 'fully_paid'].includes(b.status)
    ).length;
    
    const completedBookings = bookings.filter(b => 
      b.status === 'completed'
    ).length;

    // Calculate total spent from bookings with amounts
    const totalSpent = bookings.reduce((sum, booking) => {
      const amount = booking.final_price || booking.quoted_price || booking.downpayment_amount || booking.total_paid || 0;
      return sum + (typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0);
    }, 0);

    // Count upcoming events (future bookings that are confirmed)
    const now = new Date();
    const upcomingEvents = bookings.filter(b => {
      if (!b.event_date) return false;
      const eventDate = new Date(b.event_date);
      return eventDate > now && ['confirmed', 'deposit_paid', 'downpayment_paid', 'paid_in_full'].includes(b.status);
    }).length;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalSpent,
      upcomingEvents
    };
  }

  /**
   * Calculate budget data from bookings
   */
  private calculateBudget(bookings: Booking[]): BudgetData {
    // Calculate total spent
    const spent = bookings.reduce((sum, booking) => {
      const amount = booking.final_price || booking.quoted_price || booking.downpayment_amount || booking.total_paid || 0;
      return sum + (typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0);
    }, 0);

    // Estimate total budget (for now, use a reasonable multiple of spent or default)
    // In a real app, this would come from user settings
    const total = Math.max(spent * 1.5, 50000);
    const remaining = total - spent;

    // Group spending by category
    const categoryMap = new Map<string, { allocated: number; spent: number }>();
    
    bookings.forEach(booking => {
      const category = booking.service_type || 'Other';
      const amount = booking.final_price || booking.quoted_price || booking.downpayment_amount || booking.total_paid || 0;
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { allocated: 0, spent: 0 });
      }

      const cat = categoryMap.get(category)!;
      cat.spent += numAmount;
      // Estimate allocation based on spending
      cat.allocated = Math.max(cat.spent, cat.spent * 1.2);
    });

    const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data
    }));

    return {
      total,
      spent,
      remaining,
      categories
    };
  }

  /**
   * Get recent activities from bookings
   */
  private getRecentActivities(bookings: Booking[]): RecentActivity[] {
    const activities: RecentActivity[] = [];

    // Sort bookings by creation date (most recent first)
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Take the 10 most recent bookings and convert to activities
    sortedBookings.slice(0, 10).forEach(booking => {
      const activity = this.bookingToActivity(booking);
      if (activity) {
        activities.push(activity);
      }
    });

    return activities;
  }

  /**
   * Convert a booking to a recent activity
   */
  private bookingToActivity(booking: Booking): RecentActivity | null {
    const timestamp = booking.created_at || booking.updated_at || new Date().toISOString();
    const timeAgo = this.getTimeAgo(timestamp);

    // Determine activity type and message based on booking status
    let type: RecentActivity['type'] = 'booking';
    let title = '';
    let description = '';
    let icon = 'Calendar';
    let color = 'text-blue-600';

    switch (booking.status) {
      case 'request':
      case 'quote_requested':
        type = 'booking';
        title = 'Booking Request Sent';
        description = `Requested ${booking.service_type} from ${booking.vendor_name || 'vendor'}`;
        icon = 'Calendar';
        color = 'text-blue-600';
        break;

      case 'quote_sent':
        type = 'message';
        title = 'Quote Received';
        description = `Quote received from ${booking.vendor_name || 'vendor'}`;
        icon = 'MessageCircle';
        color = 'text-purple-600';
        break;

      case 'confirmed':
      case 'deposit_paid':
      case 'downpayment_paid':
        type = 'booking';
        title = `${booking.service_type} Confirmed`;
        description = `${booking.vendor_name || 'Vendor'} booking confirmed`;
        icon = 'CheckCircle';
        color = 'text-green-600';
        break;

      case 'paid_in_full':
      case 'fully_paid':
        type = 'payment';
        title = 'Payment Completed';
        description = `Full payment made to ${booking.vendor_name || 'vendor'}`;
        icon = 'DollarSign';
        color = 'text-green-600';
        break;

      case 'completed':
        type = 'task';
        title = 'Service Completed';
        description = `${booking.service_type} service completed successfully`;
        icon = 'CheckCircle';
        color = 'text-green-600';
        break;

      case 'cancelled':
      case 'quote_rejected':
        // Skip cancelled bookings in activity feed
        return null;

      default:
        title = 'Booking Update';
        description = `${booking.service_type} status updated`;
    }

    return {
      id: booking.id,
      type,
      title,
      description,
      timestamp: timeAgo,
      icon,
      color,
      metadata: {
        bookingId: booking.id,
        status: booking.status,
        vendorId: booking.vendor_id
      }
    };
  }

  /**
   * Get upcoming events from confirmed bookings
   */
  private getUpcomingEvents(bookings: Booking[]): UpcomingEvent[] {
    const now = new Date();
    
    // Filter for future confirmed bookings with event dates
    const futureBookings = bookings.filter(booking => {
      if (!booking.event_date) return false;
      
      const eventDate = new Date(booking.event_date);
      const isConfirmed = ['confirmed', 'deposit_paid', 'downpayment_paid', 'paid_in_full', 'fully_paid'].includes(booking.status);
      
      return eventDate > now && isConfirmed;
    });

    // Sort by event date (nearest first)
    futureBookings.sort((a, b) => {
      const dateA = new Date(a.event_date!);
      const dateB = new Date(b.event_date!);
      return dateA.getTime() - dateB.getTime();
    });

    // Convert to UpcomingEvent format
    return futureBookings.map(booking => ({
      id: booking.id,
      title: `${booking.service_type} Appointment`,
      date: booking.event_date!,
      time: booking.event_time || undefined,
      vendor: booking.vendor_name || 'Vendor',
      vendorId: booking.vendor_id,
      location: booking.event_location || booking.venue_details || undefined,
      type: booking.service_type || 'Wedding Service',
      bookingId: booking.id
    }));
  }

  /**
   * Get human-readable time ago string
   */
  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
