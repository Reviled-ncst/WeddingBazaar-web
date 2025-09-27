import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/AuthContext';

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
    const userRedirect = redirectTo || getUserLandingPage(user?.role);
    return <Navigate to={userRedirect} replace />;
  }

  return <>{children}</>;
};

// Helper function to get the appropriate landing page based on user role
const getUserLandingPage = (role?: string): string => {
  switch (role) {
    case 'couple':
      return '/individual';
    case 'vendor':
      return '/vendor';
    case 'admin':
      return '/admin';
    default:
      return '/individual';
  }
};
