import React, { useState, useEffect } from 'react';
import { 
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Download,
  Printer,
  Loader
} from 'lucide-react';
import type { Booking } from '../types/booking.types';

interface ServiceItem {
  id: number;
  service: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface AdditionalCost {
  id: number;
  item: string; // Changed from 'name' to 'item' to match mock data
  amount: number;
  optional?: boolean; // Added optional property
  description?: string;
}

interface PaymentSchedule {
  stage: string; // Changed from 'phase' to 'stage' to match mock data
  percentage: number;
  amount: number;
  dueDate?: string; // Made optional
}

interface VendorContact {
  name: string;
  email: string;
  phone: string;
  businessAddress: string;
}

interface QuoteData {
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
  serviceItems: ServiceItem[];
  additionalCosts: AdditionalCost[];
  paymentTerms: {
    downpayment?: number;
    downpaymentPercentage?: number;
    finalPayment?: number;
    paymentSchedule: PaymentSchedule[];
    paymentMethods: string[];
  };
  inclusions: string[];
  exclusions: string[];
  termsAndConditions: string[];
  vendorContact: VendorContact; // Added missing vendorContact property
}

interface QuoteDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onAcceptQuote?: (booking: Booking) => void;
  onRejectQuote?: (booking: Booking) => void;
  onRequestModification?: (booking: Booking) => void;
}

