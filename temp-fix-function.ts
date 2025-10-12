// TEMPORARY FIX FILE - Clean handleAcceptQuotation function
// This contains the properly structured function to replace the broken one

const handleAcceptQuotation = async (booking: EnhancedBooking) => {
  try {
    console.log('✅ [AcceptQuotation] Starting quote acceptance for booking:', booking.id);
    
    // For test bookings (those starting with 'test-'), handle locally
    if (booking.id.startsWith('test-')) {
      console.log('🧪 [AcceptQuotation] Handling test booking locally');
      
      // Update the booking status to 'quote_accepted' locally
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === booking.id 
            ? { 
                ...b, 
                status: 'quote_accepted' as BookingStatus,
                updatedAt: new Date().toISOString()
              }
            : b
        )
      );

      // Show success notification with payment options
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 max-w-sm';
      notification.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="text-2xl flex-shrink-0">✅</div>
          <div class="flex-1">
            <div class="font-semibold">Quote Accepted!</div>
            <div class="text-sm opacity-90 mb-2">You can now proceed with payment</div>
            <div class="text-xs bg-green-600 bg-opacity-50 rounded p-2 mt-2">
              💳 <strong>Next:</strong> Choose to pay deposit or full amount
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 5000);

      console.log('✅ [AcceptQuotation] Test booking quote accepted successfully');
      return;
    }

    // Use new API acceptQuote method for real bookings
    console.log('🌐 [AcceptQuotation] Using API acceptQuote method');
    
    const result = await bookingApiService.acceptQuote(booking.id, 'Quote accepted by couple - Ready for payment');
    
    if (result.success && result.booking) {
      // Update local bookings state to reflect acceptance
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === booking.id 
            ? { 
                ...b, 
                status: 'quote_accepted' as BookingStatus,
                updatedAt: new Date().toISOString()
              }
            : b
        )
      );

      // Show success notification with payment options
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 max-w-sm';
      notification.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="text-2xl flex-shrink-0">✅</div>
          <div class="flex-1">
            <div class="font-semibold">Quote Accepted!</div>
            <div class="text-sm opacity-90 mb-2">${result.message || 'You can now proceed with payment'}</div>
            <div class="text-xs bg-green-600 bg-opacity-50 rounded p-2 mt-2">
              💳 <strong>Next:</strong> Choose to pay deposit or full amount
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 5000);

      console.log('✅ [AcceptQuotation] Quote accepted successfully via API');
      
      // Reload bookings to get updated data
      await loadBookings();
      
    } else {
      throw new Error(result.error || 'Failed to accept quote');
    }
    
  } catch (error) {
    console.error('❌ [AcceptQuotation] Error accepting quote:', error);
    
    // Show error notification
    const errorNotification = document.createElement('div');
    errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 max-w-sm';
    errorNotification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="text-2xl flex-shrink-0">❌</div>
        <div class="flex-1">
          <div class="font-semibold">Quote Acceptance Failed</div>
          <div class="text-sm opacity-90">${error instanceof Error ? error.message : 'Please try again'}</div>
        </div>
      </div>
    `;
    document.body.appendChild(errorNotification);

    setTimeout(() => {
      errorNotification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(errorNotification), 300);
    }, 5000);
    
    // Fallback to localStorage for persistence
    console.log('📦 [AcceptQuotation] Falling back to localStorage-based acceptance');
    QuoteAcceptanceService.acceptQuote(booking.id, 'Quotation accepted by couple - Ready for payment');
    
    // Update local bookings state to reflect acceptance
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === booking.id 
          ? { ...b, status: 'quote_accepted' as any }
          : b
      )
    );
  }
};
