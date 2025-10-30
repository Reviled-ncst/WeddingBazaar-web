/**
 * Wedding Coordinator API Service
 * 
 * Handles all API calls for Wedding Coordinator features
 * Connects frontend to backend coordinator endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const createHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API errors
const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  throw error;
};

// ============================================================================
// WEDDING MANAGEMENT API
// ============================================================================

export interface Wedding {
  id: string;
  coordinator_id: string;
  couple_name: string;
  couple_email?: string;
  couple_phone?: string;
  wedding_date: string;
  venue: string;
  venue_address?: string;
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  budget?: number;
  spent?: number;
  guest_count?: number;
  preferred_style?: string;
  notes?: string;
  vendors_booked?: number;
  milestones_completed?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWeddingData {
  couple_name: string;
  couple_email?: string;
  couple_phone?: string;
  wedding_date: string;
  venue: string;
  venue_address?: string;
  budget?: number;
  guest_count?: number;
  preferred_style?: string;
  notes?: string;
}

/**
 * Get all weddings for the logged-in coordinator
 */
export const getCoordinatorWeddings = async (): Promise<Wedding[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/weddings`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch weddings: ${response.statusText}`);
    }

    const data = await response.json();
    return data.weddings || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

/**
 * Get single wedding details
 */
export const getWeddingById = async (weddingId: string): Promise<Wedding | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/weddings/${weddingId}`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.wedding || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Create new wedding
 */
export const createWedding = async (weddingData: CreateWeddingData): Promise<Wedding | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/weddings`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(weddingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create wedding');
    }

    const data = await response.json();
    return data.wedding || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Update wedding details
 */
export const updateWedding = async (
  weddingId: string,
  updates: Partial<Wedding>
): Promise<Wedding | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/weddings/${weddingId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update wedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.wedding || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Delete wedding
 */
export const deleteWedding = async (weddingId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/weddings/${weddingId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete wedding: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// ============================================================================
// VENDOR NETWORK API
// ============================================================================

export interface CoordinatorVendor {
  id: string;
  coordinator_id: string;
  vendor_id: string;
  vendor_name?: string;
  vendor_category?: string;
  vendor_rating?: number;
  is_preferred: boolean;
  total_bookings: number;
  total_revenue: number;
  average_rating?: number;
  last_worked_with?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface AddVendorData {
  vendor_id: string;
  is_preferred?: boolean;
  notes?: string;
  tags?: string[];
}

/**
 * Get all vendors in coordinator's network
 */
export const getCoordinatorVendors = async (): Promise<CoordinatorVendor[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/vendors`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vendors: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vendors || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

/**
 * Add vendor to coordinator's network
 */
export const addVendorToNetwork = async (vendorData: AddVendorData): Promise<CoordinatorVendor | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/vendors`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add vendor');
    }

    const data = await response.json();
    return data.vendor || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Update vendor in network
 */
export const updateVendorInNetwork = async (
  vendorId: string,
  updates: Partial<CoordinatorVendor>
): Promise<CoordinatorVendor | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/vendors/${vendorId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update vendor: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vendor || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Remove vendor from network
 */
export const removeVendorFromNetwork = async (vendorId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/vendors/${vendorId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove vendor: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// ============================================================================
// CLIENT MANAGEMENT API
// ============================================================================

export interface CoordinatorClient {
  id: string;
  coordinator_id: string;
  wedding_id?: string;
  couple_name: string;
  email?: string;
  phone?: string;
  status: 'lead' | 'active' | 'completed' | 'inactive';
  last_contact?: string;
  preferred_style?: string;
  budget_range?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  couple_name: string;
  email?: string;
  phone?: string;
  wedding_id?: string;
  status?: string;
  preferred_style?: string;
  budget_range?: string;
  notes?: string;
}

/**
 * Get all clients for coordinator
 */
export const getCoordinatorClients = async (): Promise<CoordinatorClient[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/clients`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }

    const data = await response.json();
    return data.clients || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

/**
 * Create new client
 */
export const createClient = async (clientData: CreateClientData): Promise<CoordinatorClient | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/clients`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create client');
    }

    const data = await response.json();
    return data.client || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Update client details
 */
export const updateClient = async (
  clientId: string,
  updates: Partial<CoordinatorClient>
): Promise<CoordinatorClient | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/clients/${clientId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update client: ${response.statusText}`);
    }

    const data = await response.json();
    return data.client || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Delete client
 */
export const deleteClient = async (clientId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/clients/${clientId}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete client: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// ============================================================================
// STATISTICS API
// ============================================================================

export interface CoordinatorStats {
  total_weddings: number;
  active_weddings: number;
  completed_weddings: number;
  total_clients: number;
  total_vendors: number;
  total_revenue: number;
  total_commissions: number;
  average_progress: number;
}

/**
 * Get coordinator dashboard statistics
 */
export const getCoordinatorStats = async (): Promise<CoordinatorStats | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coordinator/stats`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data.stats || null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// Export all services
export const coordinatorApiService = {
  // Weddings
  getCoordinatorWeddings,
  getWeddingById,
  createWedding,
  updateWedding,
  deleteWedding,
  
  // Vendors
  getCoordinatorVendors,
  addVendorToNetwork,
  updateVendorInNetwork,
  removeVendorFromNetwork,
  
  // Clients
  getCoordinatorClients,
  createClient,
  updateClient,
  deleteClient,
  
  // Stats
  getCoordinatorStats,
};

export default coordinatorApiService;
