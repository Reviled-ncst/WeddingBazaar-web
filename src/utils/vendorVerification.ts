/**
 * Vendor Verification Utility Functions
 * 
 * Centralized verification logic for vendor profiles
 * Used by VendorProfile component and other vendor-related features
 */

import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { VendorProfile } from '../services/api/vendorApiService';

/**
 * Verification Status Type
 */
export interface VerificationStatus {
  status: 'verified' | 'pending' | 'not_verified';
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

/**
 * Document interface for verification
 */
export interface VendorDocument {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  document_type: string;
  document_url: string;
  uploaded_at: string;
  verified_at?: string;
  rejection_reason?: string;
}

/**
 * Check if vendor's documents are verified
 * 
 * @param profile - Vendor profile object
 * @returns boolean - true if documents are verified
 */
export function isDocumentVerified(profile: VendorProfile | null | undefined): boolean {
  if (!profile) return false;

  // Check documentsVerified field from API response (camelCase)
  const hasVerifiedField = profile.documentsVerified === true || profile.documents_verified === true;
  
  // Also check if there are any approved documents in the documents array
  const hasApprovedDocuments = profile.documents && 
    Array.isArray(profile.documents) && 
    profile.documents.some((doc: VendorDocument) => doc.status === 'approved');
  
  return hasVerifiedField || hasApprovedDocuments || false;
}

/**
 * Get business verification status with UI indicators
 * 
 * @param profile - Vendor profile object
 * @returns VerificationStatus - Object with status, color, icon, and label
 */
export function getBusinessVerificationStatus(
  profile: VendorProfile | null | undefined
): VerificationStatus {
  if (!profile) {
    return {
      status: 'not_verified',
      color: 'text-gray-400',
      icon: XCircle,
      label: 'No Profile Data'
    };
  }

  // Check both database field and actual uploaded documents
  const documentsVerified = isDocumentVerified(profile);
  const businessVerified = profile.businessVerified === true || profile.business_verified === true;
  
  // Count approved documents
  const approvedDocsCount = profile.documents?.filter(
    (doc: VendorDocument) => doc.status === 'approved'
  ).length || 0;
  
  console.log('🔍 Business Verification Check:', {
    documentsVerified,
    businessVerified,
    approvedDocsCount,
    totalDocs: profile.documents?.length || 0,
    verificationStatus: profile.overallVerificationStatus
  });
  
  // Return verification status based on conditions
  if (businessVerified || documentsVerified) {
    return {
      status: 'verified',
      color: 'text-green-600',
      icon: CheckCircle,
      label: 'Verified'
    };
  } else if (profile.verification_status === 'pending' || approvedDocsCount > 0) {
    return {
      status: 'pending',
      color: 'text-amber-600',
      icon: Clock,
      label: 'Under Review'
    };
  } else {
    return {
      status: 'not_verified',
      color: 'text-amber-600',
      icon: XCircle,
      label: 'Not Verified'
    };
  }
}

/**
 * Check if email is verified (Firebase)
 * 
 * @param emailVerified - Firebase email verification status
 * @param profileEmailVerified - Database email verification status
 * @returns boolean - true if email is verified
 */
export function isEmailVerified(
  emailVerified: boolean,
  profileEmailVerified?: boolean
): boolean {
  return emailVerified || profileEmailVerified === true;
}

/**
 * Check if phone is verified
 * 
 * @param profile - Vendor profile object
 * @returns boolean - true if phone is verified
 */
export function isPhoneVerified(profile: VendorProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.phoneVerified === true || profile.phone_verified === true;
}

/**
 * Get overall verification progress
 * 
 * @param profile - Vendor profile object
 * @param emailVerified - Firebase email verification status
 * @returns Object with verification counts and percentage
 */
export function getVerificationProgress(
  profile: VendorProfile | null | undefined,
  emailVerified: boolean
): {
  completed: number;
  total: number;
  percentage: number;
  items: {
    email: boolean;
    phone: boolean;
    documents: boolean;
    business: boolean;
  };
} {
  const items = {
    email: isEmailVerified(emailVerified, profile?.emailVerified),
    phone: isPhoneVerified(profile),
    documents: isDocumentVerified(profile),
    business: profile?.businessVerified === true || profile?.business_verified === true
  };

  const completed = Object.values(items).filter(Boolean).length;
  const total = Object.keys(items).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    percentage,
    items
  };
}

/**
 * Get verification status badge color
 * 
 * @param status - Verification status
 * @returns Tailwind CSS color classes
 */
export function getVerificationBadgeColor(status: 'verified' | 'pending' | 'not_verified'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'verified':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      };
    case 'pending':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200'
      };
    case 'not_verified':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      };
  }
}

/**
 * Get document verification status
 * 
 * @param documents - Array of vendor documents
 * @returns Object with counts and status
 */
export function getDocumentVerificationStatus(documents: VendorDocument[] | undefined): {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  hasApproved: boolean;
  allApproved: boolean;
} {
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      hasApproved: false,
      allApproved: false
    };
  }

  const approved = documents.filter(doc => doc.status === 'approved').length;
  const pending = documents.filter(doc => doc.status === 'pending').length;
  const rejected = documents.filter(doc => doc.status === 'rejected').length;

  return {
    total: documents.length,
    approved,
    pending,
    rejected,
    hasApproved: approved > 0,
    allApproved: approved === documents.length && documents.length > 0
  };
}

/**
 * Check if vendor can accept bookings
 * 
 * @param profile - Vendor profile object
 * @param emailVerified - Firebase email verification status
 * @returns boolean - true if vendor can accept bookings
 */
export function canAcceptBookings(
  profile: VendorProfile | null | undefined,
  emailVerified: boolean
): boolean {
  if (!profile) return false;

  const verificationStatus = getBusinessVerificationStatus(profile);
  const emailOk = isEmailVerified(emailVerified, profile.emailVerified);

  // Vendor can accept bookings if:
  // 1. Business is verified OR pending (admins may allow pending vendors)
  // 2. Email is verified
  return (
    (verificationStatus.status === 'verified' || verificationStatus.status === 'pending') &&
    emailOk
  );
}

/**
 * Get verification requirements message
 * 
 * @param profile - Vendor profile object
 * @param emailVerified - Firebase email verification status
 * @returns Array of missing verification items
 */
export function getVerificationRequirements(
  profile: VendorProfile | null | undefined,
  emailVerified: boolean
): string[] {
  const requirements: string[] = [];

  if (!isEmailVerified(emailVerified, profile?.emailVerified)) {
    requirements.push('Verify your email address');
  }

  if (!isPhoneVerified(profile)) {
    requirements.push('Verify your phone number');
  }

  if (!isDocumentVerified(profile)) {
    requirements.push('Upload and verify business documents');
  }

  if (profile?.business_verified !== true) {
    requirements.push('Complete business verification');
  }

  return requirements;
}
