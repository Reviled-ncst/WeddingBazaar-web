import { useState, useCallback } from 'react';
import { cloudinaryService } from '../services/cloudinaryService';

export interface DocumentUpload {
  id?: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  fileSize?: number;
  mimeType?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  uploadedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface UseDocumentUploadResult {
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  documents: DocumentUpload[];
  uploadDocument: (file: File, documentType: string) => Promise<DocumentUpload | null>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  refreshDocuments: () => Promise<void>;
  clearError: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useDocumentUpload = (vendorId: string): UseDocumentUploadResult => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshDocuments = useCallback(async () => {
    try {
      console.log('📄 Fetching documents for vendor:', vendorId);
      
      const response = await fetch(`${API_BASE}/api/vendor-profile/${vendorId}/documents`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents || []);
        console.log('✅ Documents loaded:', data.documents?.length || 0);
      } else {
        throw new Error(data.message || 'Failed to load documents');
      }
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      setError(error instanceof Error ? error.message : 'Failed to load documents');
      setDocuments([]);
    }
  }, [vendorId]);

  const uploadDocument = useCallback(async (
    file: File, 
    documentType: string
  ): Promise<DocumentUpload | null> => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('📄 Starting document upload:', {
        fileName: file.name,
        fileSize: file.size,
        documentType,
        vendorId
      });

      // Step 1: Upload to Cloudinary
      setUploadProgress(25);
      
      const cloudinaryResult = await cloudinaryService.uploadDocument(
        file, 
        `vendor-documents/${vendorId}`
      );

      console.log('☁️ Cloudinary upload successful:', cloudinaryResult.secure_url);
      setUploadProgress(75);

      // Step 2: Save to database
      const documentData = {
        documentType,
        documentName: file.name,
        documentUrl: cloudinaryResult.secure_url,
        fileSize: file.size,
        mimeType: file.type
      };

      console.log('💾 Attempting to save to database:', {
        endpoint: `${API_BASE}/api/vendor-profile/${vendorId}/documents`,
        data: documentData
      });

      const response = await fetch(`${API_BASE}/api/vendor-profile/${vendorId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData)
      });

      console.log('📡 Database save response status:', response.status);
      console.log('📡 Database save response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Database save failed - response text:', errorText);
        throw new Error(`Failed to save document to database: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Database save response data:', data);
      
      if (!data.success) {
        console.error('❌ Database save failed - API returned success: false');
        throw new Error(data.message || 'Failed to save document');
      }

      console.log('✅ Document saved to database:', data.document);
      setUploadProgress(100);

      // Refresh documents list
      await refreshDocuments();

      return data.document;

    } catch (error) {
      console.error('❌ Document upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [vendorId, refreshDocuments]);

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting document:', documentId);

      const response = await fetch(`${API_BASE}/api/vendor-profile/${vendorId}/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete document');
      }

      console.log('✅ Document deleted successfully');
      
      // Refresh documents list
      await refreshDocuments();

      return true;

    } catch (error) {
      console.error('❌ Delete document error:', error);
      setError(error instanceof Error ? error.message : 'Delete failed');
      return false;
    }
  }, [vendorId, refreshDocuments]);

  return {
    uploading,
    uploadProgress,
    error,
    documents,
    uploadDocument,
    deleteDocument,
    refreshDocuments,
    clearError
  };
};
