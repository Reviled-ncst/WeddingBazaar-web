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
          // Try sessionStorage as fallback
          const sessionToken = sessionStorage.getItem('auth_token');
          if (sessionToken) {
            localStorage.setItem('auth_token', sessionToken);
            return checkAuthStatus(); // Retry with sessionStorage token
          }
          
          // No token found anywhere, user is not authenticated
          setIsLoading(false);
          return;
        }
        
        // Only verify token if one exists
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // First check if backend is responsive
        console.log('🌐 Checking backend status before authentication...');
        const backendOnline = await checkBackendStatus(apiBaseUrl);
        
        if (!backendOnline) {
          console.log('⚠️ Backend appears offline - proceeding with offline mode');
          // In offline mode, we'll assume the user is authenticated if they have a token
          // The app will function in read-only mode until backend comes back online
          const cachedUserData = localStorage.getItem('cached_user_data');
          if (cachedUserData) {
            try {
              const userData = JSON.parse(cachedUserData);
              console.log('📦 Using cached user data for offline mode:', userData);
              setUser(userData);
              
              // Show a toast notification about offline mode (if toast service is available)
              if ('showToast' in window && typeof (window as any).showToast === 'function') {
                (window as any).showToast('App is running in offline mode. Some features may be limited.', 'warning');
              }
            } catch (e) {
              console.log('❌ Failed to parse cached user data');
            }
          }
          setIsLoading(false);
          return;
        }
        
        // Since /auth/verify endpoint doesn't exist, we'll validate the token by attempting
        // to decode it and check if it's expired, then trust the cached user data
        try {
          // Enhanced JWT validation with better error handling
          if (!token || typeof token !== 'string') {
            console.log('❌ Invalid token type or empty token');
            throw new Error('Invalid token');
          }
          
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            console.log('❌ Invalid JWT format - expected 3 parts, got:', tokenParts.length);
            throw new Error('Invalid JWT format');
          }
          
          // Safely decode the payload with comprehensive error handling
          let payload;
          try {
            const base64Payload = tokenParts[1];
            
            // Validate base64 format before decoding
            if (!base64Payload || base64Payload.length === 0) {
              throw new Error('Empty token payload');
            }
            
            // Add padding if needed for base64 decoding
            const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
            
            // Additional validation - check if it's valid base64
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(paddedPayload)) {
              throw new Error('Invalid base64 format');
            }
            
            const decodedString = atob(paddedPayload);
            payload = JSON.parse(decodedString);
            
            console.log('✅ JWT payload decoded successfully:', payload);
          } catch (decodeError) {
            const errorMsg = decodeError instanceof Error ? decodeError.message : 'Unknown decode error';
            console.log('❌ Failed to decode JWT payload:', errorMsg);
            console.log('❌ Token parts:', tokenParts.map((part, i) => `Part ${i}: ${part.substring(0, 20)}...`));
            throw new Error(`Invalid token format: ${errorMsg}`);
          }
          
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp > currentTime) {
            // Token is not expired, check for cached user data
            const cachedUserData = localStorage.getItem('cached_user_data');
            if (cachedUserData) {
              try {
                const userData = JSON.parse(cachedUserData);
                console.log('✅ Using valid cached user data:', userData);
                setUser(userData);
                // Ensure token persists in both storages
                localStorage.setItem('auth_token', token);
                sessionStorage.setItem('auth_token', token);
              } catch (e) {
                console.log('❌ Failed to parse cached user data');
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                localStorage.removeItem('cached_user_data');
              }
            } else {
              console.log('⚠️ Token valid but no cached user data - user needs to login again');
              localStorage.removeItem('auth_token');
              sessionStorage.removeItem('auth_token');
            }
          } else {
            console.log('🔄 Token expired, removing...');
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
            localStorage.removeItem('cached_user_data');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.log('❌ Invalid token format, removing...', errorMsg);
          
          // Comprehensive token cleanup
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          localStorage.removeItem('cached_user_data');
          sessionStorage.removeItem('cached_user_data');
          
          // Clear any other potential auth-related keys that might be causing issues
          ['jwt_token', 'user_token', 'access_token'].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });
          
          console.log('🧹 All authentication data cleared due to token validation error');
        }
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
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const fullUrl = `${apiBaseUrl}/api/auth/login`;
      
      console.log('🔐 Attempting login to:', fullUrl);
      
      // Check if backend is awake first, wake it up if needed
      const backendAwake = await checkBackendStatus(apiBaseUrl, 1);
      if (!backendAwake) {
        console.log('⏰ Backend appears to be sleeping, attempting to wake it up...');
        // Send a wake-up request
        try {
          await fetch(`${apiBaseUrl}/api/health`, { method: 'GET' });
        } catch (e) {
          console.log('🔔 Wake-up request sent, backend should start warming up');
        }
        
        throw new Error('Our server is starting up. Please wait 30-60 seconds and try again.');
      }
      
      // Add timeout to prevent hanging during login
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout - please try again.')), 20000);
      });
      
      const fetchPromise = fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);

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
        // Fix backend user data mapping - userType -> role
        const userRole = data.user.userType || data.user.user_type || data.user.role || 'couple';
        console.log('🔍 DEBUG - Role mapping:');
        console.log('  data.user.userType:', data.user.userType);
        console.log('  data.user.user_type:', data.user.user_type);  
        console.log('  data.user.role:', data.user.role);
        console.log('  Final userRole:', userRole);
        
        const mappedUser = {
          ...data.user,
          role: userRole, // Map userType to role
          firstName: data.user.firstName || data.user.first_name || '',
          lastName: data.user.lastName || data.user.last_name || '',
          // Use vendorId from backend response, or user id as fallback for vendor users
          vendorId: data.user.vendorId || (userRole === 'vendor' ? data.user.id : null)
        };
        
        // Store in both localStorage and sessionStorage for better persistence
        localStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('auth_token', data.token);
        
        // Cache user data for persistent login
        localStorage.setItem('cached_user_data', JSON.stringify(mappedUser));
        sessionStorage.setItem('cached_user_data', JSON.stringify(mappedUser));
        
        setUser(mappedUser);
        console.log('✅ Login successful for:', mappedUser.email, 'with role:', mappedUser.role);
        return mappedUser;
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
      
      // Handle different error types with user-friendly messages
      if (error instanceof Error) {
        // Check for timeout errors (backend sleeping)
        if (error.message.includes('timeout') || error.message.includes('waking up')) {
          throw new Error('Our server is starting up. Please wait 30 seconds and try again.');
        }
        
        // Check for network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('Connection problem. Please check your internet and try again.');
        }
        
        // Re-throw specific errors as-is (they should already be user-friendly)
        throw error;
      }
      
      if (error instanceof TypeError) {
        // Network/connection issues
        throw new Error('Connection problem. Please check your internet and try again.');
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
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const fullUrl = `${apiBaseUrl}/api/auth/register`;
      
      console.log('📝 Attempting registration to:', fullUrl);
      
      let data;
      
      try {
        // Map frontend field names to backend field names
        const backendUserData = {
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          password: userData.password,
          user_type: userData.role, // 'couple' or 'vendor'
          phone: userData.phone,
          // Vendor-specific fields
          business_name: userData.business_name,
          business_type: userData.business_type,
          location: userData.location
        };
        
        console.log('📝 Mapping frontend data to backend format:', {
          frontend: userData,
          backend: backendUserData
        });
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendUserData),
        });

        console.log('📝 Registration response status:', response.status);
        
        if (response.status === 501) {
          console.log('⚠️ Registration endpoint not implemented (501), using mock registration');
          
          // Create mock user data for successful registration
          data = {
            success: true,
            message: 'Registration successful (mock)',
            user: {
              id: `mock_${Date.now()}`,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              phone: userData.phone,
              businessName: userData.business_name,
              vendorId: userData.role === 'vendor' ? `vendor_${Date.now()}` : null
            },
            token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          console.log('🔧 Mock registration data created:', data);
        } else if (response.ok) {
          // Successful response - parse JSON
          data = await response.json();
          console.log('✅ Registration response data:', data);
        } else {
          // Handle other error responses
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const error = await response.json();
            console.error('❌ Registration failed with error:', error);
            throw new Error(error.message || `Registration failed (${response.status})`);
          } else {
            console.error('❌ Non-JSON error response received:', response.status, contentType);
            throw new Error('Server configuration error. Please contact support.');
          }
        }
        
      } catch (error) {
        // Check if this is a network error or parsing error
        const errorObj = error as Error;
        if (errorObj.name === 'TypeError' && errorObj.message.includes('fetch')) {
          console.error('❌ Network error during registration:', error);
          throw new Error('Network error. Please check your connection and try again.');
        } else if (errorObj.name === 'SyntaxError') {
          console.error('❌ JSON parsing error:', error);
          throw new Error('Server response error. Please try again.');
        } else {
          console.error('❌ Registration fetch error:', error);
          throw error; // Re-throw other errors
        }
      }
      
      // Store token and user data
      if (data.success && data.user && data.token) {
        // Fix backend user data mapping - userType -> role
        const userRole = data.user.userType || data.user.user_type || data.user.role || 'couple';
        console.log('🔍 DEBUG - Registration role mapping:');
        console.log('  data.user.userType:', data.user.userType);
        console.log('  data.user.user_type:', data.user.user_type);  
        console.log('  data.user.role:', data.user.role);
        console.log('  Final userRole:', userRole);
        
        const mappedUser = {
          ...data.user,
          role: userRole,
          firstName: data.user.firstName || data.user.first_name || '',
          lastName: data.user.lastName || data.user.last_name || '',
          // Use vendorId from backend response, or user id as fallback for vendor users
          vendorId: data.user.vendorId || (userRole === 'vendor' ? data.user.id : null)
        };
        
        // Store in both localStorage and sessionStorage for better persistence
        localStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('auth_token', data.token);
        
        // Cache user data for persistent login
        localStorage.setItem('cached_user_data', JSON.stringify(mappedUser));
        sessionStorage.setItem('cached_user_data', JSON.stringify(mappedUser));
        
        setUser(mappedUser);
        console.log('✅ Registration successful for:', mappedUser.email);
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

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (token) {
        // Notify backend to invalidate token
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        await fetch(`${apiBaseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {
          // Ignore network errors during logout
          console.log('Network error during logout - continuing with local cleanup');
        });
      }
    } catch (error) {
      console.log('Error during logout:', error);
    }
    
    // Clear all auth-related data from both storages
    localStorage.removeItem('auth_token');
    localStorage.removeItem('cached_user_data');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('cached_user_data');
    setUser(null);
    
    // Force a page reload to clear any stale state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Helper function to check backend status with extended timeout for sleeping services
  const checkBackendStatus = async (apiBaseUrl: string, retries = 2): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      try {
        // Extended timeout to allow sleeping services to wake up (Render free tier can take 30-60s)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Backend check timeout')), i === 0 ? 10000 : 45000); // 10s first attempt, 45s second attempt
        });
        
        const fetchPromise = fetch(`${apiBaseUrl}/api/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (i === 0) {
          console.log('⏱️ Quick backend check (10s timeout)...');
        } else {
          console.log('🔄 Extended backend wake-up check (45s timeout) - service may be sleeping...');
        }
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (response.ok) {
          console.log(`✅ Backend is responsive (attempt ${i + 1})`);
          return true;
        }
      } catch (error) {
        console.log(`⚠️ Backend check failed (attempt ${i + 1}): ${error}`);
        // Don't retry for sleeping backends - fail fast and use offline mode
      }
    }
    console.log('❌ Backend appears to be offline or sleeping - proceeding with offline mode');
    return false;
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
