/**
 * Package Booking Service - Micro Backend Handler
 * Handles multi-vendor, multi-service package bookings
 * Wedding Bazaar Platform
 */

const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

// Types
export interface PackageBookingRequest {
  packageId: string;
  packageName: string;
  serviceIds: string[];
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  weddingDate?: string;
  guestCount?: number;
  specialRequests?: string;
}

export interface PackageBookingResponse {
  success: boolean;
  bookingIds: string[];
  packageBookingId: string;
  message: string;
  errors?: string[];
}

export interface GroupChatRequest {
  packageId: string;
  packageName: string;
  vendorIds: string[];
  userId: string;
  userName: string;
}

export interface GroupChatResponse {
  success: boolean;
  conversationId: string;
  participants: Array<{
    id: string;
    name: string;
    role: 'vendor' | 'customer';
  }>;
  message: string;
}

/**
 * Book multiple services as a package
 * Creates individual bookings for each service but links them as a package
 */
export async function bookPackage(
  request: PackageBookingRequest
): Promise<PackageBookingResponse> {
  try {
    console.log('📦 [PackageBooking] Creating package booking:', {
      packageId: request.packageId,
      serviceCount: request.serviceIds.length,
      totalAmount: request.totalAmount
    });

    const response = await fetch(`${apiUrl}/api/packages/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Package booking failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ [PackageBooking] Package booked successfully:', {
      packageBookingId: data.packageBookingId,
      bookingCount: data.bookingIds.length
    });

    return data;
  } catch (error) {
    console.error('❌ [PackageBooking] Error:', error);
    throw error;
  }
}

/**
 * Create a group chat with multiple vendors for package discussion
 */
export async function createGroupChat(
  request: GroupChatRequest
): Promise<GroupChatResponse> {
  try {
    console.log('💬 [GroupChat] Creating group conversation:', {
      packageId: request.packageId,
      vendorCount: request.vendorIds.length
    });

    const response = await fetch(`${apiUrl}/api/conversations/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Group chat creation failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ [GroupChat] Group conversation created:', {
      conversationId: data.conversationId,
      participantCount: data.participants.length
    });

    return data;
  } catch (error) {
    console.error('❌ [GroupChat] Error:', error);
    throw error;
  }
}

/**
 * Get package booking details
 */
export async function getPackageBooking(packageBookingId: string) {
  try {
    const response = await fetch(`${apiUrl}/api/packages/bookings/${packageBookingId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch package booking');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ [PackageBooking] Get error:', error);
    throw error;
  }
}

/**
 * Get user's package bookings
 */
export async function getUserPackageBookings(userId: string) {
  try {
    const response = await fetch(`${apiUrl}/api/packages/bookings/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch package bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ [PackageBooking] Get user bookings error:', error);
    throw error;
  }
}

export const packageBookingService = {
  bookPackage,
  createGroupChat,
  getPackageBooking,
  getUserPackageBookings
};

export default packageBookingService;
