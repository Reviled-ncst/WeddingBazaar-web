import axios from 'axios';
import type {
  BookingReport,
  AdminBookingReportView,
  SubmitReportRequest,
  UpdateReportStatusRequest,
  ReportFilters,
  ReportStatistics
} from '../types/booking-reports.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const bookingReportsService = {
  // ==================== COUPLE & VENDOR ENDPOINTS ====================
  
  /**
   * Submit a new booking report
   */
  async submitReport(data: SubmitReportRequest): Promise<{ success: boolean; report: BookingReport; message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/booking-reports/submit`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error submitting report:', error);
      throw new Error(error.response?.data?.error || 'Failed to submit report');
    }
  },

  /**
   * Get reports for a specific user (vendor or couple)
   */
  async getMyReports(userId: string, filters?: ReportFilters): Promise<{
    success: boolean;
    reports: BookingReport[];
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.report_type) params.append('report_type', filters.report_type);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(
        `${API_BASE_URL}/api/booking-reports/my-reports/${userId}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user reports:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch reports');
    }
  },

  /**
   * Get reports for a specific booking
   */
  async getBookingReports(bookingId: string): Promise<{ success: boolean; reports: BookingReport[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/booking-reports/booking/${bookingId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching booking reports:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch booking reports');
    }
  },

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all reports (admin only)
   */
  async getAllReports(filters?: ReportFilters): Promise<{
    success: boolean;
    reports: AdminBookingReportView[];
    statistics: ReportStatistics;
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.reporter_type) params.append('reporter_type', filters.reporter_type);
      if (filters?.report_type) params.append('report_type', filters.report_type);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await axios.get(
        `${API_BASE_URL}/api/booking-reports/admin/all?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching admin reports:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch reports');
    }
  },

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(
    reportId: string,
    data: UpdateReportStatusRequest
  ): Promise<{ success: boolean; report: BookingReport; message: string }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/booking-reports/admin/${reportId}/status`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating report status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update report status');
    }
  },

  /**
   * Update report priority (admin only)
   */
  async updateReportPriority(
    reportId: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): Promise<{ success: boolean; report: BookingReport; message: string }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/booking-reports/admin/${reportId}/priority`,
        { priority }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating report priority:', error);
      throw new Error(error.response?.data?.error || 'Failed to update report priority');
    }
  },

  /**
   * Delete report (admin only)
   */
  async deleteReport(reportId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/booking-reports/admin/${reportId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting report:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete report');
    }
  }
};
