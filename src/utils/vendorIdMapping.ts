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
    console.log('🚫 [VendorIdMapping] No user provided');
    return null;
  }

  console.log('🔍 [VendorIdMapping] Analyzing user ID pattern:', {
    userId: user.id,
    role: user.role,
    email: user.email,
    vendorId: user.vendorId
  });

  // Primary: Use user.id if user is a vendor
  if (user.role === 'vendor' && user.id) {
    const originalId = user.id;
    
    // Check if ID follows vendor pattern (2-YYYY-XXX)
    const isVendorPattern = /^2-\d{4}-\d{1,3}$/.test(originalId);
    
    if (isVendorPattern) {
      console.log('✅ [VendorIdMapping] Valid vendor ID pattern detected:', originalId);
      
      // First, try to use the original ID (preferred approach)
      console.log('🎯 [VendorIdMapping] Using authentic vendor ID (no mapping needed)');
      return originalId;
    } else {
      console.log('⚠️ [VendorIdMapping] Unexpected vendor ID format:', originalId);
    }
  }

  // Secondary: Use explicit vendorId field
  if (user.vendorId) {
    const originalId = user.vendorId;
    console.log('✅ [VendorIdMapping] Using explicit vendorId field:', originalId);
    return originalId;
  }

  // Fallback: Extract from user ID if it's a vendor pattern
  if (user.id && /^2-\d{4}-\d{1,3}$/.test(user.id)) {
    console.log('✅ [VendorIdMapping] Extracted vendor ID from user.id pattern:', user.id);
    return user.id;
  }

  console.log('❌ [VendorIdMapping] No valid vendor ID found for user');
  return null;
}

/**
 * Debug vendor ID resolution process
 * @param user - The authenticated user object
 */
export function debugVendorIdResolution(user: User | null | undefined): void {
  console.log('🔧 [VendorIdMapping] DEBUG VENDOR ID RESOLUTION:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!user) {
    console.log('❌ No user object provided');
    return;
  }

  console.log('👤 User Object Analysis:');
  console.log(`   ID: ${user.id || 'undefined'}`);
  console.log(`   Role: ${user.role || 'undefined'}`);
  console.log(`   Email: ${user.email || 'undefined'}`);
  console.log(`   VendorId: ${user.vendorId || 'undefined'}`);
  
  const finalId = getVendorIdForUser(user);
  console.log(`🆔 Final Vendor ID: ${finalId || 'null'}`);
  
  // Analyze the ID pattern
  if (user.id) {
    const isVendorPattern = /^2-\d{4}-\d{1,3}$/.test(user.id);
    const isCouplePattern = /^1-\d{4}-\d{1,3}$/.test(user.id);
    const isAdminPattern = /^3-\d{4}-\d{1,3}$/.test(user.id);
    
    console.log(`📊 ID Pattern Analysis:`);
    console.log(`   Pattern: ${user.id}`);
    console.log(`   Is Vendor (2-YYYY-XXX): ${isVendorPattern}`);
    console.log(`   Is Couple (1-YYYY-XXX): ${isCouplePattern}`);
    console.log(`   Is Admin (3-YYYY-XXX): ${isAdminPattern}`);
    console.log(`   Role matches pattern: ${(user.role === 'vendor' && isVendorPattern) || (user.role === 'individual' && isCouplePattern) || (user.role === 'admin' && isAdminPattern)}`);
  }
  
  if (finalId && finalId === user.id) {
    console.log('✅ DYNAMIC ID SYSTEM ACTIVE');
    console.log(`   Using authentic vendor ID: ${finalId}`);
    console.log('   No hardcoded mappings needed');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Smart vendor ID resolver with automatic fallback detection
 * Tests if backend accepts complex vendor IDs, falls back to simple mapping if needed
 * @param originalVendorId - The authentic vendor ID to test
 * @returns Promise<string> - The vendor ID that works with the current backend
 */
export async function getWorkingVendorId(originalVendorId: string): Promise<string> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    
    // First, try the original complex vendor ID
    console.log(`🧪 [VendorIdMapping] Testing original vendor ID: ${originalVendorId}`);
    const response = await fetch(`${apiUrl}/api/bookings/vendor/${originalVendorId}`);
    
    if (response.status === 200) {
      console.log(`✅ [VendorIdMapping] Backend accepts complex vendor ID: ${originalVendorId}`);
      BACKEND_SUPPORTS_COMPLEX_IDS = true;
      return originalVendorId;
    } else if (response.status === 403) {
      const data = await response.json();
      if (data.code === 'MALFORMED_VENDOR_ID') {
        console.log(`⚠️ [VendorIdMapping] Backend rejects complex ID, using fallback mapping`);
        BACKEND_SUPPORTS_COMPLEX_IDS = false;
        
        // Use dynamic extraction
        const fallbackId = extractSimpleVendorId(originalVendorId) || '1';
        console.log(`🔄 [VendorIdMapping] Dynamic fallback: ${originalVendorId} -> ${fallbackId}`);
        return fallbackId;
      }
    }
    
    // If other error, use original ID
    console.log(`🤔 [VendorIdMapping] Unexpected response (${response.status}), using original ID`);
    return originalVendorId;
    
  } catch (error) {
    console.log('❌ [VendorIdMapping] API test failed, using original ID:', error);
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
    console.log(`🔍 [VendorIdMapping] Backend fix status: ${isWorking ? 'DEPLOYED' : 'PENDING'}`);
    return isWorking;
    
  } catch (error) {
    console.log('❌ [VendorIdMapping] Backend fix check failed:', error);
    return false;
  }
}

/**
 * Reset backend compatibility cache when backend fix is confirmed deployed
 */
export function clearTemporaryMappings(): void {
  console.log('🗑️ [VendorIdMapping] Resetting backend compatibility cache - backend fix deployed!');
  BACKEND_SUPPORTS_COMPLEX_IDS = true;
}
