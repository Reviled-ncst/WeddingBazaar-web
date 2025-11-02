/**
 * Coordinator API Service
 * Connects frontend coordinator pages to backend APIs
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const createAuthRequest = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// ==================== Dashboard APIs ====================

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/dashboard/stats`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentActivity = async (limit = 20) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/dashboard/activity?limit=${limit}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

// ==================== Weddings APIs ====================

export const getAllWeddings = async (filters?: { status?: string; limit?: number; offset?: number }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await axios.get(
      `${API_URL}/api/coordinator/weddings?${params.toString()}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weddings:', error);
    throw error;
  }
};

export const getWeddingDetails = async (weddingId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/weddings/${weddingId}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching wedding details:', error);
    throw error;
  }
};

export const createWedding = async (weddingData: {
  user_id?: string;
  couple_names: string;
  couple_email?: string;
  couple_phone?: string;
  event_date: string;
  venue: string;
  venue_address?: string;
  guest_count?: number;
  budget?: number;
  preferred_style?: string;
  notes?: string;
  create_default_milestones?: boolean;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/coordinator/weddings`,
      weddingData,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating wedding:', error);
    throw error;
  }
};

export const updateWedding = async (weddingId: string, updates: any) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/coordinator/weddings/${weddingId}`,
      updates,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating wedding:', error);
    throw error;
  }
};

export const deleteWedding = async (weddingId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/coordinator/weddings/${weddingId}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting wedding:', error);
    throw error;
  }
};

// ==================== Milestones APIs ====================

export const getWeddingMilestones = async (weddingId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/weddings/${weddingId}/milestones`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }
};

export const createMilestone = async (weddingId: string, milestoneData: {
  title: string;
  description?: string;
  due_date?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/coordinator/weddings/${weddingId}/milestones`,
      milestoneData,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating milestone:', error);
    throw error;
  }
};

export const updateMilestone = async (milestoneId: string, updates: any) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/coordinator/milestones/${milestoneId}`,
      updates,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

export const toggleMilestoneCompletion = async (milestoneId: string, completed: boolean) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/coordinator/milestones/${milestoneId}/complete`,
      { completed },
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling milestone completion:', error);
    throw error;
  }
};

export const deleteMilestone = async (milestoneId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/coordinator/milestones/${milestoneId}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};

// ==================== Vendor Assignment APIs ====================

export const getWeddingVendors = async (weddingId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/weddings/${weddingId}/vendors`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching wedding vendors:', error);
    throw error;
  }
};

export const assignVendorToWedding = async (weddingId: string, vendorData: {
  vendor_id: string;
  service_type: string;
  notes?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/coordinator/weddings/${weddingId}/vendors`,
      vendorData,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning vendor:', error);
    throw error;
  }
};

export const updateVendorAssignment = async (assignmentId: string, updates: {
  status?: string;
  notes?: string;
}) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/coordinator/assignments/${assignmentId}/status`,
      updates,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating vendor assignment:', error);
    throw error;
  }
};

export const removeVendorAssignment = async (assignmentId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/coordinator/assignments/${assignmentId}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error removing vendor assignment:', error);
    throw error;
  }
};

export const getVendorRecommendations = async (filters?: {
  wedding_id?: string;
  service_type?: string;
  budget_min?: number;
  budget_max?: number;
  location?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.wedding_id) params.append('wedding_id', filters.wedding_id);
    if (filters?.service_type) params.append('service_type', filters.service_type);
    if (filters?.budget_min) params.append('budget_min', filters.budget_min.toString());
    if (filters?.budget_max) params.append('budget_max', filters.budget_max.toString());
    if (filters?.location) params.append('location', filters.location);

    const response = await axios.get(
      `${API_URL}/api/coordinator/vendor-recommendations?${params.toString()}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor recommendations:', error);
    throw error;
  }
};

// ==================== Clients APIs ====================

export const getAllClients = async (filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await axios.get(
      `${API_URL}/api/coordinator/clients?${params.toString()}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getClientDetails = async (userId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/clients/${userId}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

export const createClient = async (clientData: {
  couple_name: string;
  email: string;
  phone?: string;
  wedding_date?: string;
  venue?: string;
  budget_range?: string;
  preferred_style?: string;
  guest_count?: number;
  notes?: string;
  status?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/coordinator/clients`,
      clientData,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

export const updateClient = async (clientId: string, updates: {
  couple_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  budget_range?: string;
  preferred_style?: string;
  notes?: string;
  last_contact?: string;
}) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/coordinator/clients/${clientId}`,
      updates,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

export const deleteClient = async (clientId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/coordinator/clients/${clientId}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

export const addClientNote = async (userId: string, noteData: {
  wedding_id: string;
  note_text: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/coordinator/clients/${userId}/notes`,
      noteData,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error adding client note:', error);
    throw error;
  }
};

export const getClientCommunication = async (userId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/clients/${userId}/communication`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching client communication:', error);
    throw error;
  }
};

export const getClientStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/clients/stats`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching client stats:', error);
    throw error;
  }
};

// ==================== Vendor Network APIs ====================

export const getVendorNetwork = async (filters?: {
  category?: string;
  rating_min?: number;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.rating_min) params.append('rating_min', filters.rating_min.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await axios.get(
      `${API_URL}/api/coordinator/vendor-network?${params.toString()}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor network:', error);
    throw error;
  }
};

export const addVendorToNetwork = async (vendorData: {
  vendor_id: string;
  is_preferred?: boolean;
  coordinator_rating?: number;
  private_notes?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/coordinator/vendor-network`,
      vendorData,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error adding vendor to network:', error);
    throw error;
  }
};

export const updateNetworkVendor = async (networkId: string, updates: {
  is_preferred?: boolean;
  coordinator_rating?: number;
  private_notes?: string;
}) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/coordinator/vendor-network/${networkId}`,
      updates,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating network vendor:', error);
    throw error;
  }
};

export const removeVendorFromNetwork = async (networkId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/coordinator/vendor-network/${networkId}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error removing vendor from network:', error);
    throw error;
  }
};

export const getVendorPerformance = async (networkId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/vendor-network/${networkId}/performance`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor performance:', error);
    throw error;
  }
};

export const getPreferredVendors = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/vendor-network/preferred`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching preferred vendors:', error);
    throw error;
  }
};

// ==================== Commissions APIs ====================

export const getAllCommissions = async (filters?: {
  status?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await axios.get(
      `${API_URL}/api/coordinator/commissions?${params.toString()}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching commissions:', error);
    throw error;
  }
};

export const getCommissionSummary = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/commissions/summary`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching commission summary:', error);
    throw error;
  }
};

export const getPendingCommissions = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/coordinator/commissions/pending`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching pending commissions:', error);
    throw error;
  }
};

export const exportCommissions = async (filters?: {
  start_date?: string;
  end_date?: string;
  format?: 'json' | 'csv';
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.format) params.append('format', filters.format);

    const response = await axios.get(
      `${API_URL}/api/coordinator/commissions/export?${params.toString()}`,
      createAuthRequest()
    );
    return response.data;
  } catch (error) {
    console.error('Error exporting commissions:', error);
    throw error;
  }
};

// Export all services
export default {
  // Dashboard
  getDashboardStats,
  getRecentActivity,
  
  // Weddings
  getAllWeddings,
  getWeddingDetails,
  createWedding,
  updateWedding,
  deleteWedding,
  
  // Milestones
  getWeddingMilestones,
  createMilestone,
  updateMilestone,
  toggleMilestoneCompletion,
  deleteMilestone,
  
  // Vendor Assignment
  getWeddingVendors,
  assignVendorToWedding,
  updateVendorAssignment,
  removeVendorAssignment,
  getVendorRecommendations,
  
  // Clients
  getAllClients,
  getClientDetails,
  createClient,
  updateClient,
  deleteClient,
  addClientNote,
  getClientCommunication,
  getClientStats,
  
  // Vendor Network
  getVendorNetwork,
  addVendorToNetwork,
  updateNetworkVendor,
  removeVendorFromNetwork,
  getVendorPerformance,
  getPreferredVendors,
  
  // Commissions
  getAllCommissions,
  getCommissionSummary,
  getPendingCommissions,
  exportCommissions
};
