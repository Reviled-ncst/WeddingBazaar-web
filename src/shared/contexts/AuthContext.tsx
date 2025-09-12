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
        if (token) {
          // Validate token with backend
          const apiUrl = import.meta.env.VITE_API_URL || 'https://wedding-bazaar-backend.onrender.com/api';
          const response = await fetch(`${apiUrl}/auth/verify`, {
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
          } else {
            console.error('❌ Token verification failed:', response.status, response.statusText);
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://wedding-bazaar-backend.onrender.com/api';
      const fullUrl = `${apiUrl}/auth/login`;
      
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
        throw new Error('Server configuration error. Please contact support.');
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Login failed with error:', error);
        throw new Error(error.message || `Server error (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Login response data:', data);
      
      // Only store token and user if login was successful
      if (data.success && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        console.log('✅ Login successful for:', data.user.email);
        return data.user;
      } else {
        throw new Error('Invalid login response from server');
      }
      
    } catch (error) {
      console.error('🔐 Login error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Re-throw with better error messages
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://wedding-bazaar-backend.onrender.com/api';
      const fullUrl = `${apiUrl}/auth/register`;
      
      console.log('📝 Attempting registration to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: `${userData.firstName} ${userData.lastName}`,
          userType: userData.role
        }),
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
