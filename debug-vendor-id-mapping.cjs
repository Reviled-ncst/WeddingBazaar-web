const https = require('https');

console.log('🔍 Checking for vendor ID mapping...\n');

// Check if there's a vendor_id_mapping table
const checkMapping = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://weddingbazaar-web.onrender.com/api/debug/sample/vendor_id_mapping', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📊 Vendor ID Mapping Table:');
          console.log(`   Status: ${res.statusCode}`);
          
          if (result.success && result.data && result.data.length > 0) {
            console.log(`   Mapping entries: ${result.data.length}`);
            
            result.data.forEach((mapping, i) => {
              console.log(`   Mapping ${i + 1}:`);
              console.log(`     Legacy ID: ${mapping.legacy_vendor_id}`);
              console.log(`     Profile ID: ${mapping.vendor_profile_id}`);
            });
            
            // Check if our vendor has a mapping
            const ourMapping = result.data.find(m => 
              m.vendor_profile_id === '2-2025-003' || 
              m.legacy_vendor_id === '2-2025-003' ||
              m.legacy_vendor_id === '2'
            );
            
            if (ourMapping) {
              console.log(`\n✅ MAPPING FOUND for vendor:`);
              console.log(`   Legacy ID: ${ourMapping.legacy_vendor_id}`);
              console.log(`   Profile ID: ${ourMapping.vendor_profile_id}`);
              console.log(`\n💡 SOLUTION: Bookings use legacy ID "${ourMapping.legacy_vendor_id}"`);
              console.log(`   but user system uses profile ID "${ourMapping.vendor_profile_id}"`);
            } else {
              console.log('\n❌ No mapping found for vendor 2-2025-003');
            }
          } else {
            console.log('   No mapping table data or table doesn\'t exist');
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Mapping check error:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Also check the vendors table to see ID formats
const checkVendors = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://weddingbazaar-web.onrender.com/api/debug/sample/vendors', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('\n📊 Vendors Table ID Formats:');
          
          if (result.success && result.data) {
            const vendor2025003 = result.data.find(v => v.id === '2-2025-003');
            const vendor2 = result.data.find(v => v.id === '2' || v.user_id === '2');
            
            if (vendor2025003) {
              console.log(`✅ Found vendor with ID "2-2025-003":`);
              console.log(`   Business: ${vendor2025003.business_name}`);
              console.log(`   User ID: ${vendor2025003.user_id}`);
            }
            
            if (vendor2) {
              console.log(`✅ Found vendor with ID/User ID "2":`);
              console.log(`   Business: ${vendor2.business_name}`);
              console.log(`   User ID: ${vendor2.user_id}`);
            }
            
            // Check if they're the same vendor
            if (vendor2025003 && vendor2 && vendor2025003.business_name === vendor2.business_name) {
              console.log('\n🎯 CONFIRMED: Same vendor with different ID formats!');
            } else if (!vendor2025003) {
              console.log('\n❌ No vendor found with ID "2-2025-003"');
            }
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Vendors check error:', error.message);
          reject(error);
        }
      });
    });
  });
};

Promise.all([checkMapping(), checkVendors()])
  .then(() => {
    console.log('\n🎯 ID MAPPING ANALYSIS COMPLETE');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  });