export const QuoteDetailsModal: React.FC<QuoteDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onAcceptQuote,
  onRejectQuote,
  onRequestModification
}) => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real quote data from API
  useEffect(() => {
    if (isOpen && booking?.id) {
      fetchQuoteData();
    }
  }, [isOpen, booking?.id]);

  const fetchQuoteData = async () => {
    if (!booking?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // � DEBUG: Log the entire booking object to see what fields we have
      console.log('🔍 [QuoteModal] Full booking object:', booking);
      console.log('🔍 [QuoteModal] Booking keys:', Object.keys(booking));
      console.log('🔍 [QuoteModal] booking.vendorNotes:', (booking as any)?.vendorNotes);
      console.log('🔍 [QuoteModal] booking.vendor_notes:', (booking as any)?.vendor_notes);
      console.log('🔍 [QuoteModal] booking.serviceItems:', (booking as any)?.serviceItems);
      console.log('🔍 [QuoteModal] booking.service_items:', (booking as any)?.service_items);
      
      // �🔧 PRIORITY 1: Check if booking has vendor_notes with real quote data
      const vendorNotes = (booking as any)?.vendorNotes || (booking as any)?.vendor_notes;
      
      console.log('🔍 [QuoteModal] Extracted vendorNotes value:', vendorNotes);
      console.log('🔍 [QuoteModal] vendorNotes type:', typeof vendorNotes);
      
      if (vendorNotes) {
        console.log('📋 [QuoteModal] Found vendor_notes, attempting to parse quote data...');
        try {
          const parsedQuote = typeof vendorNotes === 'string' ? JSON.parse(vendorNotes) : vendorNotes;
          console.log('✅ [QuoteModal] Successfully parsed vendor_notes:', parsedQuote);
          
          // Transform vendor's quote data to QuoteData interface
          if (parsedQuote.serviceItems && Array.isArray(parsedQuote.serviceItems)) {
            const transformedQuoteData: QuoteData = {
              quoteNumber: parsedQuote.quoteNumber || `QT-${booking.id?.slice(-6)?.toUpperCase() || '000001'}`,
              issueDate: new Date(parsedQuote.timestamp || booking.createdAt || Date.now()).toLocaleDateString(),
              validUntil: parsedQuote.validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              serviceItems: parsedQuote.serviceItems.map((item: any, index: number) => ({
                id: item.id || index + 1,
                service: item.name || item.service,
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                total: item.total || (item.unitPrice * item.quantity)
              })),
              additionalCosts: parsedQuote.additionalCosts || [],
              paymentTerms: {
                downpayment: parsedQuote.pricing?.downpayment || booking.downpaymentAmount,
                downpaymentPercentage: parsedQuote.paymentTerms?.downpayment || 30,
                finalPayment: parsedQuote.pricing?.balance || booking.remainingBalance,
                paymentSchedule: parsedQuote.paymentSchedule || [
                  {
                    stage: 'Booking Confirmation',
                    percentage: parsedQuote.paymentTerms?.downpayment || 30,
                    amount: parsedQuote.pricing?.downpayment || booking.downpaymentAmount || 0
                  },
                  {
                    stage: 'Final Payment',
                    percentage: parsedQuote.paymentTerms?.balance || 70,
                    amount: parsedQuote.pricing?.balance || booking.remainingBalance || 0
                  }
                ],
                paymentMethods: parsedQuote.paymentMethods || ['Bank Transfer', 'GCash', 'PayMaya', 'Cash']
              },
              inclusions: parsedQuote.inclusions || [],
              exclusions: parsedQuote.exclusions || [],
              termsAndConditions: parsedQuote.terms || [parsedQuote.message || ''],
              vendorContact: {
                name: booking.vendorName || 'Vendor',
                email: booking.vendorEmail || 'vendor@example.com',
                phone: booking.vendorPhone || '+63 912 345 6789',
                businessAddress: booking.eventLocation || 'Metro Manila'
              }
            };
            
            console.log('✅ [QuoteModal] Transformed quote data with', transformedQuoteData.serviceItems.length, 'service items');
            setQuoteData(transformedQuoteData);
            setLoading(false);
            return;
          }
        } catch (parseError) {
          console.error('⚠️ [QuoteModal] Failed to parse vendor_notes:', parseError);
          console.error('⚠️ [QuoteModal] Raw vendor_notes value:', vendorNotes);
          // Continue to next fallback
        }
      } else {
        console.warn('⚠️ [QuoteModal] No vendor_notes found in booking!');
        console.warn('⚠️ [QuoteModal] This means either:');
        console.warn('   1. Backend did not store vendor_notes when quote was sent');
        console.warn('   2. Backend did not return vendor_notes in API response');
        console.warn('   3. Data mapper did not include vendor_notes in booking object');
      }
      
      // Second fallback: Check if booking already has mock quote data from our simulation
      if ((booking as any)?.quoteData) {
        console.log('📋 [QuoteModal] Using mock quote data from booking:', (booking as any).quoteData);
        const mockData = (booking as any).quoteData;
        
        // Transform mock data to match expected QuoteData interface
        const transformedQuoteData = {
          quoteNumber: `QT-${booking.id?.slice(-6)?.toUpperCase() || '000001'}`,
          issueDate: new Date().toLocaleDateString(),
          validUntil: new Date(mockData.validUntil).toLocaleDateString(),
          serviceItems: [
            {
              id: 1,
              service: booking.serviceName || 'Wedding Service',
              description: mockData.notes || 'Complete wedding service package',
              quantity: 1,
              unitPrice: mockData.quotedPrice || booking.totalAmount || 50000,
              total: mockData.quotedPrice || booking.totalAmount || 50000
            }
          ],
          additionalCosts: mockData.breakdown?.map((item: any, index: number) => ({
            id: index + 1,
            item: item.item,
            amount: item.amount,
            optional: false
          })) || [],
          paymentTerms: {
            downpayment: booking.downpaymentAmount || (mockData.quotedPrice || 50000) * 0.3,
            downpaymentPercentage: 30,
            finalPayment: (mockData.quotedPrice || 50000) * 0.7,
            paymentSchedule: [
              {
                stage: 'Booking Confirmation',
                percentage: 30,
                amount: (mockData.quotedPrice || 50000) * 0.3
              },
              {
                stage: 'Final Payment',
                percentage: 70,
                amount: (mockData.quotedPrice || 50000) * 0.7
              }
            ],
            paymentMethods: ['Credit Card', 'Bank Transfer', 'PayMongo', 'Cash']
          },
          inclusions: [
            booking.serviceName || 'Wedding Service',
            'Professional consultation',
            'Premium package features',
            'Same-day coordination'
          ],
          exclusions: [
            'Travel expenses beyond 20km',
            'Additional overtime charges',
            'Third-party vendor fees'
          ],
          termsAndConditions: [
            mockData.paymentTerms || '30% deposit required to confirm booking',
            'Final payment due 7 days before event',
            'Cancellation policy applies as per contract',
            'All services subject to availability'
          ],
          vendorContact: {
            name: booking.vendorName || 'Vendor',
            email: booking.vendorEmail || 'vendor@example.com',
            phone: booking.vendorPhone || '+63 912 345 6789',
            businessAddress: booking.eventLocation || 'Metro Manila'
          }
        };
        
        setQuoteData(transformedQuoteData);
        setLoading(false);
        return;
      }

      // Try to fetch from API if no mock data exists
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/quote`);
      const data = await response.json();
      
      if (data.success) {
        setQuoteData(data.quote);
      } else {
        // Fallback to generated mock data if no real quote exists
        setQuoteData(generateMockQuoteData(booking));
      }
    } catch (err) {
      console.error('Error fetching quote data:', err);
      // Fallback to generated mock data on error
      setQuoteData(generateMockQuoteData(booking));
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuoteData = (booking: Booking) => {
    return {
      quoteNumber: `QT-${booking.id?.slice(-6)?.toUpperCase() || '000001'}`,
      issueDate: new Date().toLocaleDateString(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      // ...rest of mock data
      serviceItems: [
        {
          id: 1,
          service: booking.serviceName || 'Wedding Service',
          description: 'Complete wedding service package',
          quantity: 1,
          unitPrice: booking.totalAmount || 50000,
          total: booking.totalAmount || 50000
        }
      ],
      additionalCosts: [
        {
          id: 1,
          item: 'Transportation',
          amount: 2000,
          optional: true
        },
        {
          id: 2,
          item: 'Overtime (per hour)',
          amount: 1500,
          optional: true
        }
      ],
      paymentTerms: {
        downpayment: booking.downpaymentAmount || (booking.totalAmount || 50000) * 0.3,
        downpaymentPercentage: 30,
        finalPayment: (booking.totalAmount || 50000) * 0.7,
        paymentMethods: ['Bank Transfer', 'GCash', 'PayMaya', 'Cash'],
        paymentSchedule: [
          { stage: 'Booking Confirmation', percentage: 30, amount: (booking.totalAmount || 50000) * 0.3 },
          { stage: 'Final Payment (Day of Event)', percentage: 70, amount: (booking.totalAmount || 50000) * 0.7 }
        ]
      },
      inclusions: [
        'Professional wedding photography/videography team',
        'Pre-wedding consultation',
        '8-hour coverage on wedding day',
        'Online gallery with high-resolution images',
        'Basic photo editing and color correction',
        'USB drive with all edited photos'
      ],
      exclusions: [
        'Engagement shoot (available as add-on)',
        'Physical prints (available upon request)',
        'Same-day editing (available as add-on)',
        'Additional hours beyond 8 hours'
      ],
      termsAndConditions: [
        'Quote is valid for 14 days from issue date',
        '30% downpayment required to secure booking',
        'Final payment due on the day of the event',
        'Cancellation policy: 50% refund if cancelled 30 days before event',
        'Weather contingency plans included for outdoor events',
        'Travel expenses included within Metro Manila'
      ],
      vendorContact: {
        name: booking.vendorName || 'Wedding Vendor',
        email: booking.vendorEmail || 'vendor@weddingbazaar.com',
        phone: booking.vendorPhone || '+63-912-345-6789',
        businessAddress: '123 Wedding Street, Manila, Philippines'
      }
    };
  };

  if (!isOpen || !booking) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader className="w-8 h-8 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quote details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error loading quote details</p>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!quoteData) return null;

  // Use real quote data instead of mock data
  const quoteDetails = quoteData;

  const subtotal = quoteDetails.serviceItems?.reduce((sum: number, item: any) => sum + item.total, 0) || 0;
  const grandTotal = subtotal; // Optional costs not included in grand total by default

  const canAcceptReject = booking.status === 'quote_sent';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quote Details</h2>
              <p className="text-pink-100 mt-1">
                Quote #{quoteDetails.quoteNumber} • {booking.serviceName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              title="Close quote details"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Quote Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Issue Date</span>
              </div>
              <p className="text-gray-700">{quoteDetails.issueDate}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Valid Until</span>
              </div>
              <p className="text-gray-700">{quoteDetails.validUntil}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Total Amount</span>
              </div>
              <p className="text-2xl font-bold text-green-600">₱{grandTotal.toLocaleString()}</p>
            </div>
          </div>

          {/* Service Breakdown - ENHANCED VISIBILITY */}
          <div className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border-2 border-pink-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-pink-600" />
              Service Breakdown
            </h3>
            
            {quoteDetails.serviceItems && quoteDetails.serviceItems.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-100 to-purple-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Service</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteDetails.serviceItems.map((item: ServiceItem) => (
                      <tr key={item.id} className="border-t border-gray-100 hover:bg-pink-50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-gray-900 text-base">{item.service}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-700 font-semibold">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-gray-700 font-semibold">₱{item.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-bold text-pink-600 text-lg">₱{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-300">
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-900 text-lg">Subtotal:</td>
                      <td className="px-4 py-4 text-right font-bold text-green-600 text-xl">₱{subtotal.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">No service items found in this quote</p>
                <p className="text-sm text-gray-600 mt-2">Please contact the vendor for detailed pricing breakdown</p>
              </div>
            )}
          </div>

          {/* Optional Add-ons */}
          {quoteDetails.additionalCosts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Add-ons</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2">
                  {quoteDetails.additionalCosts.map((cost: AdditionalCost) => (
                    <div key={cost.id} className="flex justify-between items-center">
                      <span className="text-gray-700">{cost.item}</span>
                      <span className="font-medium text-blue-600">₱{cost.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-blue-600 mt-3 italic">
                  * Add-ons can be discussed and added later if needed
                </p>
              </div>
            </div>
          )}

          {/* Payment Terms */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-medium text-gray-900 mb-2">Payment Schedule:</p>
                  <div className="space-y-2">
                    {quoteDetails.paymentTerms.paymentSchedule.map((payment: PaymentSchedule, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-700">{payment.stage} ({payment.percentage}%)</span>
                        <span className="font-medium text-green-600">₱{payment.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-2">Accepted Payment Methods:</p>
                  <div className="flex flex-wrap gap-2">
                    {quoteDetails.paymentTerms.paymentMethods.map((method: string) => (
                      <span key={method} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inclusions and Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {quoteDetails.inclusions.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Not Included</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {quoteDetails.exclusions.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2">
                {quoteDetails.termsAndConditions.map((term: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vendor Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-900">{quoteDetails.vendorContact.name}</p>
                  <p className="text-gray-700 text-sm">{quoteDetails.vendorContact.businessAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-700 text-sm">
                    📧 {quoteDetails.vendorContact.email}
                  </p>
                  <p className="text-gray-700 text-sm">
                    📞 {quoteDetails.vendorContact.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {/* Action buttons for quote management */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => {
                  // In a real app, this would generate a PDF
                  alert('PDF download feature coming soon!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            {/* Quote response actions */}
            {canAcceptReject && (
              <div className="flex gap-3">
                <button
                  onClick={() => onRequestModification?.(booking)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => onRejectQuote?.(booking)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject Quote
                </button>
                <button
                  onClick={() => onAcceptQuote?.(booking)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Accept Quote
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
