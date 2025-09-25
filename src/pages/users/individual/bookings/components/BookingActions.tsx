import React, { useState } from 'react';
import type { Booking } from '../types/booking.types';

interface BookingActionsProps {
  booking: Booking;
  onViewDetails?: (booking: Booking) => void;
  onBookingUpdate: (updatedBooking: Booking) => void;
  onViewQuoteDetails?: (booking: Booking) => void;
  onPayDeposit?: (booking: Booking) => void;
  onPayBalance?: (booking: Booking) => void;
}

export const BookingActions: React.FC<BookingActionsProps> = ({ 
  booking, 
  onViewDetails,
  onBookingUpdate, 
  onViewQuoteDetails,
  onPayDeposit,
  onPayBalance 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Debug logging
  console.log('BookingActions: Rendering for booking', booking.id, 'with status:', booking.status);

  const handleAction = async (action: string, data?: any) => {
    setLoading(action);
    try {
      let response;
      
      switch (action) {
        case 'accept-quote':
          response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/accept-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: data?.message || 'Quote accepted' })
          });
          break;
          
        case 'reject-quote':
          response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/reject-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: data?.reason || 'Quote rejected' })
          });
          break;
          
        case 'send-quote':
          response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/send-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              quoteDetails: {
                totalPrice: data?.totalPrice || 50000,
                downpaymentAmount: data?.downpaymentAmount || 15000,
                description: data?.description || 'Wedding service quote'
              }
            })
          });
          break;
          
        case 'payment':
          response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: data?.amount || 15000,
              paymentType: data?.paymentType || 'downpayment',
              paymentMethod: data?.paymentMethod || 'credit_card',
              paymentReference: `PAY-${Date.now()}`
            })
          });
          break;
          
        case 'confirm':
          response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Booking confirmed' })
          });
          break;
          
        default:
          throw new Error('Unknown action');
      }
      
      if (response?.ok) {
        const result = await response.json();
        if (result.success && result.booking) {
          // Update the booking with new status
          const updatedBooking = { ...booking, ...result.booking };
          onBookingUpdate(updatedBooking);
          
          // Close modals
          setShowQuoteModal(false);
          setShowRejectModal(false);
        }
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    
    console.log('BookingActions: Getting actions for status:', booking.status);
    
    switch (booking.status) {
      case 'quote_requested':
        actions.push({ 
          id: 'send-quote', 
          label: 'Send Quote', 
          color: 'bg-blue-500 hover:bg-blue-600',
          icon: '💰'
        });
        break;
        
      case 'quote_sent':
        // Add view quote details button first
        actions.push({
          id: 'view-quote',
          label: 'View Quote Details',
          color: 'bg-blue-500 hover:bg-blue-600',
          icon: '📄'
        });
        actions.push(
          { 
            id: 'accept-quote', 
            label: 'Accept Quote', 
            color: 'bg-green-500 hover:bg-green-600',
            icon: '✅'
          },
          { 
            id: 'reject-quote', 
            label: 'Reject Quote', 
            color: 'bg-red-500 hover:bg-red-600',
            icon: '❌'
          }
        );
        break;
        
      case 'quote_accepted':
        actions.push({ 
          id: 'pay_deposit', 
          label: 'Pay Deposit', 
          color: 'bg-purple-500 hover:bg-purple-600',
          icon: '💳'
        });
        break;
        
      case 'downpayment_paid':
        actions.push({ 
          id: 'pay_balance', 
          label: 'Pay Balance', 
          color: 'bg-purple-500 hover:bg-purple-600',
          icon: '💰'
        });
        actions.push({ 
          id: 'confirm', 
          label: 'Confirm Booking', 
          color: 'bg-green-500 hover:bg-green-600',
          icon: '🎯'
        });
        break;
        
      default:
        // For any other status, show view details action
        actions.push({ 
          id: 'view-details', 
          label: 'View Details', 
          color: 'bg-pink-600 hover:bg-pink-700',
          icon: '�️'
        });
        break;
    }
    
    console.log('BookingActions: Available actions for', booking.status, ':', actions);
    return actions;
  };

  const availableActions = getAvailableActions();

  console.log('BookingActions: Final render check - availableActions:', availableActions);

  if (availableActions.length === 0) {
    console.log('BookingActions: No actions available, returning null');
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">{/* Clean action buttons */}
        {availableActions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (action.id === 'send-quote') {
                setShowQuoteModal(true);
              } else if (action.id === 'pay_deposit') {
                // Call parent handler for deposit payment
                onPayDeposit?.(booking);
              } else if (action.id === 'pay_balance') {
                // Call parent handler for balance payment
                onPayBalance?.(booking);
              } else if (action.id === 'reject-quote') {
                setShowRejectModal(true);
              } else if (action.id === 'view-quote') {
                onViewQuoteDetails?.(booking);
              } else if (action.id === 'accept-quote') {
                const confirmed = window.confirm(
                  `Are you sure you want to accept the quote?\n\n` +
                  `Vendor: ${booking.vendorName}\n` +
                  `Service: ${booking.serviceType}\n` +
                  `Event Date: ${booking.eventDate}\n\n` +
                  'This action cannot be undone.'
                );
                if (confirmed) {
                  handleAction(action.id);
                }
              } else if (action.id === 'confirm') {
                const confirmed = window.confirm(
                  `Are you sure you want to confirm this booking?\n\n` +
                  `Vendor: ${booking.vendorName}\n` +
                  `Service: ${booking.serviceType}\n` +
                  `Event Date: ${booking.eventDate}\n\n` +
                  'This will finalize your booking.'
                );
                if (confirmed) {
                  handleAction(action.id);
                }
              } else if (action.id === 'view-details') {
                // Call parent handler to open booking details modal
                onViewDetails?.(booking);
              } else {
                handleAction(action.id);
              }
            }}
            disabled={loading === action.id}
            className={`
              px-4 py-2 rounded-xl text-white font-medium text-sm
              ${action.color}
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 hover:shadow-lg
              flex items-center gap-2 min-w-[120px] justify-center
              border border-transparent hover:border-white/20
            `}
          >
            <span>{action.icon}</span>
            {loading === action.id ? 'Processing...' : action.label}
          </button>
        ))}
      </div>

      {/* Send Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Send Quote</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAction('send-quote', {
                totalPrice: Number(formData.get('totalPrice')),
                downpaymentAmount: Number(formData.get('downpaymentAmount')),
                description: formData.get('description')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="totalPrice" className="block text-sm font-medium mb-2">Total Price (₱)</label>
                  <input
                    id="totalPrice"
                    name="totalPrice"
                    type="number"
                    defaultValue={50000}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter total price"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="downpaymentAmount" className="block text-sm font-medium mb-2">Downpayment (₱)</label>
                  <input
                    id="downpaymentAmount"
                    name="downpaymentAmount"
                    type="number"
                    defaultValue={15000}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter downpayment amount"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue="Professional wedding service package"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter service description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading === 'send-quote'}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"
                >
                  {loading === 'send-quote' ? 'Sending...' : 'Send Quote'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Quote Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Reject Quote</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAction('reject-quote', {
                reason: formData.get('reason')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for rejection</label>
                  <textarea
                    name="reason"
                    placeholder="Please provide a reason for rejecting this quote..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading === 'reject-quote'}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
                >
                  {loading === 'reject-quote' ? 'Rejecting...' : 'Reject Quote'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
