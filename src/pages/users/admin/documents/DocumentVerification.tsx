import React, { useState, useEffect } from 'react';
import { AdminLayout, StatCard } from '../shared';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertTriangle,
  Search,
  Calendar,
  User,
  Building2,
  Download,
  Filter,
  Shield,
  TrendingUp,
  X
} from 'lucide-react';
import { useNotification } from '../../../../shared/hooks/useNotification';
import { NotificationModal } from '../../../../shared/components/modals';

interface VendorDocument {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  documentType: string;
  documentUrl: string;
  fileName: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
  fileSize: number;
  mimeType: string;
  email?: string;
  phone?: string;
  location?: string;
  extracted_name?: string;
  extracted_id_number?: string;
  document_confidence?: number;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgReviewTime: number;
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle
};

export const DocumentVerification: React.FC = () => {
  const { notification, showNotification, hideNotification } = useNotification();
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgReviewTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedDocument, setSelectedDocument] = useState<VendorDocument | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check if mock data is enabled
      const useMockData = import.meta.env.VITE_USE_MOCK_DOCUMENTS === 'true';
      
      if (useMockData) {
        console.log('📊 [DocumentVerification] Using mock data (VITE_USE_MOCK_DOCUMENTS=true)');
        const mockDocs = generateMockDocuments();
        setDocuments(mockDocs);
        setStats({
          total: mockDocs.length,
          pending: mockDocs.filter(d => d.verificationStatus === 'pending').length,
          approved: mockDocs.filter(d => d.verificationStatus === 'approved').length,
          rejected: mockDocs.filter(d => d.verificationStatus === 'rejected').length,
          avgReviewTime: 2.5,
        });
        setLoading(false);
        return;
      }
      
      console.log('📡 [DocumentVerification] Fetching from API');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // First, get stats from all documents
      const statsResponse = await fetch(`${apiUrl}/api/admin/documents/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          avgReviewTime: 0
        });
      }
      
      // Then load documents with filter
      const statusParam = filterStatus === 'all' ? '' : `?status=${filterStatus}`;
      const docsResponse = await fetch(`${apiUrl}/api/admin/documents${statusParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        console.log(`✅ [DocumentVerification] Loaded ${docsData.documents?.length || 0} documents (filter: ${filterStatus})`);
        setDocuments(docsData.documents || []);
      } else {
        console.warn('⚠️ [DocumentVerification] API request failed, using mock data');
        const mockDocs = generateMockDocuments();
        setDocuments(mockDocs);
        setStats({
          total: mockDocs.length,
          pending: mockDocs.filter(d => d.verificationStatus === 'pending').length,
          approved: mockDocs.filter(d => d.verificationStatus === 'approved').length,
          rejected: mockDocs.filter(d => d.verificationStatus === 'rejected').length,
          avgReviewTime: 2.5,
        });
      }
    } catch (error) {
      console.error('❌ [DocumentVerification] Error loading documents:', error);
      console.log('📊 [DocumentVerification] Falling back to mock data');
      // Use mock data for development
      const mockDocs = generateMockDocuments();
      setDocuments(mockDocs);
      setStats({
        total: mockDocs.length,
        pending: mockDocs.filter(d => d.verificationStatus === 'pending').length,
        approved: mockDocs.filter(d => d.verificationStatus === 'approved').length,
        rejected: mockDocs.filter(d => d.verificationStatus === 'rejected').length,
        avgReviewTime: 2.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockDocuments = (): VendorDocument[] => {
    const documentTypes = [
      'Business Permit',
      'DTI Registration',
      'Mayor\'s Permit',
      'BIR Certificate',
      'Valid ID',
      'Insurance Certificate',
      'Portfolio',
      'Contract Template'
    ];
    
    const vendors = [
      { name: 'Perfect Weddings Co.', business: 'Perfect Weddings Photography Studio' },
      { name: 'Elegant Events', business: 'Elegant Events Planning Services' },
      { name: 'Dream Catchers', business: 'Dream Catchers Catering' },
      { name: 'Royal Affairs', business: 'Royal Affairs Venue Management' },
      { name: 'Blissful Moments', business: 'Blissful Moments DJ Services' },
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const vendor = vendors[i % vendors.length];
      const status: 'pending' | 'approved' | 'rejected' = 
        i < 5 ? 'pending' : i < 13 ? 'approved' : 'rejected';
      
      return {
        id: `doc-${i + 1}`,
        vendorId: `vendor-${(i % 5) + 1}`,
        vendorName: vendor.name,
        businessName: vendor.business,
        documentType: documentTypes[i % documentTypes.length],
        documentUrl: `https://example.com/docs/document-${i + 1}.pdf`,
        fileName: `${documentTypes[i % documentTypes.length].replace(/'/g, '').replace(/\s+/g, '_')}_${i + 1}.pdf`,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        verificationStatus: status,
        verifiedAt: status !== 'pending' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        rejectionReason: status === 'rejected' ? 'Document expired or invalid' : undefined,
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
        mimeType: 'application/pdf',
        email: `vendor${(i % 5) + 1}@example.com`,
        phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        location: ['Manila', 'Cebu', 'Davao', 'Quezon City', 'Makati'][i % 5],
        document_confidence: Math.floor(Math.random() * 30) + 70,
      };
    });
  };

  const handleApprove = async (docId: string) => {
    if (!confirm('Are you sure you want to approve this document?')) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/admin/documents/${docId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: adminNotes })
      });

      if (response.ok) {
        showNotification({
          title: 'Document Approved',
          message: 'Document approved successfully!',
          type: 'success',
          customIcon: CheckCircle
        });
        setSelectedDocument(null);
        setAdminNotes('');
        loadData();
      } else {
        showNotification({
          title: 'Approval Failed',
          message: 'Failed to approve document. Please try again.',
          type: 'error',
          customIcon: XCircle
        });
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      showNotification({
        title: 'Approval Failed',
        message: 'Failed to approve document. Please try again.',
        type: 'error',
        customIcon: XCircle
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (docId: string, reason: string) => {
    if (!reason.trim()) {
      showNotification({
        title: 'Rejection Reason Required',
        message: 'Please provide a rejection reason before rejecting the document.',
        type: 'warning',
        customIcon: AlertTriangle
      });
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/admin/documents/${docId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason, notes: adminNotes })
      });

      if (response.ok) {
        showNotification({
          title: 'Document Rejected',
          message: 'Document has been rejected and vendor will be notified.',
          type: 'info',
          customIcon: XCircle
        });
        setShowRejectModal(false);
        setSelectedDocument(null);
        setRejectionReason('');
        setAdminNotes('');
        loadData();
      } else {
        showNotification({
          title: 'Rejection Failed',
          message: 'Failed to reject document. Please try again.',
          type: 'error',
          customIcon: XCircle
        });
      }
    } catch (error) {
      console.error('Failed to reject:', error);
      showNotification({
        title: 'Rejection Failed',
        message: 'Failed to reject document. Please try again.',
        type: 'error',
        customIcon: XCircle
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' ||
      doc.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl">
              <Shield className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Document Verification
              </h1>
              <p className="text-gray-600 mt-1">Review and approve vendor documentation</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Documents"
            value={stats.total}
            icon={FileText}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
          />
          <StatCard
            title="Avg Review Time"
            value={`${stats.avgReviewTime}h`}
            icon={TrendingUp}
          />
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by vendor, business name, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50"
                aria-label="Filter documents by status"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-white/60 shadow-xl text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No documents match the selected filter'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => {
              const StatusIcon = statusIcons[document.verificationStatus];
              
              return (
                <div 
                  key={document.id}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Gradient accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{document.documentType}</h3>
                          <p className="text-xs text-gray-500 truncate">{document.fileName}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[document.verificationStatus]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {document.verificationStatus.charAt(0).toUpperCase() + document.verificationStatus.slice(1)}
                      </span>
                    </div>

                    {/* Vendor Info */}
                    <div className="space-y-3 mb-4">
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-pink-600" />
                          <span className="text-sm font-semibold text-gray-900 truncate">{document.businessName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate">{document.vendorName}</span>
                        </div>
                      </div>

                      {/* Document Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-purple-500" />
                          <span>{formatDate(document.uploadedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                      </div>

                      {/* Confidence Score if available */}
                      {document.document_confidence && (
                        <div className="bg-blue-50 rounded-lg p-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-blue-700 font-medium">Confidence Score</span>
                            <span className="text-blue-900 font-bold">{document.document_confidence}%</span>
                          </div>
                          <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 ${
                                document.document_confidence >= 90 ? 'w-11/12' :
                                document.document_confidence >= 70 ? 'w-3/4' :
                                document.document_confidence >= 50 ? 'w-1/2' : 'w-1/4'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedDocument(document)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </button>
                      
                      {document.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(document.id)}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDocument(document);
                              setShowRejectModal(true);
                            }}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>

                    {/* Rejection Reason if rejected */}
                    {document.verificationStatus === 'rejected' && document.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason</p>
                            <p className="text-xs text-red-700">{document.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && !showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Document Review</h2>
                    <p className="text-white/80 mt-1">{selectedDocument.documentType}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    title="Close modal"
                    aria-label="Close document review modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Vendor Information */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-pink-600" />
                    Vendor Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Business Name</p>
                      <p className="font-semibold text-gray-900">{selectedDocument.businessName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Owner/Contact</p>
                      <p className="font-semibold text-gray-900">{selectedDocument.vendorName}</p>
                    </div>
                    {selectedDocument.email && (
                      <div>
                        <p className="text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{selectedDocument.email}</p>
                      </div>
                    )}
                    {selectedDocument.phone && (
                      <div>
                        <p className="text-gray-600 mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">{selectedDocument.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Information */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Document Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">File Name</p>
                      <p className="font-semibold text-gray-900">{selectedDocument.fileName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">File Size</p>
                      <p className="font-semibold text-gray-900">{formatFileSize(selectedDocument.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Upload Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedDocument.uploadedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedDocument.verificationStatus]}`}>
                        {selectedDocument.verificationStatus.charAt(0).toUpperCase() + selectedDocument.verificationStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Document Preview</h3>
                  <div className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Document preview not available</p>
                    <a
                      href={selectedDocument.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      <Download className="h-5 w-5" />
                      Download Document
                    </a>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this verification..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Action Buttons */}
                {selectedDocument.verificationStatus === 'pending' && (
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(selectedDocument.id)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-semibold disabled:opacity-50"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {isProcessing ? 'Processing...' : 'Approve Document'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold disabled:opacity-50"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedDocument && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Reject Document
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  Please provide a reason for rejecting <span className="font-semibold">{selectedDocument.documentType}</span>
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Document is expired, unclear, or invalid"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedDocument.id, rejectionReason)}
                    disabled={!rejectionReason.trim() || isProcessing}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        confirmText={notification.confirmText}
        showCancel={notification.showCancel}
        onConfirm={notification.onConfirm}
        customIcon={notification.customIcon}
        iconColor={notification.iconColor}
        size={notification.size}
      />
    </AdminLayout>
  );
};
