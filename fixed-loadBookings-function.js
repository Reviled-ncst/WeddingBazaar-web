// Fixed loadBookings function for VendorBookings.tsx

const loadBookings = async (silent = false) => {
  try {
    if (!silent) setLoading(true);
    console.log('🚨🚨🚨 [VendorBookings] VENDOR-SPECIFIC API VERSION 🚨🚨🚨 - vendor:', vendorId);
    
    // Use only the authenticated vendor's ID - strict vendor filtering
    console.log('🔍 [VendorBookings] Loading bookings for authenticated vendor:', vendorId);
    
    const directResponse = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
    const directData = await directResponse.json();
    
    console.log(`🔗 [VendorBookings] API Response for vendor ${vendorId}:`, directData);
    
    if (directData.success && directData.bookings) {
      const allBookingsData = directData.bookings;
      
      console.log(`✅ [VendorBookings] Found ${allBookingsData.length} bookings for vendor ${vendorId}`);
      
      // Additional security check: filter out any bookings that don't belong to this vendor
      const validBookings = allBookingsData.filter((booking: any) => {
        const bookingVendorId = booking.vendor_id;
        const isValid = bookingVendorId === vendorId || bookingVendorId === vendorId.split('-')[0];
        
        if (!isValid) {
          console.warn(`⚠️ [VendorBookings] Filtering out booking ${booking.id} - vendor_id ${bookingVendorId} doesn't match ${vendorId}`);
        }
        
        return isValid;
      });
      
      console.log(`🔒 [VendorBookings] Security filter: ${validBookings.length}/${allBookingsData.length} bookings are valid for vendor ${vendorId}`);
      
      if (validBookings.length > 0) {
        console.log('✅ [VendorBookings] SUCCESS! Converting bookings to UI format...');
        console.log('📊 [VendorBookings] Raw bookings count:', validBookings.length);
        
        // Convert raw bookings to UI format with enhanced couple name lookup
        const uiBookingsPromises = validBookings.map(async (booking: any) => {
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
        
        console.log('🎯 [VendorBookings] VENDOR-SPECIFIC SUCCESS - Setting', uiBookings.length, 'bookings in state');
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
        
        console.log('🎯 [VendorBookings] RETURNING from loadBookings - vendor-specific bookings loaded');
        return; // Skip fallback to mock data
      } else {
        console.log('⚠️ [VendorBookings] No bookings found for this vendor');
        // Set empty bookings array instead of falling back to mock data
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
      throw new Error('No bookings data returned from API');
    }
    
  } catch (error) {
    console.error('💥 [VendorBookings] Error in vendor-specific API approach:', error);
    if (!silent) {
      showError('Loading Error', 'Failed to load bookings. Please try again.');
    }
    
    // Set empty bookings array instead of mock data for production
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
