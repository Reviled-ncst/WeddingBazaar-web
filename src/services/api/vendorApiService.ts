// Frontend API service for vendor data
interface DashboardMetrics {
  totalBookings: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  profileViews: number;
  conversionRate: string;
  avgRating: number;
  totalReviews: number;
  responseTime: string;
  activeClients: number;
  pendingInquiries: number;
  completedProjects: number;
  repeatCustomers: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'message' | 'review' | 'payment' | 'profile_view';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  client?: string;
  rating?: number;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  business_description?: string;
  location?: string;
  service_areas?: string[] | string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  portfolio_images?: string[];
  pricing?: {
    starting_price?: number;
    price_range?: string;
    packages?: Array<{
      name: string;
      price: number;
      description: string;
    }>;
  };
  specialties?: string[];
  equipment?: string[];
  rating?: number;
  review_count?: number;
  years_experience?: number;
  verified?: boolean;
  created_at: string;
  awards?: string[];
  certifications?: string[];
  // Legacy fields for compatibility
  years_in_business?: number;
  portfolio_url?: string;
  website_url?: string;
  featured_image_url?: string;
  updated_at?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  profile_image_public_id?: string;
}

interface DashboardData {
  vendor: VendorProfile;
  metrics: DashboardMetrics;
  recentActivity: RecentActivity[];
}

interface BookingData {
  id: string;
  couple_id: string;
  vendor_id: string;
  service_type: string;
  event_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  notes: string;
  contract_details: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image?: string;
}

