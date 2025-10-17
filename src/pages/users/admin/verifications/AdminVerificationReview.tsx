import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  FileText,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  ChevronRight,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { AdminLayout, DataTable, StatCard, statusColors } from '../shared';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { cn } from '../../../../utils/cn';

interface Verification {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  document_type: string;
  document_image_url: string;
  extracted_name?: string;
  extracted_id_number?: string;
  extracted_dob?: string;
  extracted_raw_text?: string;
  document_confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgReviewTime: number;
}

export const AdminVerificationReview: React.FC = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgReviewTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load verifications
      const verificationResponse = await fetch(
        `/api/verification/${filter === 'all' ? 'all' : filter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const verificationData = await verificationResponse.json();
      
      if (verificationData.success) {
        setVerifications(verificationData.verifications || []);
      }

      // Load statistics
      const statsResponse = await fetch('/api/verification/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      
      if (statsData.success && statsData.statistics) {
        setStats({
          total: statsData.statistics.total_verifications || 0,
          pending: statsData.statistics.pending_verifications || 0,
          approved: statsData.statistics.approved_verifications || 0,
          rejected: statsData.statistics.rejected_verifications || 0,
          avgReviewTime: statsData.statistics.avg_review_time_hours || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (verificationId: string) => {
    if (!confirm('Are you sure you want to approve this verification?')) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/verification/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verificationId,
          notes: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        setVerifications(verifications.filter(v => v.id !== verificationId));
        setShowDetailsModal(false);
        setAdminNotes('');
        alert('✅ Verification approved successfully!');
        loadData(); // Refresh data
      } else {
        alert(`❌ Failed to approve: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to approve verification:', error);
      alert('❌ Failed to approve verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/verification/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verificationId: selectedVerification.id,
          reason: rejectReason,
          notes: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        setVerifications(verifications.filter(v => v.id !== selectedVerification.id));
        setShowDetailsModal(false);
        setShowRejectModal(false);
        setRejectReason('');
        setAdminNotes('');
        alert('Verification rejected');
        loadData(); // Refresh data
      } else {
        alert(`❌ Failed to reject: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to reject verification:', error);
      alert('❌ Failed to reject verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = statusColors[status as keyof typeof statusColors] || statusColors.pending;
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        colors.bg,
        colors.text,
        'border',
        colors.border
      )}>
        {status === 'pending' && <Clock className="h-3 w-3" />}
        {status === 'approved' && <CheckCircle className="h-3 w-3" />}
        {status === 'rejected' && <XCircle className="h-3 w-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, row: Verification) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              {row.first_name} {row.last_name}
            </div>
            <div className="text-sm text-slate-600">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'document_type',
      label: 'Document Type',
      render: (value: string) => (
        <span className="capitalize">{value.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'document_confidence',
      label: 'Confidence',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-700">{value}%</span>
        </div>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Verification) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedVerification(row);
            setShowDetailsModal(true);
          }}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Review <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <>
      <AdminHeader />
      <AdminLayout
        title="Identity Verifications"
        subtitle="Review and manage user identity verification requests"
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Verifications' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter verifications"
            >
              <option value="all">All Verifications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        }
      >
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <StatCard
            title="Total Verifications"
            value={stats.total.toLocaleString()}
            icon={FileText}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
            loading={isLoading}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending.toLocaleString()}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-100"
            change={{ value: '+12', trend: 'up' }}
            loading={isLoading}
          />
          <StatCard
            title="Approved"
            value={stats.approved.toLocaleString()}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBg="bg-green-100"
            loading={isLoading}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected.toLocaleString()}
            icon={XCircle}
            iconColor="text-red-600"
            iconBg="bg-red-100"
            loading={isLoading}
          />
          <StatCard
            title="Avg Review Time"
            value={`${stats.avgReviewTime.toFixed(1)}h`}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
            loading={isLoading}
          />
        </div>

        {/* Verifications Table */}
        <DataTable
          columns={columns}
          data={verifications}
          loading={isLoading}
          searchable={true}
          filterable={false}
          exportable={false}
          onRowClick={(row) => {
            setSelectedVerification(row);
            setShowDetailsModal(true);
          }}
          emptyMessage={`No ${filter} verifications found`}
        />
      </AdminLayout>

      {/* Details Modal */}
      {showDetailsModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Verification Details</h2>
                <p className="text-slate-600">Review user identity verification request</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Full Name</label>
                    <p className="text-slate-900 font-semibold">
                      {selectedVerification.first_name} {selectedVerification.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-slate-900 font-semibold">{selectedVerification.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Submitted</label>
                    <p className="text-slate-900">
                      {new Date(selectedVerification.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedVerification.status)}</div>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Information
                </h3>
                
                {/* Document Image */}
                <div className="mb-4">
                  <img
                    src={selectedVerification.document_image_url}
                    alt="Identity Document"
                    className="w-full rounded-lg border-2 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Document Type</label>
                    <p className="text-slate-900 font-semibold capitalize">
                      {selectedVerification.document_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">OCR Confidence</label>
                    <p className="text-slate-900 font-semibold">
                      {selectedVerification.document_confidence}%
                    </p>
                  </div>
                  {selectedVerification.extracted_name && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Extracted Name</label>
                      <p className="text-slate-900">{selectedVerification.extracted_name}</p>
                    </div>
                  )}
                  {selectedVerification.extracted_id_number && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">ID Number</label>
                      <p className="text-slate-900 font-mono">{selectedVerification.extracted_id_number}</p>
                    </div>
                  )}
                  {selectedVerification.extracted_dob && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                      <p className="text-slate-900">{selectedVerification.extracted_dob}</p>
                    </div>
                  )}
                </div>

                {selectedVerification.extracted_raw_text && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-600">Raw OCR Text</label>
                    <pre className="mt-2 p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 overflow-x-auto">
                      {selectedVerification.extracted_raw_text}
                    </pre>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label htmlFor="admin-notes" className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                disabled={isProcessing}
              >
                Cancel
              </button>
              {selectedVerification.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVerification.id)}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Reject Verification</h3>
                  <p className="text-sm text-slate-600">Please provide a reason</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="reject-reason" className="block text-sm font-medium text-slate-700 mb-2">
                    Rejection Reason *
                  </label>
                  <select
                    id="reject-reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Document unclear or unreadable">Document unclear or unreadable</option>
                    <option value="Document appears to be fake or altered">Document appears to be fake or altered</option>
                    <option value="Information does not match user profile">Information does not match user profile</option>
                    <option value="Document expired">Document expired</option>
                    <option value="Wrong document type">Wrong document type</option>
                    <option value="Photo quality too low">Photo quality too low</option>
                    <option value="Other - see notes">Other - see notes</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={isProcessing || !rejectReason}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
