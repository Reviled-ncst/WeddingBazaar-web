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
    console.log('🔄 ProtectedRoute: User is authenticated, redirecting from public route');
    console.log('🔄 User object:', user);
    console.log('🔄 User role:', JSON.stringify(user?.role));
    const userRedirect = redirectTo || getUserLandingPage(user?.role);
    console.log('🔄 Final redirect URL:', userRedirect);
    return <Navigate to={userRedirect} replace />;
  }

  return <>{children}</>;
};

// Helper function to get the appropriate landing page based on user role
const getUserLandingPage = (role?: string): string => {
  console.log('🚦 getUserLandingPage called with role:', JSON.stringify(role), 'type:', typeof role);
  
  switch (role) {
    case 'couple':
      console.log('✅ Routing to /individual for couple');
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
