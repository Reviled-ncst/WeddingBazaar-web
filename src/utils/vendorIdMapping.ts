/**
 * 🆔 VENDOR ID MAPPING UTILITY
 * Maps authenticated user data to correct vendor IDs for API calls
 * 
 * TEMPORARY WORKAROUND: While backend deploys fix for 2-2025-XXX format validation
 * Map complex vendor IDs to simple numeric IDs that work with current backend
 */

interface User {
  id?: string;
  email?: string;
  vendorId?: string;
  role?: string;
  [key: string]: any;
}

/**
 * USER ID PATTERN ANALYSIS
 * Based on the database structure, user IDs follow these patterns:
 * - Vendors: 2-YYYY-XXX (e.g., 2-2025-003)
 * - Individuals/Couples: 1-YYYY-XXX (e.g., 1-2025-001) 
 * - Admins: 3-YYYY-XXX (e.g., 3-2025-001)
 */

/**
 * Check if backend accepts complex vendor IDs (2-YYYY-XXX format)
 * If not, we need temporary mapping until backend fix is deployed
 */
let BACKEND_SUPPORTS_COMPLEX_IDS: boolean | null = null;

/**
 * DYNAMIC FALLBACK FUNCTION (no hardcoded mappings)
 * Extracts simple numeric ID from complex vendor ID format
 */
function extractSimpleVendorId(complexId: string): string | null {
  // Pattern: 2-2025-003 → extract the last number (003 → 3)
  const match = complexId.match(/^(\d+)-\d{4}-(\d+)$/);
  if (match) {
    return parseInt(match[2], 10).toString();
  }
  return null;
}

/**
 * Extract vendor ID from user based on ID pattern analysis
 * @param user - The authenticated user object
 * @returns The vendor ID to use for API calls
 */
export function getVendorIdForUser(user: User | null | undefined): string | null {
  if (!user) {
    return null;
  }
  // Primary: Use user.id if user is a vendor
  if (user.role === 'vendor' && user.id) {
    const originalId = user.id;
    
    // Check if ID follows vendor pattern (2-YYYY-XXX)
    const isVendorPattern = /^2-\d{4}-\d{1,3}$/.test(originalId);
    
    if (isVendorPattern) {
      // First, try to use the original ID (preferred approach)
      return originalId;
    } else {
    }
  }

  // Secondary: Use explicit vendorId field
  if (user.vendorId) {
    const originalId = user.vendorId;
    return originalId;
  }

  // Fallback: Extract from user ID if it's a vendor pattern
  if (user.id && /^2-\d{4}-\d{1,3}$/.test(user.id)) {
    return user.id;
  }
  return null;
}

/**
 * Debug vendor ID resolution process
 * @param user - The authenticated user object
 */
export function debugVendorIdResolution(user: User | null | undefined): void {
  if (!user) {
    return;
  }
  const finalId = getVendorIdForUser(user);
  // Analyze the ID pattern
  if (user.id) {
    const isVendorPattern = /^2-\d{4}-\d{1,3}$/.test(user.id);
    const isCouplePattern = /^1-\d{4}-\d{1,3}$/.test(user.id);
    const isAdminPattern = /^3-\d{4}-\d{1,3}$/.test(user.id);
  }
  
  if (finalId && finalId === user.id) {
  }
}

/**
 * Smart vendor ID resolver with automatic fallback detection
 * Tests if backend accepts complex vendor IDs, falls back to simple mapping if needed
 * @param originalVendorId - The authentic vendor ID to test
 * @param authToken - Optional authentication token for testing authenticated endpoints
 * @returns Promise<string> - The vendor ID that works with the current backend
 */
export async function getWorkingVendorId(originalVendorId: string, authToken?: string): Promise<string> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    
    // Build headers with auth if available
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // First, try the original complex vendor ID
    const response = await fetch(`${apiUrl}/api/bookings/vendor/${originalVendorId}`, {
      method: 'GET',
      headers
    });
    
    if (response.status === 200) {
      BACKEND_SUPPORTS_COMPLEX_IDS = true;
      return originalVendorId;
    } else if (response.status === 403 || response.status === 400) {
      const data = await response.json().catch(() => ({}));
      if (data.code === 'MALFORMED_VENDOR_ID') {
        BACKEND_SUPPORTS_COMPLEX_IDS = false;
        
        // Use dynamic extraction
        const fallbackId = extractSimpleVendorId(originalVendorId) || '1';
        return fallbackId;
      }
    }
    
    // If other error, use original ID
    return originalVendorId;
    
  } catch (error) {
    return originalVendorId;
  }
}

/**
 * Check if backend fix is deployed by testing a complex vendor ID
 * @returns Promise<boolean> - True if backend accepts complex vendor IDs
 */
export async function isBackendFixDeployed(testVendorId?: string): Promise<boolean> {
  if (BACKEND_SUPPORTS_COMPLEX_IDS !== null) {
    return BACKEND_SUPPORTS_COMPLEX_IDS;
  }
  
  // Use provided test ID or generate a sample complex ID for testing
  const sampleTestId = testVendorId || '2-2025-001';
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    
    const response = await fetch(`${apiUrl}/api/bookings/vendor/${sampleTestId}`);
    const isWorking = response.status === 200;
    
    BACKEND_SUPPORTS_COMPLEX_IDS = isWorking;
    return isWorking;
    
  } catch (error) {
    return false;
  }
}

/**
 * Reset backend compatibility cache when backend fix is confirmed deployed
 */
export function clearTemporaryMappings(): void {
  BACKEND_SUPPORTS_COMPLEX_IDS = true;
}
