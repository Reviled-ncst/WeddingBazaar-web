/**
 * 🧪 BOOKING MODAL FLOW TEST - Browser Console Script
 * 
 * PURPOSE: Test booking creation through the modal to verify:
 * 1. API call reaches backend
 * 2. Success modal appears
 * 3. Email notification sent
 * 
 * HOW TO USE:
 * 1. Open https://weddingbazaarph.web.app/individual/services
 * 2. Open browser console (F12)
 * 3. Paste this entire script
 * 4. Press Enter
 * 5. Click "Book Now" on any service
 * 6. Fill form and submit
 * 7. Watch console for detailed logs
 */

console.log(
  '%c🧪 BOOKING MODAL TEST SCRIPT LOADED',
  'background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold;'
);

// Listen for booking creation events
window.addEventListener('bookingCreated', (event) => {
  console.log(
    '%c✅ BOOKING EVENT FIRED!',
    'background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: bold;',
    '\nBooking Details:', event.detail
  );
});

// Monitor fetch calls to booking endpoint
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  
  // Log booking API calls
  if (url && (url.includes('/api/bookings') || url.includes('bookings'))) {
    console.log(
      '%c📡 BOOKING API CALL DETECTED',
      'background: #f59e0b; color: white; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: bold;'
    );
    console.log('URL:', url);
    console.log('Method:', options?.method || 'GET');
    
    if (options?.body) {
      try {
        const body = JSON.parse(options.body);
        console.log('Request Body:', body);
      } catch (e) {
        console.log('Request Body (raw):', options.body);
      }
    }
    
    if (options?.headers) {
      console.log('Headers:', options.headers);
    }
    
    // Intercept response
    return originalFetch.apply(this, args).then(async (response) => {
      const clone = response.clone();
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await clone.json();
          
          if (response.ok) {
            console.log(
              '%c✅ BOOKING API SUCCESS',
              'background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: bold;'
            );
            console.log('Status:', response.status);
            console.log('Response Data:', data);
            
            // Check if it's a booking creation
            if (data.success && (data.booking || data.data)) {
              console.log(
                '%c🎉 BOOKING CREATED SUCCESSFULLY!',
                'background: #ec4899; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold;'
              );
              console.log('Booking ID:', data.booking?.id || data.data?.id);
              console.log('Full Booking Data:', data.booking || data.data);
              
              // Check for success modal
              setTimeout(() => {
                const successModal = document.querySelector('[class*="success"]');
                if (successModal) {
                  console.log(
                    '%c✅ SUCCESS MODAL DETECTED IN DOM',
                    'background: #10b981; color: white; padding: 6px 12px; border-radius: 4px;'
                  );
                } else {
                  console.log(
                    '%c⚠️ SUCCESS MODAL NOT FOUND IN DOM',
                    'background: #f59e0b; color: white; padding: 6px 12px; border-radius: 4px;'
                  );
                }
              }, 500);
            }
          } else {
            console.log(
              '%c❌ BOOKING API ERROR',
              'background: #ef4444; color: white; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: bold;'
            );
            console.log('Status:', response.status);
            console.log('Error Data:', data);
          }
        } catch (e) {
          console.log('Response parsing error:', e);
        }
      }
      
      return response;
    });
  }
  
  return originalFetch.apply(this, args);
};

// Monitor console for booking logs
const originalLog = console.log;
console.log = function(...args) {
  const firstArg = args[0];
  
  // Highlight booking-related logs
  if (typeof firstArg === 'string') {
    if (firstArg.includes('[BOOKING API]')) {
      const style = firstArg.includes('✅') ? 'color: #10b981; font-weight: bold;' :
                    firstArg.includes('❌') ? 'color: #ef4444; font-weight: bold;' :
                    firstArg.includes('📡') ? 'color: #3b82f6; font-weight: bold;' :
                    'color: #6b7280; font-weight: bold;';
      
      originalLog.apply(console, [`%c${firstArg}`, style, ...args.slice(1)]);
      return;
    }
  }
  
  originalLog.apply(console, args);
};

// Test helper: Simulate booking (if modal doesn't open)
window.testBookingAPI = async function() {
  console.log(
    '%c🧪 TESTING BOOKING API DIRECTLY',
    'background: #8b5cf6; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: bold;'
  );
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('❌ No auth token found! Please log in first.');
    return;
  }
  
  const bookingData = {
    vendor_id: 'test-vendor-01',
    service_id: 'test-service-01',
    service_type: 'Photography',
    service_name: 'Wedding Photography Package',
    event_date: '2025-06-15',
    event_location: 'Manila Hotel, Philippines',
    guest_count: 150,
    budget_range: '₱50,001 - ₱100,000',
    contact_person: 'Test User',
    contact_phone: '+63 917 123 4567',
    special_requests: 'Test booking from console script'
  };
  
  console.log('Request Data:', bookingData);
  
  try {
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(
        '%c✅ API TEST SUCCESS!',
        'background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold;',
        '\nResult:', result
      );
      alert('✅ Booking created successfully! Check console for details.');
    } else {
      console.log(
        '%c❌ API TEST FAILED',
        'background: #ef4444; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold;',
        '\nStatus:', response.status,
        '\nResult:', result
      );
      alert('❌ Booking failed: ' + (result.message || result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    alert('❌ Network error: ' + error.message);
  }
};

console.log(
  '%c📋 INSTRUCTIONS',
  'background: #6b7280; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px;'
);
console.log('1. Click "Book Now" on any service');
console.log('2. Fill the booking form');
console.log('3. Click "Submit Booking Request"');
console.log('4. Watch this console for detailed logs');
console.log('\n💡 TIP: Run window.testBookingAPI() to test API directly');

console.log(
  '%c🔍 MONITORING ACTIVE',
  'background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: bold;'
);
console.log('All booking API calls will be logged here automatically.');
