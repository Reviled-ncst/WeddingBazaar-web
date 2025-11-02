import React from 'react';
import { X, User, Mail, Phone, Calendar, DollarSign, Tag, MessageSquare, Clock } from 'lucide-react';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    couple_name: string;
    email: string;
    phone: string;
    status: string;
    preferred_style?: string;
    budget_range?: string;
    notes?: string;
    last_contact?: string;
    created_at?: string;
    wedding_count?: number;
  };
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      lead: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Lead' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.lead;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatBudgetRange = (range?: string) => {
    const budgetLabels: Record<string, string> = {
      'under-500k': 'Under ₱500,000',
      '500k-1m': '₱500,000 - ₱1,000,000',
      '1m-2m': '₱1,000,000 - ₱2,000,000',
      '2m-5m': '₱2,000,000 - ₱5,000,000',
      'over-5m': 'Over ₱5,000,000',
    };
    return range ? budgetLabels[range] || range : 'Not specified';
  };

  const formatStyle = (style?: string) => {
    if (!style) return 'Not specified';
    return style.charAt(0).toUpperCase() + style.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{client.couple_name}</h2>
                <p className="text-pink-100 text-sm mt-1">Client Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              {getStatusBadge(client.status)}
            </div>
            {client.wedding_count !== undefined && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Active Weddings</p>
                <p className="text-2xl font-bold text-pink-600">{client.wedding_count}</p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <a
                  href={`mailto:${client.email}`}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  {client.email}
                </a>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <a
                  href={`tel:${client.phone}`}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  {client.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Wedding Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              Wedding Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                <div className="flex items-center gap-2 text-pink-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Budget Range</span>
                </div>
                <p className="text-gray-900 font-semibold">{formatBudgetRange(client.budget_range)}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">Preferred Style</span>
                </div>
                <p className="text-gray-900 font-semibold">{formatStyle(client.preferred_style)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Notes
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          )}

          {/* Timeline Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <p className="text-gray-900 font-medium">{formatDate(client.created_at)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Last Contact</span>
                </div>
                <p className="text-gray-900 font-medium">{formatDate(client.last_contact)}</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
