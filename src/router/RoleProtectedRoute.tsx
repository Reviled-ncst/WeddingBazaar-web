import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/HybridAuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requireAuth?: boolean;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requireAuth = true
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

  // If user is authenticated, check role permissions
  if (isAuthenticated && user) {
    // DEBUG: Log the complete user object structure
    console.log('🔧 [RoleProtectedRoute] Complete user object:', JSON.stringify(user, null, 2));
    console.log('🔧 [RoleProtectedRoute] User keys:', Object.keys(user || {}));
    console.log('🔧 [RoleProtectedRoute] User.role specifically:', user.role, 'type:', typeof user.role);
    
    // Enhanced vendor detection with detailed logging
    const hasBusinessName = !!user?.businessName;
    const hasVendorId = !!user?.vendorId;
    const hasVendorIdPattern = user?.id && user.id.startsWith('2-2025-');
    const hasVendorEmailPattern = user?.email && (
      user.email.includes('vendor') || 
      user.email.includes('business') || 
      user.email.includes('company')
    );
    const isVendorByProperties = hasBusinessName || hasVendorId || hasVendorIdPattern || hasVendorEmailPattern;
    
    // Determine actual user role with fallback logic
    let actualRole = user.role;
    
    // SAFETY: If role is missing but user has vendor properties, set as vendor
    if (!actualRole && isVendorByProperties) {
      actualRole = 'vendor';
      console.log('🔧 [RoleProtectedRoute] Role missing, detected vendor by properties');
    }
    
    // SAFETY: If role is still missing, check for user_type field (backend inconsistency)
    if (!actualRole && (user as any).user_type) {
      actualRole = (user as any).user_type;
      console.log('🔧 [RoleProtectedRoute] Using user_type field:', actualRole);
    }
    
    // Apply vendor detection override
    if (isVendorByProperties && actualRole !== 'vendor') {
      actualRole = 'vendor';
      console.log('🔧 [RoleProtectedRoute] Override role to vendor based on properties');
    }
    
    console.log('🔒 [RoleProtectedRoute] Role check:', {
      requestedRoles: allowedRoles,
      userRole: user.role,
      actualRole,
      isVendorByProperties,
      allowed: allowedRoles.includes(actualRole)
    });
    
    // If user's role is not in allowed roles, redirect them to their correct landing page
    if (!allowedRoles.includes(actualRole)) {
      console.log('🚫 [RoleProtectedRoute] Access denied, redirecting to correct landing page');
      
      switch (actualRole) {
        case 'vendor':
          return <Navigate to="/vendor" replace />;
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'couple':
        default:
          return <Navigate to="/individual" replace />;
      }
    }
  }

  return <>{children}</>;
};
