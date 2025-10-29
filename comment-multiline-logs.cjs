#!/usr/bin/env node

/**
 * Final cleanup: Comment out remaining multi-line ✅ success logs
 */

const fs = require('fs');
const path = require('path');

const multiLineFiles = [
  { 
    file: 'src/shared/utils/booking-data-mapping.ts',
    patterns: [
      {
        old: `        console.log('✅ [BookingMapping] Quote JSON parsed successfully:', {
          quoteDetails: quoteDetails !== null,
          quoteItemization: quoteItemization !== null
        });`,
        new: `        // console.log('✅ [BookingMapping] Quote JSON parsed successfully:', {
        //   quoteDetails: quoteDetails !== null,
        //   quoteItemization: quoteItemization !== null
        // });`
      },
      {
        old: `      console.log('✅ [mapComprehensiveBookingToUI] Parsed quote_itemization:', {
        isArray: Array.isArray(parsedItems),
        itemCount: parsedItems?.length || 0
      });`,
        new: `      // console.log('✅ [mapComprehensiveBookingToUI] Parsed quote_itemization:', {
      //   isArray: Array.isArray(parsedItems),
      //   itemCount: parsedItems?.length || 0
      // });`
      },
      {
        old: `      console.log('✅ [mapComprehensiveBookingToUI] Parsed vendor_notes:', {
        isArray: Array.isArray(parsedItems),
        itemCount: parsedItems?.length || 0
      });`,
        new: `      // console.log('✅ [mapComprehensiveBookingToUI] Parsed vendor_notes:', {
      //   isArray: Array.isArray(parsedItems),
      //   itemCount: parsedItems?.length || 0
      // });`
      }
    ]
  },
  {
    file: 'src/shared/contexts/HybridAuthContext.tsx',
    patterns: [
      {
        old: `        console.log('✅ User created in Neon database:', {
          email: data.user.email,
          role: data.user.role,
          hasVendorId: !!data.user.vendorId
        });`,
        new: `        // console.log('✅ User created in Neon database:', {
        //   email: data.user.email,
        //   role: data.user.role,
        //   hasVendorId: !!data.user.vendorId
        // });`
      }
    ]
  },
  {
    file: 'src/utils/geolocation.ts',
    patterns: [
      {
        old: `        console.log('✅ Ultra-high accuracy GPS success:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          mode: 'ultra-high-accuracy'
        });`,
        new: `        // console.log('✅ Ultra-high accuracy GPS success:', {
        //   lat: position.coords.latitude,
        //   lng: position.coords.longitude,
        //   accuracy: position.coords.accuracy,
        //   mode: 'ultra-high-accuracy'
        // });`
      }
    ]
  },
  {
    file: 'src/services/paymongoService.ts',
    patterns: [
      {
        old: `      console.log('✅ PayMongo Payment Intent Response:', {
        id: response.data.id,
        status: response.data.attributes.status,
        amount: response.data.attributes.amount
      });`,
        new: `      // console.log('✅ PayMongo Payment Intent Response:', {
      //   id: response.data.id,
      //   status: response.data.attributes.status,
      //   amount: response.data.attributes.amount
      // });`
      }
    ]
  },
  {
    file: 'src/services/api/reviewApiService.ts',
    patterns: [
      {
        old: `      console.log('✅ [ReviewAPI] Retrieved review stats:', { serviceId, stats });`,
        new: `      // console.log('✅ [ReviewAPI] Retrieved review stats:', { serviceId, stats });`
      },
      {
        old: `      console.log('✅ [ReviewAPI] Retrieved reviews:', { serviceId, count: reviews.length });`,
        new: `      // console.log('✅ [ReviewAPI] Retrieved reviews:', { serviceId, count: reviews.length });`
      },
      {
        old: `      console.log('✅ [ReviewAPI] Retrieved bulk review stats:', Object.keys(bulkStats).length);`,
        new: `      // console.log('✅ [ReviewAPI] Retrieved bulk review stats:', Object.keys(bulkStats).length);`
      },
      {
        old: `      console.log('✅ [ReviewAPI] Review created successfully:', review.id);`,
        new: `      // console.log('✅ [ReviewAPI] Review created successfully:', review.id);`
      },
      {
        old: `      console.log('✅ [ReviewAPI] Retrieved trending services:', trending.length);`,
        new: `      // console.log('✅ [ReviewAPI] Retrieved trending services:', trending.length);`
      }
    ]
  },
  {
    file: 'src/pages/users/individual/bookings/hooks/useReview.ts',
    patterns: [
      {
        old: `      console.log('✅ [useReview] Review submitted successfully');`,
        new: `      // console.log('✅ [useReview] Review submitted successfully');`
      }
    ]
  },
  {
    file: 'src/pages/users/vendor/bookings/VendorBookingsSecure.tsx',
    patterns: [
      {
        old: `    console.log('✅ [VendorBookingsSecure] Booking completion updated:', data);`,
        new: `    // console.log('✅ [VendorBookingsSecure] Booking completion updated:', data);`
      }
    ]
  },
  {
    file: 'src/utils/geolocation-test.ts',
    patterns: [
      {
        old: `    console.log('✅ Current location result:', result);`,
        new: `    // console.log('✅ Current location result:', result);`
      }
    ]
  },
  {
    file: 'src/utils/geolocation-enhanced.ts',
    patterns: [
      {
        old: `      console.log('✅ Formatted address:', formattedAddress);`,
        new: `      // console.log('✅ Formatted address:', formattedAddress);`
      }
    ]
  },
  {
    file: 'src/services/vendorLookupService.ts',
    patterns: [
      {
        old: `          console.log('✅ Preloaded', data.vendors.length, 'vendors into cache');`,
        new: `          // console.log('✅ Preloaded', data.vendors.length, 'vendors into cache');`
      }
    ]
  }
];

let totalCommented = 0;

multiLineFiles.forEach(({ file, patterns }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let matches = 0;
  
  patterns.forEach(({ old, new: newText }) => {
    if (content.includes(old)) {
      content = content.replace(old, newText);
      matches++;
    }
  });
  
  if (matches > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - Commented out ${matches} multi-line success logs`);
    totalCommented += matches;
  }
});

console.log(`\n🎉 Final cleanup: Commented out ${totalCommented} multi-line success logs`);
console.log(`📝 All success logs are now commented out and can be easily re-enabled`);
