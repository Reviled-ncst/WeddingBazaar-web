// TypeScript types for booking reports

export interface BookingReport {
  id: string;
  booking_id: string;
  reported_by: string;
  reporter_type: 'vendor' | 'couple';
  report_type: ReportType;
  subject: string;
  description: string;
  cancellation_reason?: string; // NEW: Optional cancellation reason for disputes
  evidence_urls: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_review' | 'resolved' | 'dismissed';
  admin_notes?: string;
  admin_response?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export type ReportType = 
  | 'payment_issue'
  | 'service_issue'
  | 'communication_issue'
  | 'cancellation_dispute'
  | 'quality_issue'
  | 'contract_violation'
  | 'unprofessional_behavior'
  | 'no_show'
  | 'other';

export interface AdminBookingReportView extends BookingReport {
  reporter_first_name: string;
  reporter_last_name: string;
  reporter_email: string;
  booking_reference: string;
  service_type: string;
  event_date: string;
  booking_status: string;
  amount: number;
  vendor_name: string;
  vendor_id: string;
  couple_first_name: string;
  couple_last_name: string;
  couple_email: string;
  admin_first_name?: string;
  admin_last_name?: string;
}

export interface ReportStatistics {
  total_reports: number;
  open_reports: number;
  in_review_reports: number;
  resolved_reports: number;
  dismissed_reports: number;
  urgent_reports: number;
  high_priority_reports: number;
  vendor_reports: number;
  couple_reports: number;
}

export interface SubmitReportRequest {
  booking_id: string;
  reported_by: string;
  reporter_type: 'vendor' | 'couple';
  report_type: ReportType;
  subject: string;
  description: string;
  cancellation_reason?: string; // NEW: Optional cancellation reason
  evidence_urls?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateReportStatusRequest {
  status: 'open' | 'in_review' | 'resolved' | 'dismissed';
  admin_notes?: string;
  admin_response?: string;
  reviewed_by?: string;
}

export interface ReportFilters {
  status?: string;
  priority?: string;
  reporter_type?: string;
  report_type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  payment_issue: 'Payment Issue',
  service_issue: 'Service Issue',
  communication_issue: 'Communication Issue',
  cancellation_dispute: 'Cancellation Dispute',
  quality_issue: 'Quality Issue',
  contract_violation: 'Contract Violation',
  unprofessional_behavior: 'Unprofessional Behavior',
  no_show: 'No Show',
  other: 'Other'
};

export const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_review: 'In Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed'
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

export const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 border-blue-300',
  in_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  resolved: 'bg-green-100 text-green-700 border-green-300',
  dismissed: 'bg-gray-100 text-gray-700 border-gray-300'
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300'
};
