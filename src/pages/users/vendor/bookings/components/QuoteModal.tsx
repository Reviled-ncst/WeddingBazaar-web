import React, { useState, useEffect } from 'react';
import { X, Send, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuoteModalProps {
  booking: {
    id: string;
    coupleName: string;
    serviceType: string;
    eventDate: string;
    eventLocation?: string;
    guestCount?: number;
    specialRequests?: string;
    budgetRange?: string;
    quoteAmount?: number;
    status: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuote: (quoteData: QuoteData) => Promise<void>;
  isEditing?: boolean;
}

export interface QuoteData {
  bookingId: string;
  amount: number;
  description: string;
  deliveryDate: string;
  terms: string;
  validUntil: string;
  includeBreakdown: boolean;
  breakdown?: {
    basePrice: number;
    additionalServices: { name: string; price: number }[];
    taxes: number;
    discount: number;
  };
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSubmitQuote,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<QuoteData>({
    bookingId: '',
    amount: 0,
    description: '',
    deliveryDate: '',
    terms: '',
    validUntil: '',
    includeBreakdown: false,
    breakdown: {
      basePrice: 0,
      additionalServices: [],
      taxes: 0,
      discount: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (booking && isOpen) {
      // Calculate default delivery date (event date - 1 day)
      const eventDate = new Date(booking.eventDate);
      const deliveryDate = new Date(eventDate);
      deliveryDate.setDate(eventDate.getDate() - 1);

      // Calculate default valid until (30 days from now)
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      setFormData({
        bookingId: booking.id,
        amount: booking.quoteAmount || 0,
        description: `Professional ${booking.serviceType} services for ${booking.coupleName}'s wedding`,
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        terms: `• Full payment required 48 hours before event\n• Cancellation policy: 50% refund if cancelled 7+ days prior\n• Includes setup and cleanup\n• Travel charges may apply for venues >50km`,
        validUntil: validUntil.toISOString().split('T')[0],
        includeBreakdown: false,
        breakdown: {
          basePrice: booking.quoteAmount || 0,
          additionalServices: [],
          taxes: 0,
          discount: 0
        }
      });
      setErrors({});
    }
  }, [booking, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Quote amount is required and must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Service description is required';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else {
      const deliveryDate = new Date(formData.deliveryDate);
      const eventDate = new Date(booking?.eventDate || '');
      if (deliveryDate >= eventDate) {
        newErrors.deliveryDate = 'Delivery date must be before the event date';
      }
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Quote validity date is required';
    } else {
      const validUntil = new Date(formData.validUntil);
      const today = new Date();
      if (validUntil <= today) {
        newErrors.validUntil = 'Quote must be valid for at least one day';
      }
    }

    if (!formData.terms.trim()) {
      newErrors.terms = 'Terms and conditions are required';
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
    try {
      await onSubmitQuote(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit quote:', error);
      setErrors({ submit: 'Failed to submit quote. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addAdditionalService = () => {
    if (formData.breakdown) {
      setFormData({
        ...formData,
        breakdown: {
          ...formData.breakdown,
          additionalServices: [
            ...formData.breakdown.additionalServices,
            { name: '', price: 0 }
          ]
        }
      });
    }
  };

  const updateAdditionalService = (index: number, field: 'name' | 'price', value: string | number) => {
    if (formData.breakdown) {
      const updatedServices = [...formData.breakdown.additionalServices];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      
      setFormData({
        ...formData,
        breakdown: {
          ...formData.breakdown,
          additionalServices: updatedServices
        }
      });
    }
  };

  const removeAdditionalService = (index: number) => {
    if (formData.breakdown) {
      const updatedServices = formData.breakdown.additionalServices.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        breakdown: {
          ...formData.breakdown,
          additionalServices: updatedServices
        }
      });
    }
  };

  const calculateTotal = () => {
    if (!formData.includeBreakdown || !formData.breakdown) {
      return formData.amount;
    }

    const basePrice = formData.breakdown.basePrice || 0;
    const additionalTotal = formData.breakdown.additionalServices.reduce((sum, service) => sum + (service.price || 0), 0);
    const taxes = formData.breakdown.taxes || 0;
    const discount = formData.breakdown.discount || 0;

    return basePrice + additionalTotal + taxes - discount;
  };

  if (!booking) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {isEditing ? 'Update Quote' : 'Send Quote'}
                  </h2>
                  <p className="text-rose-100">
                    For {booking.coupleName} • {booking.serviceType}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Close quote modal"
                  aria-label="Close quote modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Booking Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Event Date:</span>
                      <span className="ml-2 font-medium">{new Date(booking.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{booking.eventLocation || 'TBD'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Guests:</span>
                      <span className="ml-2 font-medium">{booking.guestCount || 'TBD'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget Range:</span>
                      <span className="ml-2 font-medium">{booking.budgetRange || 'Not specified'}</span>
                    </div>
                  </div>
                  {booking.specialRequests && (
                    <div className="mt-4">
                      <span className="text-gray-600 block mb-2">Special Requests:</span>
                      <p className="text-sm bg-white rounded-lg p-3 border">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Quote Amount */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Quote Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-lg font-semibold"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Service Description */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Service Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Describe what services you'll provide..."
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Delivery Date */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">
                      Service Delivery Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    {errors.deliveryDate && (
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.deliveryDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">
                      Quote Valid Until *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    {errors.validUntil && (
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.validUntil}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown Toggle */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.includeBreakdown}
                      onChange={(e) => setFormData({ ...formData, includeBreakdown: e.target.checked })}
                      className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      Include detailed price breakdown
                    </span>
                  </label>

                  {formData.includeBreakdown && formData.breakdown && (
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <h4 className="font-semibold text-gray-900">Price Breakdown</h4>
                      
                      {/* Base Price */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Base Price</label>
                          <input
                            type="number"
                            value={formData.breakdown.basePrice}
                            onChange={(e) => setFormData({
                              ...formData,
                              breakdown: { ...formData.breakdown!, basePrice: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                            step="0.01"
                            min="0"
                            title="Enter base service price"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Additional Services */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm text-gray-600">Additional Services</label>
                          <button
                            type="button"
                            onClick={addAdditionalService}
                            className="text-rose-600 text-sm hover:text-rose-700"
                          >
                            + Add Service
                          </button>
                        </div>
                        {formData.breakdown.additionalServices.map((service, index) => (
                          <div key={index} className="flex gap-3 mb-2">
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => updateAdditionalService(index, 'name', e.target.value)}
                              placeholder="Service name"
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                            />
                            <input
                              type="number"
                              value={service.price}
                              onChange={(e) => updateAdditionalService(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="Price"
                              className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                              step="0.01"
                              min="0"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalService(index)}
                              className="text-red-600 hover:text-red-700 px-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Taxes and Discount */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Taxes/Fees</label>
                          <input
                            type="number"
                            value={formData.breakdown.taxes}
                            onChange={(e) => setFormData({
                              ...formData,
                              breakdown: { ...formData.breakdown!, taxes: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                            step="0.01"
                            min="0"
                            title="Enter taxes and fees"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Discount</label>
                          <input
                            type="number"
                            value={formData.breakdown.discount}
                            onChange={(e) => setFormData({
                              ...formData,
                              breakdown: { ...formData.breakdown!, discount: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                            step="0.01"
                            min="0"
                            title="Enter discount amount"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Total:</span>
                          <span className="text-rose-600">₱{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Terms and Conditions *
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Enter your terms and conditions..."
                  />
                  {errors.terms && (
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.terms}
                    </p>
                  )}
                </div>

                {/* Error Display */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {loading ? 'Sending...' : (isEditing ? 'Update Quote' : 'Send Quote')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
