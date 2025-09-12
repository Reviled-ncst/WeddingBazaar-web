import { useState, useEffect, useCallback } from 'react';
import { vendorApiService } from '../services/api/vendorApiService';
import type { DashboardData, VendorProfile, BookingsResponse, AnalyticsData } from '../services/api/vendorApiService';

// Custom hook for vendor dashboard data
export const useVendorDashboard = (vendorId: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await vendorApiService.getDashboardData(vendorId);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    if (vendorId) {
      fetchDashboardData();
    }
  }, [vendorId, fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
};

// Custom hook for vendor profile
export const useVendorProfile = (vendorId: string) => {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile for vendor ID:', vendorId);
      const profileData = await vendorApiService.getProfile(vendorId);
      console.log('Profile data received:', profileData);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  const updateProfile = useCallback(async (profileData: Partial<VendorProfile>) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedProfile = await vendorApiService.updateProfile(vendorId, profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [vendorId]);

  const uploadProfileImage = useCallback(async (imageFile: File) => {
    try {
      setUpdating(true);
      setError(null);
      const result = await vendorApiService.uploadProfileImage(vendorId, imageFile);
      
      // Update the profile with the new image URL
      if (profile) {
        const updatedProfile = { ...profile, profile_image: result.url };
        setProfile(updatedProfile);
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [vendorId, profile]);

  const deleteProfileImage = useCallback(async () => {
    try {
      setUpdating(true);
      setError(null);
      await vendorApiService.deleteProfileImage(vendorId);
      
      // Update the profile to remove the image URL
      if (profile) {
        const updatedProfile = { ...profile, profile_image: undefined };
        setProfile(updatedProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [vendorId, profile]);

  useEffect(() => {
    if (vendorId) {
      fetchProfile();
    }
  }, [vendorId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    refetch: fetchProfile
  };
};

// Custom hook for vendor bookings
export const useVendorBookings = (
  vendorId: string,
  options?: {
    status?: string;
    page?: number;
    limit?: number;
  }
) => {
  const [bookings, setBookings] = useState<BookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const bookingsData = await vendorApiService.getBookings(vendorId, options);
      setBookings(bookingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [vendorId, options]);

  const updateBookingStatus = useCallback(async (
    bookingId: string,
    status: string,
    notes?: string
  ) => {
    try {
      setUpdatingStatus(bookingId);
      setError(null);
      await vendorApiService.updateBookingStatus(bookingId, status, notes);
      // Refetch bookings to get updated data
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
      throw err;
    } finally {
      setUpdatingStatus(null);
    }
  }, [fetchBookings]);

  useEffect(() => {
    if (vendorId) {
      fetchBookings();
    }
  }, [vendorId, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    updatingStatus,
    updateBookingStatus,
    refetch: fetchBookings
  };
};

// Custom hook for vendor analytics
export const useVendorAnalytics = (vendorId: string, period: string = 'month') => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await vendorApiService.getAnalytics(vendorId, period);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [vendorId, period]);

  useEffect(() => {
    if (vendorId) {
      fetchAnalytics();
    }
  }, [vendorId, period, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

// Utility hook for handling API errors with user-friendly messages
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown, defaultMessage: string = 'An error occurred') => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'string') {
      setError(err);
    } else {
      setError(defaultMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};

// Loading states for better UX
export const useLoadingStates = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  return {
    loading,
    setLoadingState,
    isLoading
  };
};
