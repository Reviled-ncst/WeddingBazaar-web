import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor' | 'admin';
  profileImage?: string;
  phone?: string;
  businessName?: string;
  vendorId?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor';
  phone?: string;
  // Vendor-specific fields
  business_name?: string;
  business_type?: string;
  location?: string;
  receiveUpdates?: boolean;
  [key: string]: any; // Allow additional fields
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          // No token found, user is not authenticated - this is normal for public pages
          setIsLoading(false);
          return;
        }
        
        // Only verify token if one exists
        const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiBaseUrl}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Token verification successful:', data);
          // Only set user if we get valid data back
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            console.log('❌ Invalid verify response:', data);
            localStorage.removeItem('auth_token');
          }
        } else if (response.status === 401) {
          // Token is invalid/expired - remove it silently (this is normal)
          console.log('🔄 Token expired or invalid, removing...');
          localStorage.removeItem('auth_token');
        } else {
          // Other errors (500, etc.)
          console.error('❌ Token verification failed:', response.status, response.statusText);
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        // Network errors, API unavailable, etc. - don't remove token immediately
        console.log('🌐 Auth verification failed (network/server issue):', error);
        // We keep the token in case it's just a temporary network issue
        // The token will be verified again when the user tries to access protected content
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // Don't set loading here - let the component handle its own loading state
      // setIsLoading(true);
      
      // Use environment-specific API URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
      const fullUrl = `${apiBaseUrl}/auth/login`;
      
      console.log('🔐 Attempting login to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔐 Login response status:', response.status);
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Non-JSON response received:', contentType);
        throw new Error('Server configuration error. Please contact support if this persists.');
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Login failed with error:', error);
        console.error('❌ Response status:', response.status, response.statusText);
        
        // User-friendly error messages based on status code
        let errorMessage = error.message || error.error || 'Something went wrong';
        
        switch (response.status) {
          case 400:
            errorMessage = 'Please check your email format and try again.';
            break;
          case 401:
            errorMessage = error.message || 'Incorrect email or password';
            break;
          case 403:
            errorMessage = 'Your account access is restricted. Please contact us for help.';
            break;
          case 404:
            errorMessage = 'Service not available. Please try again later.';
            break;
          case 429:
            errorMessage = 'Too many attempts. Please wait a few minutes and try again.';
            break;
          case 500:
            errorMessage = 'Our servers are having issues. Please try again in a few minutes.';
            break;
          case 502:
          case 503:
            errorMessage = 'We are updating our system. Please try again in a few minutes.';
            break;
          case 504:
            errorMessage = 'Connection is slow. Please check your internet and try again.';
            break;
          default:
            // Keep original message if it's user-friendly, otherwise use generic
            if (error.message && !error.message.includes('server') && !error.message.includes('status')) {
              errorMessage = error.message;
            } else {
              errorMessage = 'Something went wrong. Please try again.';
            }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Login response data:', data);
      
      // DEBUG: Check each condition separately
      console.log('🔍 DEBUG - Checking login response conditions:');
      console.log('  data.success:', data.success, typeof data.success);
      console.log('  data.user:', !!data.user, typeof data.user);
      console.log('  data.token:', !!data.token, typeof data.token);
      console.log('  All conditions met:', !!(data.success && data.user && data.token));
      
      // Only store token and user if login was successful
      if (data.success && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        console.log('✅ Login successful for:', data.user.email);
        return data.user;
      } else {
        console.error('❌ Login response validation failed');
        console.error('  Expected: success=true, user=object, token=string');
        console.error('  Received:', {
          success: data.success,
          user: data.user,
          token: data.token
        });
        throw new Error('Invalid login response from server');
      }
      
    } catch (error) {
      console.error('🔐 Login error:', error);
      
      // Simple, user-friendly error handling
      if (error instanceof TypeError) {
        // Network/connection issues
        throw new Error('Connection problem. Please check your internet and try again.');
      }
      
      // Re-throw the error as-is (it should already be user-friendly from above)
      if (error instanceof Error) {
        throw error;
      }
      
      // Handle unknown error types
      throw new Error('Something went wrong. Please try again.');
    } finally {
      // Don't set loading false here - let the component handle it
      // setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Use environment-specific API URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
      const fullUrl = `${apiBaseUrl}/auth/register`;
      
      console.log('📝 Attempting registration to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📝 Registration response status:', response.status);
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Non-JSON response received:', contentType);
        throw new Error('Server configuration error. Please contact support.');
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Registration failed with error:', error);
        throw new Error(error.message || `Registration failed (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Registration response data:', data);
      
      // Store token and user data
      if (data.success && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        console.log('✅ Registration successful for:', data.user.email);
      } else {
        throw new Error('Invalid registration response from server');
      }
      
    } catch (error) {
      console.error('📝 Registration error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Re-throw with better error messages
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data'); // In case there's any cached user data
    setUser(null);
    
    // Force a page reload to clear any stale state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
