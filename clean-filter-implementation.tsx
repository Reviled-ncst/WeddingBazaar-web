// PRODUCTION FILTER FIX - Clean implementation for hosting
useEffect(() => {
  console.log('[PRODUCTION FILTER] ===== FILTER START =====');
  console.log('[PRODUCTION FILTER] Filter Status:', filterStatus);
  console.log('[PRODUCTION FILTER] Total Bookings:', bookings.length);

  if (!bookings || bookings.length === 0) {
    console.log('[PRODUCTION FILTER] No bookings available');
    setFilteredAndSortedBookings([]);
    return;
  }

  // Show status distribution for debugging
  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('[PRODUCTION FILTER] Status Distribution:', statusCounts);
  
  // Apply filtering logic
  const filtered = bookings.filter(booking => {
    // Status filtering
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    // Search filtering
    const query = debouncedSearchQuery.toLowerCase().trim();
    const searchableFields = [
      booking.vendorBusinessName,
      booking.vendorName,
      booking.serviceType,
      booking.serviceName,
      booking.eventLocation
    ].filter(Boolean);
    
    const matchesSearch = !query || searchableFields.some(field => 
      field && field.toLowerCase().includes(query)
    );

    // Debug individual filtering
    const shouldInclude = matchesStatus && matchesSearch;
    if (filterStatus !== 'all') {
      console.log(`[FILTER CHECK] ID:${booking.id} Status:"${booking.status}" vs Filter:"${filterStatus}" = ${shouldInclude}`);
    }
    
    return shouldInclude;
  });

  console.log('[PRODUCTION FILTER] Filtered Results:', filtered.length, 'out of', bookings.length);
  console.log('[PRODUCTION FILTER] Filtered IDs:', filtered.map(b => b.id));
  
  // Update state with new array reference
  setFilteredAndSortedBookings([...filtered]);
  
  console.log('[PRODUCTION FILTER] ===== FILTER END =====');
}, [bookings, filterStatus, debouncedSearchQuery]);
