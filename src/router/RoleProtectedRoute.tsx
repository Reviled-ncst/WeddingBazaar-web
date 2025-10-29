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
    // Determine actual user role - trust the backend role field
    let actualRole = user.role;
    
    // SAFETY: If role is missing, check for user_type field (backend inconsistency)
    if (!actualRole && (user as any).user_type) {
      actualRole = (user as any).user_type;
    }
    
    // SAFETY: If role is still missing, use 'couple' as default
    if (!actualRole) {
      actualRole = 'couple';
    }
    
    // If user's role is not in allowed roles, redirect them to their correct landing page
    if (!allowedRoles.includes(actualRole)) {
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
