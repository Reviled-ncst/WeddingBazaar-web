// ============================================================================
// Wedding Bazaar - Vendor Wallet Service
// ============================================================================
// API service for vendor wallet and earnings management
// Handles wallet balance, transactions, withdrawals, and PayMongo integration
// ============================================================================

import type { 
  VendorWallet, 
  WalletTransaction, 
  WalletResponse, 
  WithdrawalRequest, 
  WithdrawalResponse,
  WalletFilters 
} from '../types/wallet.types';

const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

/**
 * Get vendor wallet summary with balance and statistics
 */
export const getVendorWallet = async (vendorId: string): Promise<WalletResponse> => {
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_URL}/api/wallet/${vendorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch wallet data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get wallet error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get wallet transactions with optional filters
 */
export const getWalletTransactions = async (
  vendorId: string,
  filters?: WalletFilters
): Promise<WalletResponse> => {
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.transaction_type) queryParams.append('transaction_type', filters.transaction_type);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.payment_method) queryParams.append('payment_method', filters.payment_method);
    if (filters?.service_category) queryParams.append('service_category', filters.service_category);
    if (filters?.min_amount) queryParams.append('min_amount', filters.min_amount.toString());
    if (filters?.max_amount) queryParams.append('max_amount', filters.max_amount.toString());
    
    const url = `${API_URL}/api/wallet/${vendorId}/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch transactions');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get transactions error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Request a withdrawal from available balance
 */
export const requestWithdrawal = async (
  vendorId: string,
  withdrawalData: {
    amount: number; // In centavos
    withdrawal_method: 'bank_transfer' | 'gcash' | 'paymaya' | 'check';
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    ewallet_number?: string;
    ewallet_name?: string;
    notes?: string;
  }
): Promise<WithdrawalResponse> => {
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_URL}/api/wallet/${vendorId}/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(withdrawalData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to request withdrawal');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Request withdrawal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get withdrawal history
 */
export const getWithdrawalHistory = async (vendorId: string): Promise<{
  success: boolean;
  withdrawals?: WithdrawalRequest[];
  error?: string;
}> => {
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_URL}/api/wallet/${vendorId}/withdrawals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch withdrawal history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get withdrawal history error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Cancel a pending withdrawal request
 */
export const cancelWithdrawal = async (
  vendorId: string,
  withdrawalId: string
): Promise<WithdrawalResponse> => {
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_URL}/api/wallet/${vendorId}/withdrawals/${withdrawalId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel withdrawal');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Cancel withdrawal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Export transactions to CSV
 */
export const exportTransactions = async (
  vendorId: string,
  filters?: WalletFilters
): Promise<Blob | null> => {
  try {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.transaction_type) queryParams.append('transaction_type', filters.transaction_type);
    if (filters?.status) queryParams.append('status', filters.status);
    
    const url = `${API_URL}/api/wallet/${vendorId}/export${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('❌ Export transactions error:', error);
    return null;
  }
};

/**
 * Download exported transactions as CSV file
 */
export const downloadTransactionsCSV = async (
  vendorId: string,
  filters?: WalletFilters
): Promise<boolean> => {
  try {
    const blob = await exportTransactions(vendorId, filters);
    
    if (!blob) {
      throw new Error('Failed to generate export file');
    }
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-transactions-${vendorId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('❌ Download CSV error:', error);
    return false;
  }
};
