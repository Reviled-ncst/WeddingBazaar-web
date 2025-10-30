import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  File,
  Image
} from 'lucide-react';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { cn } from '../utils/cn';
import styles from './DocumentUpload.module.css';

interface DocumentUploadComponentProps {
  vendorId: string;
  className?: string;
}

const DOCUMENT_TYPES = [
  { value: 'business_license', label: 'Business License', icon: FileText },
  { value: 'insurance_certificate', label: 'Insurance Certificate', icon: FileText },
  { value: 'tax_certificate', label: 'Tax Certificate', icon: FileText },
  { value: 'professional_certification', label: 'Professional Certification', icon: FileText },
  { value: 'portfolio_samples', label: 'Portfolio Samples', icon: Image },
  { value: 'contract_template', label: 'Contract Template', icon: FileText },
  { value: 'other', label: 'Other Document', icon: File }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'rejected':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return CheckCircle;
    case 'rejected':
      return XCircle;
    default:
      return Clock;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentUploadComponent: React.FC<DocumentUploadComponentProps> = ({
  vendorId,
  className
}) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState('business_license');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploading,
    uploadProgress,
    error,
    documents,
    uploadDocument,
    deleteDocument,
    refreshDocuments,
    clearError
  } = useDocumentUpload(vendorId);

  // Load documents on mount
  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  // Check if selected document type already has a pending/approved document
  const existingDocument = documents.find(
    doc => doc.documentType === selectedDocumentType && 
    (doc.verificationStatus === 'pending' || doc.verificationStatus === 'approved')
  );

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/webp',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid document file (PDF, DOC, DOCX, TXT, or image)');
      return;
    }

    // Validate file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
      return;
    }

    await uploadDocument(file, selectedDocumentType);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(documentId);
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-pink-600" />
          Upload Business Documents
        </h3>

        {/* Document Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            disabled={uploading}
            title="Select document type"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Drop Zone or Status Display */}
        {existingDocument ? (
          /* Show status when document already uploaded */
          <div className={cn(
            'border-2 rounded-lg p-8 text-center',
            existingDocument.verificationStatus === 'approved' 
              ? 'border-green-300 bg-green-50' 
              : 'border-yellow-300 bg-yellow-50'
          )}>
            <div className="space-y-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center mx-auto',
                existingDocument.verificationStatus === 'approved' 
                  ? 'bg-green-100' 
                  : 'bg-yellow-100'
              )}>
                {existingDocument.verificationStatus === 'approved' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
                )}
              </div>
              <div>
                <p className={cn(
                  'text-lg font-semibold mb-2',
                  existingDocument.verificationStatus === 'approved' 
                    ? 'text-green-900' 
                    : 'text-yellow-900'
                )}>
                  {existingDocument.verificationStatus === 'approved' 
                    ? '✓ Document Approved' 
                    : '⏳ Document Pending Review'}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>{existingDocument.documentName}</strong>
                </p>
                <p className="text-xs text-gray-600">
                  {existingDocument.verificationStatus === 'approved' 
                    ? 'This document has been verified by our team' 
                    : 'Your document is under review. This typically takes 24-48 hours.'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Select a different document type to upload more documents
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Show upload area when no document uploaded */
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              dragActive
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50',
              uploading && 'opacity-50 pointer-events-none'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={uploading}
              title="Select document file"
              aria-label="Select document file"
            />

            {uploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-pink-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Uploading document...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={cn('bg-pink-600 h-2 rounded-full', styles.progressBar)}
                      data-progress={uploadProgress}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX, TXT, and image files up to 25MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Upload Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
                title="Clear error"
                aria-label="Clear error message"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Documents List - HIDDEN: Status shown in upload area instead */}
      {false && (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-600" />
          Uploaded Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents uploaded yet</p>
            <p className="text-sm text-gray-400">Upload your business documents to get verified</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const StatusIcon = getStatusIcon(doc.verificationStatus || 'pending');
              const docType = DOCUMENT_TYPES.find(t => t.value === doc.documentType);
              const DocIcon = docType?.icon || FileText;

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-pink-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DocIcon className="w-5 h-5 text-pink-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {doc.documentName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {docType?.label || doc.documentType}
                      {doc.fileSize && ` • ${formatFileSize(doc.fileSize)}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      Uploaded {new Date(doc.uploadedAt || '').toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <div className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1',
                      getStatusColor(doc.verificationStatus || 'pending')
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {doc.verificationStatus || 'pending'}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openDocument(doc.documentUrl)}
                        className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="View document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(doc.id!)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Document Verification Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          Document Verification Process
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Documents are reviewed by our verification team within 24-48 hours</p>
          <p>• Approved documents help build trust with potential clients</p>
          <p>• Required documents: Business License, Insurance Certificate</p>
          <p>• Optional documents: Professional Certifications, Portfolio Samples</p>
        </div>
      </div>
    </div>
  );
};
