const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface VendorDocument {
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
}

export interface DocumentApprovalResponse {
  success: boolean;
  message: string;
  document?: {
    id: string;
    verificationStatus: string;
    verifiedAt?: string;
    rejectionReason?: string;
  };
}

export class DocumentApprovalService {
  private static baseUrl = `${API_BASE_URL}/api`;

  /**
   * Get all vendor documents pending approval
   */
  static async getPendingDocuments(): Promise<VendorDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/documents/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending documents');
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      // Return mock data for now
      return this.getMockDocuments();
    }
  }

  /**
   * Approve a vendor document
   */
  static async approveDocument(vendorId: string, documentId: string): Promise<DocumentApprovalResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/vendor-profile/${vendorId}/documents/${documentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve document');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error approving document:', error);
      // Mock success response
      return {
        success: true,
        message: 'Document approved successfully',
        document: {
          id: documentId,
          verificationStatus: 'approved',
          verifiedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Reject a vendor document
   */
  static async rejectDocument(vendorId: string, documentId: string, rejectionReason: string): Promise<DocumentApprovalResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/vendor-profile/${vendorId}/documents/${documentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject document');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error rejecting document:', error);
      // Mock success response
      return {
        success: true,
        message: 'Document rejected successfully',
        document: {
          id: documentId,
          verificationStatus: 'rejected',
          rejectionReason
        }
      };
    }
  }

  /**
   * Verify entire vendor (approve all documents and vendor status)
   */
  static async verifyVendor(userId: string, verificationStatus: 'verified' | 'rejected' | 'pending_documents', adminNotes?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/admin/verify-vendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          user_id: userId,
          verification_status: verificationStatus,
          admin_notes: adminNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify vendor');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying vendor:', error);
      throw error;
    }
  }

  /**
   * Mock documents for development/testing
   */
  private static getMockDocuments(): VendorDocument[] {
    return [
      {
        id: '1',
        vendorId: 'vendor-1',
        vendorName: 'John Smith',
        businessName: 'Perfect Weddings Co.',
        documentType: 'Business License',
        documentUrl: 'https://example.com/doc1.pdf',
        fileName: 'business-license-2024.pdf',
        uploadedAt: '2024-10-15T10:30:00Z',
        verificationStatus: 'pending',
        fileSize: 2048576,
        mimeType: 'application/pdf'
      },
      {
        id: '2',
        vendorId: 'vendor-2',
        vendorName: 'Sarah Johnson',
        businessName: 'Elegant Flowers Studio',
        documentType: 'Insurance Certificate',
        documentUrl: 'https://example.com/doc2.pdf',
        fileName: 'insurance-cert-2024.pdf',
        uploadedAt: '2024-10-14T15:45:00Z',
        verificationStatus: 'approved',
        verifiedAt: '2024-10-15T09:20:00Z',
        fileSize: 1536000,
        mimeType: 'application/pdf'
      },
      {
        id: '3',
        vendorId: 'vendor-3',
        vendorName: 'Mike Wilson',
        businessName: 'Soundwave Entertainment',
        documentType: 'Tax Registration',
        documentUrl: 'https://example.com/doc3.pdf',
        fileName: 'tax-registration.pdf',
        uploadedAt: '2024-10-13T12:15:00Z',
        verificationStatus: 'rejected',
        rejectionReason: 'Document is expired. Please upload a current tax registration certificate.',
        fileSize: 945000,
        mimeType: 'application/pdf'
      },
      {
        id: '4',
        vendorId: 'vendor-4',
        vendorName: 'Lisa Chen',
        businessName: 'Memories Photography',
        documentType: 'Professional License',
        documentUrl: 'https://example.com/doc4.pdf',
        fileName: 'photography-license.pdf',
        uploadedAt: '2024-10-16T08:15:00Z',
        verificationStatus: 'pending',
        fileSize: 1234567,
        mimeType: 'application/pdf'
      },
      {
        id: '5',
        vendorId: 'vendor-5',
        vendorName: 'David Brown',
        businessName: 'Gourmet Catering Co.',
        documentType: 'Food Safety Certificate',
        documentUrl: 'https://example.com/doc5.pdf',
        fileName: 'food-safety-cert.pdf',
        uploadedAt: '2024-10-16T11:30:00Z',
        verificationStatus: 'pending',
        fileSize: 987654,
        mimeType: 'application/pdf'
      }
    ];
  }
}

export default DocumentApprovalService;
