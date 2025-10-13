// SECURITY FIX FOR VENDORBOOKINGS.TSX
// This file contains the corrected loadBookings function that only loads bookings for the authenticated vendor

const loadBookings = async (silent = false) => {
  try {
    if (!silent) setLoading(true);
    console.log('🔒 [VendorBookings] SECURE VERSION - Loading bookings for authenticated vendor only:', vendorId);
    
    // SECURITY: Only use authenticated vendor's ID - no testing multiple vendor IDs
    const directResponse = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
    const directData = await directResponse.json();
    
    console.log(`🔗 [VendorBookings] API Response for vendor ${vendorId}:`, directData);
    
    if (directData.success && directData.bookings) {
      let allBookingsData = directData.bookings;
      
      console.log(`✅ [VendorBookings] Found ${allBookingsData.length} bookings for vendor ${vendorId}`);
      
      // SECURITY: Additional client-side filter to ensure no cross-vendor data leakage
      const secureBookings = allBookingsData.filter((booking: any) => {
        const bookingVendorId = booking.vendor_id;
        const isValid = bookingVendorId === vendorId || bookingVendorId === vendorId.split('-')[0];
        
        if (!isValid) {
          console.warn(`⚠️ [VendorBookings] SECURITY: Filtering out booking ${booking.id} - vendor_id ${bookingVendorId} doesn't match authenticated vendor ${vendorId}`);
        }
        
        return isValid;
      });
      
      console.log(`🔒 [VendorBookings] Security filter: ${secureBookings.length}/${allBookingsData.length} bookings are valid for vendor ${vendorId}`);
      
      if (secureBookings.length > 0) {
        console.log('✅ [VendorBookings] Converting secure bookings to UI format...');
        
        // Convert raw bookings to UI format with enhanced couple name lookup
        const uiBookingsPromises = secureBookings.map(async (booking: any) => {
          // Get enhanced couple name with API lookup
          const coupleName = await getCoupleDisplayName(booking);
          
          return {
            id: booking.id,
            vendorId: booking.vendor_id || vendorId,
            vendorName: booking.vendor_name || 'Vendor',
            coupleId: booking.couple_id,
            coupleName: coupleName,
            contactEmail: booking.contact_email || 'no-email@example.com',
            contactPhone: booking.contact_phone || 'N/A',
            serviceType: booking.service_type || booking.service_name || 'Service',
            eventDate: booking.event_date ? booking.event_date.split('T')[0] : 'TBD',
            eventTime: booking.event_time || 'TBD',
            eventLocation: booking.event_location || 'TBD',
            guestCount: booking.guest_count || 0,
            specialRequests: booking.special_requests || '',
            status: booking.status || 'pending',
            budgetRange: booking.budget_range || 'TBD',
            totalAmount: booking.total_amount || 0,
            quoteAmount: booking.quote_amount,
            downpaymentAmount: booking.deposit_amount,
            totalPaid: booking.total_paid || 0,
            remainingBalance: (booking.total_amount || 0) - (booking.total_paid || 0),
            paymentProgressPercentage: booking.total_amount ? ((booking.total_paid || 0) / booking.total_amount) * 100 : 0,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at,
            preferredContactMethod: booking.preferred_contact_method || 'email',
            responseMessage: booking.response_message,
            formatted: {
              totalAmount: formatPHP(booking.total_amount || 0),
              totalPaid: formatPHP(booking.total_paid || 0),
              remainingBalance: formatPHP((booking.total_amount || 0) - (booking.total_paid || 0)),
              downpaymentAmount: formatPHP(booking.deposit_amount || 0)
            }
          };
        });
        
        // Wait for all couple name lookups to complete
        const uiBookings = await Promise.all(uiBookingsPromises);
        
        console.log('🎯 [VendorBookings] SECURE SUCCESS - Setting', uiBookings.length, 'bookings for vendor', vendorId);
        setBookings(uiBookings);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_items: uiBookings.length,
          per_page: 10,
          hasNext: false,
          hasPrev: false
        });
        
        // Show success notification
        if (!silent && uiBookings.length > 0) {
          showSuccess('Bookings Loaded', `Found ${uiBookings.length} booking${uiBookings.length === 1 ? '' : 's'} for your vendor account`);
        }
        
        console.log('🎯 [VendorBookings] SECURE: Returning - vendor-specific bookings loaded');
        return;
        
      } else {
        console.log('ℹ️ [VendorBookings] No bookings found for this vendor after security filtering');
        setBookings([]);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          per_page: 10,
          hasNext: false,
          hasPrev: false
        });
        
        if (!silent) {
          showInfo('No Bookings', `No bookings found for vendor ${vendorId}`);
        }
        return;
      }
    } else {
      console.log('⚠️ [VendorBookings] API error or no bookings data');
      setBookings([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        per_page: 10,
        hasNext: false,
        hasPrev: false
      });
      
      if (!silent) {
        showInfo('No Bookings', `No bookings found for vendor ${vendorId}`);
      }
      return;
    }
    
  } catch (error) {
    console.error('💥 [VendorBookings] Error loading vendor bookings:', error);
    if (!silent) {
      showError('Loading Error', 'Failed to load bookings. Please try again.');
    }
    
    // Set empty bookings array - no mock data in production
    setBookings([]);
    setPagination({
      current_page: 1,
      total_pages: 1,
      total_items: 0,
      per_page: 10,
      hasNext: false,
      hasPrev: false
    });
    
  } finally {
    if (!silent) setLoading(false);
  }
};
