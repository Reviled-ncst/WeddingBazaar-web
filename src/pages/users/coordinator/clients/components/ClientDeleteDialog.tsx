import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ClientDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (clientId: string) => Promise<void>;
  client: {
    id: string;
    couple_name: string;
    wedding_count?: number;
  };
}

const ClientDeleteDialog: React.FC<ClientDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  client,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(client.id);
      onClose();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasActiveWeddings = client.wedding_count && client.wedding_count > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Delete Client</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-gray-900 font-medium mb-2">
              Are you sure you want to delete this client?
            </p>
            <p className="text-gray-700 font-semibold text-lg">
              {client.couple_name}
            </p>
          </div>

          {hasActiveWeddings && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium mb-1">
                    Warning: This client has {client.wedding_count} active wedding(s)
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Deleting this client may affect associated wedding records and data.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 text-sm">
              <strong>Note:</strong> This action cannot be undone. All client data and history will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDeleteDialog;