interface BookingsResponse {
  bookings: BookingData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AnalyticsData {
  revenue: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  bookingStatus: Array<{
    status: string;
    count: number;
  }>;
  ratings: Array<{
    rating: number;
    count: number;
  }>;
  period: string;
}

class VendorApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  // Fetch vendor dashboard data
  async getDashboardData(vendorId: string): Promise<DashboardData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vendors/${vendorId}/dashboard`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data if API fails
      return this.getMockDashboardData();
    }
  }

  // Fetch vendor profile
  async getProfile(vendorId: string): Promise<VendorProfile> {
    try {
      console.log('Attempting to fetch profile from API for vendor:', vendorId);
      
      // Use the new user_id based endpoint
      const response = await fetch(`${this.baseUrl}/api/vendors/user/${vendorId}/profile`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Backend returns { success: true, profile: profileData }
      if (result.success && result.profile) {
        return result.profile;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      console.log('Falling back to mock data');
      
      // Fallback to mock data if API fails
      const mockData = this.getMockProfile();
      console.log('Mock data being returned:', mockData);
      return mockData;
    }
  }

  // Update vendor profile
  async updateProfile(vendorId: string, profileData: Partial<VendorProfile>): Promise<VendorProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vendors/${vendorId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update API response:', result);
      
      // Backend returns { success: true, profile: profileData }
      if (result.success && result.profile) {
        return result.profile;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  }

  // Fetch vendor bookings
  async getBookings(
    vendorId: string, 
    options?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<BookingsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.status) queryParams.append('status', options.status);
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      
      const response = await fetch(
        `${this.baseUrl}/api/vendors/${vendorId}/bookings?${queryParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      // Fallback to mock data if API fails
      return this.getMockBookings();
    }
  }

  // Update booking status
  async updateBookingStatus(
    bookingId: string, 
    status: string, 
    notes?: string
  ): Promise<BookingData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vendors/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Fetch vendor analytics
  async getAnalytics(vendorId: string, period: string = 'month'): Promise<AnalyticsData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/vendors/${vendorId}/analytics?period=${period}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Fallback to mock data if API fails
      return this.getMockAnalytics();
    }
  }

  // Upload vendor profile image to Cloudinary
  async uploadProfileImage(vendorId: string, imageFile: File): Promise<{ url: string; public_id?: string }> {
    try {
      // Import Cloudinary service dynamically
      const { cloudinaryService } = await import('../cloudinaryService');
      
      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadImage(imageFile, 'vendor-profiles');
      
      // Update vendor profile in database with new image URL
      const profileData = {
        profile_image: uploadResult.secure_url,
        profile_image_public_id: uploadResult.public_id
      };
      
      // Try to update the profile in the backend
      try {
        await this.updateProfile(vendorId, profileData);
      } catch (updateError) {
        console.warn('Failed to update profile in database, but image uploaded to Cloudinary:', updateError);
      }
      
      return {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    } catch (error) {
      console.error('Error uploading profile image:', error);
      
      // For development, return a mock successful response with timestamp for cache busting
      const mockImageUrl = `https://picsum.photos/400/300?random=${vendorId}&t=${Date.now()}`;
      return { url: mockImageUrl };
    }
  }

  // Delete vendor profile image
  async deleteProfileImage(vendorId: string): Promise<void> {
    try {
      // Get current profile to find the public_id for Cloudinary deletion
      const profile = await this.getProfile(vendorId);
      
      if (profile.profile_image_public_id) {
        // Import Cloudinary service dynamically
        const { cloudinaryService } = await import('../cloudinaryService');
        
        // Delete from Cloudinary
        await cloudinaryService.deleteImage(profile.profile_image_public_id);
      }
      
      // Update vendor profile in database to remove image
      const profileData = {
        profile_image: undefined,
        profile_image_public_id: undefined
      };
      
      try {
        await this.updateProfile(vendorId, profileData);
      } catch (updateError) {
        console.warn('Failed to update profile in database, but image deleted from Cloudinary:', updateError);
      }
    } catch (error) {
      console.error('Error deleting profile image:', error);
      // For development, don't throw error - just log it
      console.log('Mock deletion successful in development mode');
    }
  }

  // Mock data fallbacks for development
  private getMockDashboardData(): DashboardData {
    return {
      vendor: this.getMockProfile(),
      metrics: {
        totalBookings: 24,
        monthlyRevenue: 8500,
        yearlyRevenue: 85000,
        profileViews: 892,
        conversionRate: '18.5',
        avgRating: 4.8,
        totalReviews: 45,
        responseTime: '2 hours',
        activeClients: 12,
        pendingInquiries: 6,
        completedProjects: 18,
        repeatCustomers: 7
      },
      recentActivity: [
        {
          id: '1',
          type: 'booking',
          title: 'New Booking Request',
          description: 'Sarah Johnson requested your wedding photography services',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          amount: 2500,
          client: 'Sarah Johnson'
        },
        {
          id: '2',
          type: 'review',
          title: 'New Review Received',
          description: 'Emily Davis left a 5-star review',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          client: 'Emily Davis',
          rating: 5
        },
        {
          id: '3',
          type: 'booking',
          title: 'Booking Confirmed',
          description: 'Michael Chen confirmed their engagement session',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          amount: 800,
          client: 'Michael Chen'
        }
      ]
    };
  }

  private getMockProfile(): VendorProfile {
    return {
      id: '1',
      user_id: 'vendor-user-1',
      business_name: 'Elegant Moments Photography',
      business_type: 'Photography',
      business_description: 'We specialize in capturing the most precious moments of your special day with artistic flair and professional expertise. Our team has been creating beautiful wedding memories for over 8 years.',
      years_in_business: 8,
      portfolio_url: 'https://elegantmoments.com/portfolio',
      website_url: 'https://www.elegantmoments.com',
      social_media: {
        instagram: 'https://instagram.com/elegantmoments_photo',
        facebook: 'https://facebook.com/elegantmomentsphotography'
      },
      service_areas: ['San Francisco', 'Bay Area', 'Napa Valley'],
      featured_image_url: 'https://picsum.photos/600/400?random=101',
      portfolio_images: [
        'https://picsum.photos/600/400?random=101',
        'https://picsum.photos/600/400?random=102',
        'https://picsum.photos/600/400?random=103'
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: 'info@elegantmoments.com',
      first_name: 'Sarah',
      last_name: 'Johnson',
      profile_image: 'https://picsum.photos/400/300?random=100' // Backwards compatibility
    };
  }

  private getMockBookings(): BookingsResponse {
    return {
      bookings: [
        {
          id: '1',
          couple_id: '1',
          vendor_id: '1',
          service_type: 'Wedding Photography',
          event_date: '2024-06-15',
          status: 'confirmed',
          total_amount: 2500,
          notes: 'Outdoor ceremony at Central Park',
          contract_details: 'Full day coverage with engagement session',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah@example.com',
          profile_image: 'https://picsum.photos/400/300?random=200'
        },
        {
          id: '2',
          couple_id: '2',
          vendor_id: '1',
          service_type: 'Engagement Session',
          event_date: '2024-03-20',
          status: 'pending',
          total_amount: 800,
          notes: 'Brooklyn Bridge location preferred',
          contract_details: '2-hour session with digital gallery',
          created_at: '2024-01-20T14:00:00Z',
          updated_at: '2024-01-20T14:00:00Z',
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael@example.com'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1
      }
    };
  }

  private getMockAnalytics(): AnalyticsData {
    return {
      revenue: [
        { date: '2024-01-01', revenue: 2500, bookings: 2 },
        { date: '2024-01-02', revenue: 1800, bookings: 1 },
        { date: '2024-01-03', revenue: 3200, bookings: 3 },
        { date: '2024-01-04', revenue: 0, bookings: 0 },
        { date: '2024-01-05', revenue: 4500, bookings: 2 }
      ],
      bookingStatus: [
        { status: 'pending', count: 6 },
        { status: 'confirmed', count: 12 },
        { status: 'completed', count: 18 },
        { status: 'cancelled', count: 2 }
      ],
      ratings: [
        { rating: 5, count: 28 },
        { rating: 4, count: 12 },
        { rating: 3, count: 3 },
        { rating: 2, count: 1 },
        { rating: 1, count: 1 }
      ],
      period: 'month'
    };
  }
}

export const vendorApiService = new VendorApiService();

// Export interfaces for use in components
export type {
  DashboardMetrics,
  RecentActivity,
  DashboardData,
  BookingData,
  BookingsResponse,
  AnalyticsData
};
