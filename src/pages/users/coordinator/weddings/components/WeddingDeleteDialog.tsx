import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { deleteWedding } from '../../../../../shared/services/coordinatorService';

interface Wedding {
  id: string;
  couple_name: string;
  wedding_date: string;
  venue: string;
}

interface WeddingDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: Wedding | null;
  onSuccess: () => void;
}

const WeddingDeleteDialog: React.FC<WeddingDeleteDialogProps> = ({
  isOpen,
  onClose,
  wedding,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!wedding) return;

    setLoading(true);
    setError('');

    try {
      const result = await deleteWedding(wedding.id);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to delete wedding');
      }
    } catch (err) {
      console.error('Error deleting wedding:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the wedding';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !wedding) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Delete Wedding</h2>
              <p className="text-red-100 text-sm">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close dialog"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 mb-1">
                  Are you sure you want to delete this wedding?
                </p>
                <p className="text-sm text-yellow-700">
                  This will permanently delete all associated data including:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                  <li>All milestones</li>
                  <li>Vendor assignments</li>
                  <li>Client records</li>
                  <li>Activity logs</li>
                  <li>Commission records</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Wedding Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-sm text-gray-600">Couple</p>
              <p className="font-semibold text-gray-900">{wedding.couple_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Wedding Date</p>
              <p className="font-medium text-gray-900">{formatDate(wedding.wedding_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Venue</p>
              <p className="font-medium text-gray-900">{wedding.venue}</p>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action is permanent and cannot be reversed. 
              All data related to this wedding will be lost forever.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Delete Wedding
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeddingDeleteDialog;
