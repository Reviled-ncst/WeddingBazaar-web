import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Heart, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { getWeddingDetails } from '../../../../../shared/services/coordinatorService';

interface Wedding {
  id: string;
  couple_name: string;
  couple_email: string;
  couple_phone: string;
  wedding_date: string;
  venue: string;
  venue_address?: string;
  budget: number;
  spent: number;
  guest_count: number;
  preferred_style: string;
  notes?: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  vendors?: Array<{
    id: string;
    vendor_id: string;
    business_name: string;
    business_type: string;
    status: string;
    amount: number;
  }>;
  milestones?: Array<{
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    completed: boolean;
    completed_at?: string;
  }>;
}

interface WeddingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingId: string | null;
}

const WeddingDetailsModal: React.FC<WeddingDetailsModalProps> = ({
  isOpen,
  onClose,
  weddingId
}) => {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeddingDetails = async () => {
      if (!weddingId || !isOpen) return;

      setLoading(true);
      setError('');

      try {
        const result = await getWeddingDetails(weddingId);

        if (result.success && result.wedding) {
          setWedding(result.wedding);
        } else {
          setError(result.error || 'Failed to load wedding details');
        }
      } catch (err) {
        console.error('Error fetching wedding details:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading wedding details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeddingDetails();
  }, [isOpen, weddingId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Planning' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
      completed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6" />
              Wedding Details
            </h2>
            <p className="text-pink-100 text-sm mt-1">
              {wedding ? wedding.couple_name : 'Loading...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500 mb-4" />
              <p className="text-gray-600">Loading wedding details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Wedding Details */}
          {wedding && !loading && (
            <>
              {/* Status and Progress */}
              <div className="flex items-center justify-between">
                {getStatusBadge(wedding.status)}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-pink-600">{wedding.progress}%</p>
                </div>
              </div>

              {/* Couple Information */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Couple Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{wedding.couple_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{wedding.couple_phone}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Event Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Wedding Date
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(wedding.wedding_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Venue
                      </p>
                      <p className="font-medium text-gray-900">{wedding.venue}</p>
                      {wedding.venue_address && (
                        <p className="text-sm text-gray-600 mt-1">{wedding.venue_address}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Guest Count
                      </p>
                      <p className="font-medium text-gray-900">{wedding.guest_count} guests</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preferred Style</p>
                      <p className="font-medium text-gray-900 capitalize">{wedding.preferred_style}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget & Spending */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Budget & Spending
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(wedding.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(wedding.spent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(wedding.budget - wedding.spent)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((wedding.spent / wedding.budget) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {((wedding.spent / wedding.budget) * 100).toFixed(1)}% of budget used
                  </p>
                </div>
              </div>

              {/* Assigned Vendors */}
              {wedding.vendors && wedding.vendors.length > 0 && (
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Assigned Vendors ({wedding.vendors.length})
                  </h3>
                  <div className="space-y-3">
                    {wedding.vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{vendor.business_name}</p>
                          <p className="text-sm text-gray-600">{vendor.business_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(vendor.amount)}</p>
                          <span className={`text-sm px-2 py-1 rounded ${
                            vendor.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {vendor.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {wedding.milestones && wedding.milestones.length > 0 && (
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Milestones ({wedding.milestones.filter(m => m.completed).length}/{wedding.milestones.length} completed)
                  </h3>
                  <div className="space-y-3">
                    {wedding.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`flex items-start gap-3 p-4 rounded-lg ${
                          milestone.completed ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="mt-1">
                          {milestone.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            milestone.completed ? 'text-green-900 line-through' : 'text-gray-900'
                          }`}>
                            {milestone.title}
                          </p>
                          {milestone.description && (
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          )}
                          {milestone.due_date && (
                            <p className="text-sm text-gray-500 mt-1">
                              Due: {formatDate(milestone.due_date)}
                            </p>
                          )}
                          {milestone.completed_at && (
                            <p className="text-sm text-green-600 mt-1">
                              Completed: {formatDate(milestone.completed_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {wedding.notes && (
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{wedding.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
                <p>Created: {formatDate(wedding.created_at)}</p>
                <p>Last Updated: {formatDate(wedding.updated_at)}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeddingDetailsModal;
