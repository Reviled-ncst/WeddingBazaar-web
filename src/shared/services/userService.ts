export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor' | 'admin';
  phone?: string;
  profileImage?: string;
  // Additional profile fields
  location?: string;
  bio?: string;
  weddingDate?: string;
  partnerName?: string;
  interests?: string[];
  budget?: number;
  guestCount?: number;
  venues?: string[];
  createdAt?: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      vendorMessages: boolean;
      marketing: boolean;
    };
    privacy: {
      profilePublic: boolean;
      showWeddingDate: boolean;
    };
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  weddingDate?: string;
  partnerName?: string;
  interests?: string[];
  budget?: number;
  guestCount?: number;
  venues?: string[];
  preferences?: UserProfile['preferences'];
}

interface ProfileResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export class UserService {
  private readonly apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  async getUserProfile(userId: string): Promise<UserProfile> {
    console.log('🔧 UserService: getUserProfile called with userId:', userId);
    
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔑 UserService: Auth token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${this.apiUrl}/users/profile/${userId}`;
      console.log('📡 UserService: Making API call to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 UserService: Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UserService: API error response:', errorText);
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }

      const data: ProfileResponse = await response.json();
      console.log('✅ UserService: API response data:', data);
      
      if (!data.success || !data.user) {
        console.error('❌ UserService: Invalid response structure:', data);
        throw new Error(data.error || 'Failed to fetch user profile');
      }

      console.log('🎯 UserService: Returning user profile:', data.user);
      return data.user;

    } catch (error) {
      console.error('❌ UserService: Error in getUserProfile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updateData: UpdateProfileData): Promise<UserProfile> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.apiUrl}/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      const data: ProfileResponse = await response.json();
      
      if (!data.success || !data.user) {
        throw new Error(data.error || 'Failed to update user profile');
      }

      return data.user;

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
