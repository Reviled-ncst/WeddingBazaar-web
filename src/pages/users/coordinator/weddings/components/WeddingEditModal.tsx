import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Heart, Loader2 } from 'lucide-react';
import { updateWedding } from '../../../../../shared/services/coordinatorService';

interface Wedding {
  id: string;
  couple_name: string;
  couple_email: string;
  couple_phone: string;
  wedding_date: string;
  venue: string;
  venue_address?: string;
  budget: number;
  guest_count: number;
  preferred_style: string;
  notes?: string;
  status: string;
}

interface WeddingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: Wedding | null;
  onSuccess: () => void;
}

const WeddingEditModal: React.FC<WeddingEditModalProps> = ({
  isOpen,
  onClose,
  wedding,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    couple_name: '',
    couple_email: '',
    couple_phone: '',
    wedding_date: '',
    venue: '',
    venue_address: '',
    budget: '',
    guest_count: '',
    preferred_style: 'classic',
    notes: '',
    status: 'planning'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Pre-fill form when wedding data is available
  useEffect(() => {
    if (wedding) {
      setFormData({
        couple_name: wedding.couple_name || '',
        couple_email: wedding.couple_email || '',
        couple_phone: wedding.couple_phone || '',
        wedding_date: wedding.wedding_date ? wedding.wedding_date.split('T')[0] : '',
        venue: wedding.venue || '',
        venue_address: wedding.venue_address || '',
        budget: wedding.budget?.toString() || '',
        guest_count: wedding.guest_count?.toString() || '',
        preferred_style: wedding.preferred_style || 'classic',
        notes: wedding.notes || '',
        status: wedding.status || 'planning'
      });
      setError('');
      setValidationErrors({});
    }
  }, [wedding]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.couple_name.trim()) {
      errors.couple_name = 'Couple name is required';
    }

    if (!formData.couple_email.trim()) {
      errors.couple_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.couple_email)) {
      errors.couple_email = 'Invalid email format';
    }

    if (!formData.couple_phone.trim()) {
      errors.couple_phone = 'Phone number is required';
    }

    if (!formData.wedding_date) {
      errors.wedding_date = 'Wedding date is required';
    } else {
      const selectedDate = new Date(formData.wedding_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.wedding_date = 'Wedding date cannot be in the past';
      }
    }

    if (!formData.venue.trim()) {
      errors.venue = 'Venue is required';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      errors.budget = 'Budget must be greater than 0';
    }

    if (!formData.guest_count || parseInt(formData.guest_count) <= 0) {
      errors.guest_count = 'Guest count must be greater than 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !wedding) return;

    setLoading(true);
    setError('');

    try {
      const updates = {
        couple_name: formData.couple_name,
        couple_email: formData.couple_email,
        couple_phone: formData.couple_phone,
        wedding_date: formData.wedding_date,
        venue: formData.venue,
        venue_address: formData.venue_address,
        budget: parseFloat(formData.budget),
        guest_count: parseInt(formData.guest_count),
        preferred_style: formData.preferred_style,
        notes: formData.notes,
        status: formData.status
      };

      const result = await updateWedding(wedding.id, updates);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to update wedding');
      }
    } catch (err) {
      console.error('Error updating wedding:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the wedding';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen || !wedding) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6" />
              Edit Wedding
            </h2>
            <p className="text-pink-100 text-sm mt-1">Update wedding details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Couple Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Couple Information
            </h3>

            <div>
              <label htmlFor="couple_name" className="block text-sm font-medium text-gray-700 mb-1">
                Couple Names <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="couple_name"
                name="couple_name"
                value={formData.couple_name}
                onChange={handleChange}
                placeholder="e.g., John & Jane Smith"
                className={`w-full px-4 py-2 border ${
                  validationErrors.couple_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                disabled={loading}
              />
              {validationErrors.couple_name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.couple_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="couple_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="couple_email"
                  name="couple_email"
                  value={formData.couple_email}
                  onChange={handleChange}
                  placeholder="couple@example.com"
                  className={`w-full px-4 py-2 border ${
                    validationErrors.couple_email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                  disabled={loading}
                />
                {validationErrors.couple_email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.couple_email}</p>
                )}
              </div>

              <div>
                <label htmlFor="couple_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="couple_phone"
                  name="couple_phone"
                  value={formData.couple_phone}
                  onChange={handleChange}
                  placeholder="+63 912 345 6789"
                  className={`w-full px-4 py-2 border ${
                    validationErrors.couple_phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                  disabled={loading}
                />
                {validationErrors.couple_phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.couple_phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Event Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wedding_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="wedding_date"
                  name="wedding_date"
                  value={formData.wedding_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    validationErrors.wedding_date ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                  disabled={loading}
                />
                {validationErrors.wedding_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.wedding_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g., Garden Paradise Resort"
                className={`w-full px-4 py-2 border ${
                  validationErrors.venue ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                disabled={loading}
              />
              {validationErrors.venue && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.venue}</p>
              )}
            </div>

            <div>
              <label htmlFor="venue_address" className="block text-sm font-medium text-gray-700 mb-1">
                Venue Address
              </label>
              <input
                type="text"
                id="venue_address"
                name="venue_address"
                value={formData.venue_address}
                onChange={handleChange}
                placeholder="Full address of the venue"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Budget & Guests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Budget & Guests
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Budget (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="500000"
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-2 border ${
                    validationErrors.budget ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                  disabled={loading}
                />
                {validationErrors.budget && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.budget}</p>
                )}
              </div>

              <div>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="guest_count"
                  name="guest_count"
                  value={formData.guest_count}
                  onChange={handleChange}
                  placeholder="150"
                  min="1"
                  className={`w-full px-4 py-2 border ${
                    validationErrors.guest_count ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                  disabled={loading}
                />
                {validationErrors.guest_count && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.guest_count}</p>
                )}
              </div>
            </div>
          </div>

          {/* Style & Notes */}
          <div className="space-y-4">
            <div>
              <label htmlFor="preferred_style" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Style
              </label>
              <select
                id="preferred_style"
                name="preferred_style"
                value={formData.preferred_style}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="rustic">Rustic</option>
                <option value="bohemian">Bohemian</option>
                <option value="minimalist">Minimalist</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any special requests or important details..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Update Wedding
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeddingEditModal;
