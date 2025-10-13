// SIMPLE FIX: Direct vendor bookings loader
// This replaces the overly complex mapping system

export async function loadVendorBookingsSimple(vendorId: string, apiUrl: string) {
  console.log('📡 [SIMPLE] Loading bookings for vendor:', vendorId);
  
  try {
    const response = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
    const data = await response.json();
    
    console.log('📊 [SIMPLE] API Response:', {
      status: response.status,
      success: data.success,
      bookingCount: data.bookings?.length || 0,
      data: data
    });
    
    if (response.status === 200 && data.success && data.bookings) {
      console.log(`✅ [SIMPLE] Found ${data.bookings.length} bookings`);
      
      // Convert to UI format
      const uiBookings = data.bookings.map((booking: any) => ({
        id: booking.id,
        vendorId: booking.vendor_id,
        coupleId: booking.couple_id,
        coupleName: booking.couple_name || `Customer ${booking.couple_id}`,
        contactEmail: booking.contact_email || 'Email not provided',
        contactPhone: booking.contact_phone || 'Phone not provided', 
        serviceType: booking.service_type || booking.service_name || 'Service',
        serviceName: booking.service_name || 'Wedding Service',
        eventDate: booking.event_date || new Date().toISOString().split('T')[0],
        eventTime: booking.event_time || '18:00',
        eventLocation: booking.event_location || 'Venue TBD',
        guestCount: booking.guest_count || 'TBD',
        specialRequests: booking.special_requests || 'None specified',
        status: booking.status || 'pending',
        budgetRange: booking.budget_range || 'To be discussed',
        totalAmount: parseFloat(booking.total_amount || '0'),
        quoteAmount: parseFloat(booking.quote_amount || booking.total_amount || '0'),
        totalPaid: parseFloat(booking.total_paid || '0'),
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        notes: booking.notes || '',
        responseMessage: booking.response_message || '',
        formatted: {
          totalAmount: `₱${parseFloat(booking.total_amount || '0').toLocaleString()}`,
          totalPaid: `₱${parseFloat(booking.total_paid || '0').toLocaleString()}`,
        }
      }));
      
      return {
        success: true,
        bookings: uiBookings,
        count: uiBookings.length
      };
    } else if (response.status === 403) {
      return {
        success: false,
        error: 'Backend security is blocking this vendor ID. Security fix deployment in progress.',
        blocked: true
      };
    } else {
      return {
        success: false,
        error: `API error: ${response.status} - ${data.error || 'Unknown error'}`,
        bookings: []
      };
    }
    
  } catch (error) {
    console.error('💥 [SIMPLE] API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`,
      bookings: []
    };
  }
}
