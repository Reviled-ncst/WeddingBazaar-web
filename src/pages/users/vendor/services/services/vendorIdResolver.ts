/**
 * 🔍 Vendor ID Resolution Service
 * 
 * Handles the dual vendor ID system:
 * - vendors table: id = '2-2025-003' (user ID format) - LEGACY SYSTEM
 * - vendor_profiles table: id = UUID, user_id = '2-2025-003' - NEW SYSTEM
 * 
 * The services.vendor_id FK references vendors.id ('2-2025-003')
 */

const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface VendorIdResolution {
  /** User ID format ('2-2025-003') - used for services FK */
  userFormatId: string;
  /** UUID format - used for vendor_profiles */
  profileId?: string;
  /** Source of the ID */
  source: 'session' | 'api' | 'fallback';
}

/**
 * Resolves the correct vendor ID for services operations
 * @param userId - User ID from auth context
 * @param sessionVendorId - Vendor ID from session (if available)
 * @returns Promise<VendorIdResolution>
 */
export async function resolveVendorId(
  userId: string | null,
  sessionVendorId?: string | null
): Promise<VendorIdResolution | null> {
  try {
    // Priority 1: Use session vendorId if available
    if (sessionVendorId) {
      console.log('✅ [vendorIdResolver] Using session vendor ID:', sessionVendorId);
      return {
        userFormatId: sessionVendorId,
        source: 'session'
      };
    }

    // Priority 2: Use userId (user ID format)
    if (userId) {
      console.log('✅ [vendorIdResolver] Using user ID as vendor ID:', userId);
      return {
        userFormatId: userId,
        source: 'session'
      };
    }

    // Priority 3: Fetch from API
    if (userId) {
      console.log('🔍 [vendorIdResolver] Fetching vendor ID from API for user:', userId);
      const response = await fetch(`${apiUrl}/api/vendors/user/${userId}`);
      const data = await response.json();
      
      if (data.success && data.vendor?.id) {
        console.log('✅ [vendorIdResolver] Found vendor ID from API:', data.vendor.id);
        return {
          userFormatId: userId,
          profileId: data.vendor.id,
          source: 'api'
        };
      }
    }

    console.error('❌ [vendorIdResolver] Failed to resolve vendor ID');
    return null;
  } catch (error) {
    console.error('❌ [vendorIdResolver] Error:', error);
    return null;
  }
}

/**
 * Get the vendor ID for services operations (user ID format)
 */
export function getServicesVendorId(resolution: VendorIdResolution | null): string | null {
  return resolution?.userFormatId || null;
}

/**
 * Get the vendor ID for profile operations (UUID format)
 */
export function getProfileVendorId(resolution: VendorIdResolution | null): string | null {
  return resolution?.profileId || resolution?.userFormatId || null;
}
