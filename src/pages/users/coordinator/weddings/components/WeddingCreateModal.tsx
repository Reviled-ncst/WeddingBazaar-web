import React, { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, Heart } from 'lucide-react';
import { createWedding } from '../../../../../shared/services/coordinatorService';

interface WeddingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WeddingCreateModal: React.FC<WeddingCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    couple_names: '',
    couple_email: '',
    couple_phone: '',
    event_date: '',
    venue: '',
    venue_address: '',
    guest_count: '',
    budget: '',
    preferred_style: 'classic',
    notes: '',
    create_default_milestones: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.couple_names.trim()) {
      newErrors.couple_names = 'Couple names are required';
    }

    if (!formData.couple_email.trim()) {
      newErrors.couple_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.couple_email)) {
      newErrors.couple_email = 'Invalid email format';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Wedding date is required';
    } else if (new Date(formData.event_date) < new Date()) {
      newErrors.event_date = 'Wedding date must be in the future';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    if (formData.guest_count && parseInt(formData.guest_count) < 1) {
      newErrors.guest_count = 'Guest count must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const weddingData = {
        couple_names: formData.couple_names,
        couple_email: formData.couple_email,
        couple_phone: formData.couple_phone || undefined,
        event_date: formData.event_date,
        venue: formData.venue,
        venue_address: formData.venue_address || undefined,
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        preferred_style: formData.preferred_style,
        notes: formData.notes || undefined,
        create_default_milestones: formData.create_default_milestones,
      };

      const result = await createWedding(weddingData);

      if (result.success) {
        // Show success notification
        alert('Wedding created successfully! 🎉');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          couple_names: '',
          couple_email: '',
          couple_phone: '',
          event_date: '',
          venue: '',
          venue_address: '',
          guest_count: '',
          budget: '',
          preferred_style: 'classic',
          notes: '',
          create_default_milestones: true,
        });
      } else {
        setError(result.error || 'Failed to create wedding');
      }
    } catch (err) {
      console.error('Error creating wedding:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create wedding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Wedding</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Couple Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Couple Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Couple Names */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couple Names <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="couple_names"
                  value={formData.couple_names}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.couple_names ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Sarah & Michael Rodriguez"
                  disabled={loading}
                />
                {errors.couple_names && (
                  <p className="mt-1 text-sm text-red-500">{errors.couple_names}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="couple_email"
                  value={formData.couple_email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.couple_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="sarah.rodriguez@email.com"
                  disabled={loading}
                />
                {errors.couple_email && (
                  <p className="mt-1 text-sm text-red-500">{errors.couple_email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="couple_phone"
                  value={formData.couple_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="+63 917 123 4567"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Wedding Details Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wedding Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wedding Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Wedding Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.event_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  title="Select wedding date"
                  aria-label="Wedding date"
                />
                {errors.event_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.event_date}</p>
                )}
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Guest Count
                </label>
                <input
                  type="number"
                  name="guest_count"
                  value={formData.guest_count}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.guest_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="150"
                  disabled={loading}
                />
                {errors.guest_count && (
                  <p className="mt-1 text-sm text-red-500">{errors.guest_count}</p>
                )}
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.venue ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Grand Ballroom, Makati Shangri-La"
                  disabled={loading}
                />
                {errors.venue && (
                  <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Budget (₱)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="500000"
                  disabled={loading}
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-500">{errors.budget}</p>
                )}
              </div>

              {/* Venue Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Address
                </label>
                <input
                  type="text"
                  name="venue_address"
                  value={formData.venue_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Ayala Avenue, Makati City"
                  disabled={loading}
                />
              </div>

              {/* Preferred Style */}
              <div className="md:col-span-2">
                <label htmlFor="preferred_style" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Style
                </label>
                <select
                  id="preferred_style"
                  name="preferred_style"
                  value={formData.preferred_style}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={loading}
                  title="Select preferred wedding style"
                  aria-label="Select preferred wedding style"
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="rustic">Rustic</option>
                  <option value="bohemian">Bohemian</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Any special requests or notes..."
                  disabled={loading}
                />
              </div>

              {/* Create Default Milestones Checkbox */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="create_default_milestones"
                    checked={formData.create_default_milestones}
                    onChange={handleChange}
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                    disabled={loading}
                    title="Create default milestones"
                    aria-label="Create default milestones"
                  />
                  <span className="text-sm text-gray-700">
                    Create default milestones (Venue deposit, Caterer, Photographer, etc.)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Wedding'}
          </button>
        </div>
      </div>
    </div>
  );
};
