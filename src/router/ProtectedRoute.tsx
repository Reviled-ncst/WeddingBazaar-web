import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/HybridAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If route is public but user is authenticated, redirect to their landing page
  if (!requireAuth && isAuthenticated) {
    console.log('🔄 ProtectedRoute: User is authenticated, redirecting from public route');
    console.log('🔄 User object:', user);
    console.log('🔄 User role:', JSON.stringify(user?.role));
    const userRedirect = redirectTo || getUserLandingPage(user?.role, user);
    console.log('🔄 Final redirect URL:', userRedirect);
    return <Navigate to={userRedirect} replace />;
  }

  return <>{children}</>;
};

// Helper function to get the appropriate landing page based on user role
const getUserLandingPage = (role?: string, user?: any): string => {
  console.log('🚦 getUserLandingPage called with role:', JSON.stringify(role), 'type:', typeof role);
  console.log('🚦 getUserLandingPage user context:', { 
    id: user?.id, 
    email: user?.email, 
    businessName: user?.businessName,
    vendorId: user?.vendorId 
  });
  
  // ROLE MAPPING FIX: Handle backend role inconsistencies
  let normalizedRole = role;
  
  // Enhanced vendor detection with detailed logging - ONLY use SOLID vendor indicators
  const hasBusinessName = !!user?.businessName;
  const hasVendorId = !!user?.vendorId;
  const hasVendorIdPattern = user?.id && user.id.startsWith('2-2025-');
  
  // REMOVED: Email pattern check - users can have any email regardless of role
  // const hasVendorEmailPattern = user?.email && (user.email.includes('vendor') || ...)
  
  const isVendorByProperties = hasBusinessName || hasVendorId || hasVendorIdPattern;
  
  console.log('🔍 Vendor detection analysis:', {
    originalRole: role,
    hasBusinessName,
    hasVendorId,
    hasVendorIdPattern,
    isVendorByProperties,
    userId: user?.id,
    email: user?.email
  });
  
  // If user has vendor-like properties, treat as vendor regardless of role
  if (isVendorByProperties) {
    console.log('🔧 Role Detection: User has vendor properties, treating as vendor');
    normalizedRole = 'vendor';
  }
  
  // Handle potential backend role variations
  if (role === 'individual' && !user?.businessName) {
    normalizedRole = 'couple'; // individual users are couples in our system
  }
  
  console.log('🔄 Role mapping:', role, '=>', normalizedRole);
  
  switch (normalizedRole) {
    case 'couple':
    case 'individual': // Handle backend inconsistency
      console.log('✅ Routing to /individual for couple/individual');
      return '/individual';
    case 'vendor':
      console.log('✅ Routing to /vendor for vendor');
      return '/vendor';
    case 'admin':
      console.log('✅ Routing to /admin for admin');
      return '/admin';
    default:
      console.log('⚠️ Unknown role, defaulting to /individual. Role was:', JSON.stringify(role));
      return '/individual';
  }
};
