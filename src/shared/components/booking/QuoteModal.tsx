import React, { useState } from 'react';
import { X, DollarSign, FileText, Calendar, Plus, Minus } from 'lucide-react';
import { bookingInteractionService, type QuoteDetails } from '../../services/bookingInteractionService';
import type { Booking } from '../../types/comprehensive-booking.types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onQuoteSent: () => void;
}

interface AdditionalService {
  name: string;
  price: number;
  included: boolean;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  booking,
  onQuoteSent
}) => {
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    basePrice: 0,
    downpaymentPercentage: 30,
    validUntil: '',
    terms: '',
    inclusions: [''],
    exclusions: [''],
    notes: ''
  });
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([
    { name: '', price: 0, included: false }
  ]);

  const addInclusionField = () => {
    setQuoteData(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, '']
    }));
  };

  const removeInclusionField = (index: number) => {
    setQuoteData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const updateInclusion = (index: number, value: string) => {
    setQuoteData(prev => ({
      ...prev,
      inclusions: prev.inclusions.map((item, i) => i === index ? value : item)
    }));
  };

  const addExclusionField = () => {
    setQuoteData(prev => ({
      ...prev,
      exclusions: [...prev.exclusions, '']
    }));
  };

  const removeExclusionField = (index: number) => {
    setQuoteData(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index)
    }));
  };

  const updateExclusion = (index: number, value: string) => {
    setQuoteData(prev => ({
      ...prev,
      exclusions: prev.exclusions.map((item, i) => i === index ? value : item)
    }));
  };

  const addAdditionalService = () => {
    setAdditionalServices(prev => [...prev, { name: '', price: 0, included: false }]);
  };

  const removeAdditionalService = (index: number) => {
    setAdditionalServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateAdditionalService = (index: number, field: keyof AdditionalService, value: any) => {
    setAdditionalServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ));
  };

  const calculateTotalPrice = () => {
    const additionalTotal = additionalServices
      .filter(service => service.included && service.name.trim())
      .reduce((sum, service) => sum + service.price, 0);
    return quoteData.basePrice + additionalTotal;
  };

  const calculateDownpayment = () => {
    return Math.round((calculateTotalPrice() * quoteData.downpaymentPercentage) / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalPrice = calculateTotalPrice();
      const downpaymentAmount = calculateDownpayment();

      // Set default valid until date (30 days from now)
      const validUntil = quoteData.validUntil || 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const quote: QuoteDetails = {
        basePrice: quoteData.basePrice,
        additionalServices: additionalServices.filter(service => service.name.trim()),
        totalPrice,
        downpaymentAmount,
        downpaymentPercentage: quoteData.downpaymentPercentage,
        validUntil,
        terms: quoteData.terms,
        inclusions: quoteData.inclusions.filter(item => item.trim()),
        exclusions: quoteData.exclusions.filter(item => item.trim()),
        notes: quoteData.notes
      };

      await bookingInteractionService.sendQuote(booking.id, quote);
      onQuoteSent();
      onClose();
    } catch (error) {
      console.error('Failed to send quote:', error);
      alert('Failed to send quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Send Quote</h2>
              <p className="text-gray-600 mt-1">
                Booking #{booking.id.slice(-8)} - {booking.service_type}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Details Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">{new Date(booking.event_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{booking.event_location || 'TBD'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Guests:</span>
                  <span className="ml-2 font-medium">{booking.guest_count || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Budget Range:</span>
                  <span className="ml-2 font-medium">{booking.budget_range || 'Not specified'}</span>
                </div>
              </div>
              {booking.special_requests && (
                <div className="mt-3">
                  <span className="text-gray-600">Special Requests:</span>
                  <p className="text-sm mt-1">{booking.special_requests}</p>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Service Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={quoteData.basePrice || ''}
                    onChange={(e) => setQuoteData(prev => ({
                      ...prev,
                      basePrice: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Downpayment Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Downpayment Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quoteData.downpaymentPercentage}
                    onChange={(e) => setQuoteData(prev => ({
                      ...prev,
                      downpaymentPercentage: parseInt(e.target.value) || 0
                    }))}
                    className="w-full pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Services (Optional)
                </label>
                <button
                  type="button"
                  onClick={addAdditionalService}
                  className="text-sm text-rose-600 hover:text-rose-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Service
                </button>
              </div>
              <div className="space-y-3">
                {additionalServices.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={service.included}
                      onChange={(e) => updateAdditionalService(index, 'included', e.target.checked)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateAdditionalService(index, 'name', e.target.value)}
                      placeholder="Service name"
                      className="flex-1 py-2 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.price || ''}
                        onChange={(e) => updateAdditionalService(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-24 pl-7 pr-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      />
                    </div>
                    {additionalServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAdditionalService(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quote Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Valid Until
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={quoteData.validUntil}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to set automatically (30 days from now)
              </p>
            </div>

            {/* Inclusions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  What's Included
                </label>
                <button
                  type="button"
                  onClick={addInclusionField}
                  className="text-sm text-rose-600 hover:text-rose-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {quoteData.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inclusion}
                      onChange={(e) => updateInclusion(index, e.target.value)}
                      placeholder="e.g., Pre-wedding consultation"
                      className="flex-1 py-2 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {quoteData.inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInclusionField(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  What's Not Included
                </label>
                <button
                  type="button"
                  onClick={addExclusionField}
                  className="text-sm text-rose-600 hover:text-rose-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {quoteData.exclusions.map((exclusion, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={exclusion}
                      onChange={(e) => updateExclusion(index, e.target.value)}
                      placeholder="e.g., Travel expenses outside Metro Manila"
                      className="flex-1 py-2 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {quoteData.exclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExclusionField(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms and Conditions
              </label>
              <textarea
                value={quoteData.terms}
                onChange={(e) => setQuoteData(prev => ({ ...prev, terms: e.target.value }))}
                rows={4}
                placeholder="Enter your terms and conditions..."
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Any additional information for the couple..."
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Quote Summary */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h3 className="font-semibold text-rose-900 mb-3">Quote Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Service:</span>
                  <span>₱{quoteData.basePrice.toLocaleString()}</span>
                </div>
                {additionalServices
                  .filter(service => service.included && service.name.trim())
                  .map((service, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{service.name}:</span>
                      <span>₱{service.price.toLocaleString()}</span>
                    </div>
                  ))}
                <div className="border-t border-rose-300 pt-2 flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>₱{calculateTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>Downpayment ({quoteData.downpaymentPercentage}%):</span>
                  <span>₱{calculateDownpayment().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !quoteData.basePrice}
                className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Quote'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
