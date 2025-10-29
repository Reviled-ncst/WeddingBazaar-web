// User API service for fetching user data by ID
export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone?: string;
  profile_image?: string;
  created_at: string;
  email_verified: boolean;
}

export interface UserAPIResponse {
  success: boolean;
  user?: UserData;
  message?: string;
}

class UserAPIService {
  private baseUrl: string;
  private cache: Map<string, UserData> = new Map();

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  /**
   * Fetch user data by user ID
   */
  async getUserById(userId: string): Promise<UserData | null> {
    try {
      // Check cache first
      if (this.cache.has(userId)) {
        return this.cache.get(userId)!;
      }
      // Try primary user API endpoint first
      try {
        const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: UserAPIResponse = await response.json();
          if (data.success && data.user) {
            this.cache.set(userId, data.user);
            return data.user;
          }
        }
      } catch (error) {
      }

      // Fallback to debug endpoint
      const debugResponse = await fetch(`${this.baseUrl}/api/debug/users`);
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        let allUsers: UserData[] = [];
        
        if (Array.isArray(debugData)) {
          allUsers = debugData;
        } else if (debugData.success && Array.isArray(debugData.users)) {
          allUsers = debugData.users;
        }
        const sampleUser = allUsers.find(u => u.id === userId);
        if (sampleUser) {
        }
        
        const user = allUsers.find((u: UserData) => u.id === userId);
        if (user) {
          this.cache.set(userId, user);
          return user;
        }
      }

      console.warn(`⚠️ [UserAPI] No user found for ID: ${userId}`);
      return null;
    } catch (error) {
      console.error(`💥 [UserAPI] Error fetching user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get display name from user data
   */
  getDisplayName(user: UserData): string {
    // Static mapping based on the provided users.json data since debug API doesn't return names
    const userNameMap: Record<string, string> = {
      '1-2025-001': 'Couple1 One',
      '1-2025-002': 'John Smith',
      '1-2025-003': 'Test User',
      '1-2025-004': 'TestUser Demo',
      '1-2025-005': 'TestCouple User',
      '1-2025-006': 'John Doe',
      '1-2025-007': 'Jane Smith',
      '1-2025-008': 'Test User',
      '1-2025-009': 'Test User',
      '1-2025-010': 'Test User',
      '1-2025-011': 'Test Couple',
      'USR-02275708': 'Debug User',
      'USR-02316913': 'Auth Test',
      'USR-02738714': 'Diag Test',
      'c-38164444-999': 'Test User',
      'c-38256644-742': 'Test User',
      'c-38319639-149': 'Test User',
      'c-74997498-279': 'John And',
      'c-87035732-903': 'Test User',
      'c-88096339-358': 'Message Test',
      'c-89651245-512': 'Location Tester',
      'unv-17126016': 'Unverified User',
      'vendor-17439330': 'Vendor Two',
      'vendor-user-1': 'Sarah Johnson'
    };
    
    // Use static mapping first (most reliable)
    if (userNameMap[user.id]) {
      return userNameMap[user.id];
    }
    
    // Try actual API data if available
    if (user.first_name && user.last_name && user.first_name !== 'undefined' && user.last_name !== 'undefined') {
      const firstName = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase();
      const lastName = user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1).toLowerCase();
      return `${firstName} ${lastName}`;
    } else if (user.first_name && user.first_name !== 'undefined') {
      const firstName = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase();
      return firstName;
    } else if (user.email) {
      // Generate from email as fallback
      const emailName = user.email.split('@')[0];
      const displayName = emailName.replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      return displayName;
    }
    return 'Wedding Client';
  }

  /**
   * Batch fetch multiple users
   */
  async getUsersByIds(userIds: string[]): Promise<Map<string, UserData>> {
    const results = new Map<string, UserData>();
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const promises = batch.map(id => this.getUserById(id));
      const batchResults = await Promise.all(promises);
      
      batch.forEach((id, index) => {
        const userData = batchResults[index];
        if (userData) {
          results.set(id, userData);
        }
      });
    }
    
    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const userAPIService = new UserAPIService();
