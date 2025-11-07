import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Filter, 
  Search, 
  ChevronDown,
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { bookingReportsService } from '../../../shared/services/bookingReportsService';
import type { 
  AdminBookingReportView, 
  ReportStatistics,
  ReportFilters
} from '../../../shared/types/booking-reports.types';
import { 
  REPORT_TYPE_LABELS, 
  STATUS_LABELS, 
  PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS
} from '../../../shared/types/booking-reports.types';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<AdminBookingReportView[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AdminBookingReportView | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Update form
  const [updateForm, setUpdateForm] = useState({
    status: '',
    admin_notes: '',
    admin_response: '',
    reviewed_by: ''
  });

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await bookingReportsService.getAllReports(filters);
      setReports(data.reports);
      setStatistics(data.statistics);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (report: AdminBookingReportView) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleUpdateReport = (report: AdminBookingReportView) => {
    setSelectedReport(report);
    setUpdateForm({
      status: report.status,
      admin_notes: report.admin_notes || '',
      admin_response: report.admin_response || '',
      reviewed_by: report.reviewed_by || ''
    });
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedReport) return;

    try {
      await bookingReportsService.updateReportStatus(selectedReport.id, updateForm);
      setShowUpdateModal(false);
      await loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    }
  };

  const handleUpdatePriority = async (reportId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      await bookingReportsService.updateReportPriority(reportId, priority);
      await loadReports();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await bookingReportsService.deleteReport(reportId);
      await loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_review': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'dismissed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter(report =>
    searchTerm === '' ||
    report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporter_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-white to-pink-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-8 h-8 text-pink-500" />
          Booking Reports Management
        </h1>
        <p className="text-slate-600">
          Review and manage reports submitted by vendors and couples
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total Reports</h3>
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{statistics.total_reports}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-600">Open Reports</h3>
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{statistics.open_reports}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-yellow-600">In Review</h3>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">{statistics.in_review_reports}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-600">Urgent</h3>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-900">{statistics.urgent_reports}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject, booking reference, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reporter Type</label>
              <select
                value={filters.reporter_type || ''}
                onChange={(e) => handleFilterChange('reporter_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Types</option>
                <option value="vendor">Vendor</option>
                <option value="couple">Couple</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
              <select
                value={filters.report_type || ''}
                onChange={(e) => handleFilterChange('report_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Types</option>
                {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <p className="mt-4 text-slate-600">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No reports found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Report Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900">{report.subject}</p>
                          <p className="text-xs text-slate-500">{REPORT_TYPE_LABELS[report.report_type]}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900">{report.booking_reference}</p>
                          <p className="text-xs text-slate-500">{report.service_type}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900">
                            {report.reporter_first_name} {report.reporter_last_name}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">{report.reporter_type}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[report.status]}`}>
                          {getStatusIcon(report.status)}
                          {STATUS_LABELS[report.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={report.priority}
                          onChange={(e) => handleUpdatePriority(report.id, e.target.value as any)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer ${PRIORITY_COLORS[report.priority]}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(report)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateReport(report)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Update Report"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Report Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Report Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Report Type</p>
                    <p className="font-medium text-slate-900">{REPORT_TYPE_LABELS[selectedReport.report_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selectedReport.status]}`}>
                      {getStatusIcon(selectedReport.status)}
                      {STATUS_LABELS[selectedReport.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Priority</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${PRIORITY_COLORS[selectedReport.priority]}`}>
                      {PRIORITY_LABELS[selectedReport.priority]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created At</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject and Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Subject</p>
                    <p className="font-medium text-slate-900">{selectedReport.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Description</p>
                    <p className="text-slate-900 whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Booking Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Booking Reference</p>
                    <p className="font-medium text-slate-900">{selectedReport.booking_reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Service Type</p>
                    <p className="font-medium text-slate-900">{selectedReport.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Event Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedReport.event_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Vendor</p>
                    <p className="font-medium text-slate-900">{selectedReport.vendor_name}</p>
                  </div>
                </div>
              </div>

              {/* Reporter Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Reporter Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Reporter Type</p>
                    <p className="font-medium text-slate-900 capitalize">{selectedReport.reporter_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium text-slate-900">
                      {selectedReport.reporter_first_name} {selectedReport.reporter_last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-900">{selectedReport.reporter_email}</p>
                  </div>
                </div>
              </div>

              {/* Admin Response */}
              {selectedReport.admin_response && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Admin Response</h3>
                  <p className="text-slate-900 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {selectedReport.admin_response}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedReport.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Admin Notes</h3>
                  <p className="text-slate-900 whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    {selectedReport.admin_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleUpdateReport(selectedReport);
                }}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Update Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Update Report</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Response</label>
                <textarea
                  value={updateForm.admin_response}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, admin_response: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter your response to the reporter..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  value={updateForm.admin_notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Internal notes (not visible to users)..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitUpdate}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Update Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
