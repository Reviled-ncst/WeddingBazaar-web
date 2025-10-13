  // SECURITY-FIXED VERSION OF loadBookings function
  const loadBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // SECURITY: Validate vendor ID before making any API calls
      if (!vendorId) {
        console.error('🚨 [VendorBookings] SECURITY: No vendor ID - cannot load bookings');
        setBookings([]);
        if (!silent) {
          showError('Authentication Error', 'Vendor authentication required');
        }
        return;
      }
      
      console.log('🔒 [VendorBookings] SECURE VERSION - Loading bookings for authenticated vendor only:', vendorId);
      
      // SECURITY: Only use authenticated vendor's ID - no testing multiple vendor IDs
      const directResponse = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
      const directData = await directResponse.json();
      
      console.log(`🔗 [VendorBookings] API Response for vendor ${vendorId}:`, directData);
      
      if (directData.success && directData.bookings && directData.bookings.length > 0) {
        const allBookingsData = directData.bookings;
        
        console.log(`✅ [VendorBookings] Found ${allBookingsData.length} bookings for vendor ${vendorId}`);
        
        // SECURITY: Filter out any bookings that don't belong to this vendor
        const validBookings = allBookingsData.filter((booking: any) => {
          const bookingVendorId = booking.vendor_id;
          const isValid = bookingVendorId === vendorId || bookingVendorId === vendorId.split('-')[0];
          
          if (!isValid) {
            console.warn(`⚠️ [VendorBookings] SECURITY: Filtering out booking ${booking.id} - vendor_id ${bookingVendorId} doesn't match ${vendorId}`);
          }
          
          return isValid;
        });
        
        console.log(`🔒 [VendorBookings] Security filter: ${validBookings.length}/${allBookingsData.length} bookings are valid for vendor ${vendorId}`);
    
        if (validBookings.length > 0) {
          console.log('✅ [VendorBookings] SUCCESS! Converting VALIDATED bookings to UI format...');
          
          // Convert ONLY validated bookings to UI format with enhanced couple name lookup
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
          
          console.log('🎯 [VendorBookings] DIRECT API SUCCESS - Setting', uiBookings.length, 'bookings in state');
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
          
          console.log('🎯 [VendorBookings] SECURITY: Successfully loaded and validated bookings');
          return;
        }
      }
      
      // If we reach here, no valid bookings were found
      console.log('ℹ️ [VendorBookings] No valid bookings found for this vendor');
      setBookings([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        per_page: 10,
        hasNext: false,
        hasPrev: false
      });
      
    } catch (error) {
      console.error('💥 [VendorBookings] Error loading bookings for vendor', vendorId, ':', error);
      
      // SECURITY: Never show mock/fake data to vendors - always show empty state on API failure
      console.log('🔒 [VendorBookings] SECURITY: API failed, showing empty state (no mock data)');
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
        showError('Loading Error', 'Failed to load bookings. Please check your connection and try again.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };
