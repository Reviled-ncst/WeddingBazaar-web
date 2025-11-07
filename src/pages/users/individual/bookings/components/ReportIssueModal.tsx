import React, { useState } from 'react';
import { X, AlertTriangle, FileText, Send } from 'lucide-react';
import { REPORT_TYPE_LABELS } from '@/shared/types/booking-reports.types';
import type { ReportType } from '@/shared/types/booking-reports.types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    vendorName?: string;
    serviceType: string;
    bookingReference?: string;
  } | null;
  onSubmit: (reportData: {
    reportType: ReportType;
    subject: string;
    description: string;
  }) => Promise<void>;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit
}) => {
  const [reportType, setReportType] = useState<ReportType>('payment_issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationError('');
    
    // Validation
    if (!subject.trim()) {
      setValidationError('Please enter a subject for your report');
      return;
    }
    
    if (subject.trim().length < 5) {
      setValidationError('Subject must be at least 5 characters long');
      return;
    }
    
    if (!description.trim()) {
      setValidationError('Please provide a detailed description of the issue');
      return;
    }
    
    if (description.trim().length < 20) {
      setValidationError('Description must be at least 20 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        reportType,
        subject: subject.trim(),
        description: description.trim()
      });
      
      // Reset form
      setReportType('payment_issue');
      setSubject('');
      setDescription('');
      setValidationError('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      setValidationError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Report an Issue</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Let us know about any problems with this booking
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Booking Info */}
        <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FileText className="w-4 h-4 text-purple-600" />
            <span className="font-semibold">Booking:</span>
            <span>{booking.vendorName || 'Vendor'}</span>
            <span className="text-slate-400">•</span>
            <span>{booking.serviceType}</span>
            {booking.bookingReference && (
              <>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-xs">{booking.bookingReference}</span>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Validation Error Alert */}
          {validationError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Validation Error</p>
                <p className="text-sm text-red-700 mt-1">{validationError}</p>
              </div>
              <button
                type="button"
                onClick={() => setValidationError('')}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              required
              title="Select issue type"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Select the category that best describes your issue
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={255}
              placeholder="Brief summary of the issue..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              {subject.length}/255 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Please provide detailed information about the issue, including dates, amounts, communications, and any other relevant details..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Be as specific as possible to help us resolve the issue quickly
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="text-blue-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Your report will be reviewed by our admin team</li>
                  <li>We may contact you or the vendor for additional information</li>
                  <li>You'll be notified of the resolution via email</li>
                  <li>Typical response time is 1-2 business days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !description.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
