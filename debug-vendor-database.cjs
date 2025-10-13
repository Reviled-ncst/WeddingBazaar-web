const https = require('https');

console.log('🔍 Debugging vendor database contents...\n');

// Test debug endpoint to see actual database contents
const debugDatabase = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://weddingbazaar-web.onrender.com/api/debug/sample/vendors', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('🗃️ Vendor Database Sample:');
          console.log(`   Status: ${res.statusCode}`);
          
          if (result.success && result.sampleRows) {
            console.log(`   Total vendors: ${result.sampleRows.length}`);
            
            result.sampleRows.forEach((vendor, index) => {
              console.log(`\n📋 Vendor ${index + 1}:`);
              console.log(`   ID: ${vendor.id}`);
              console.log(`   Business Name: ${vendor.business_name || 'NULL'}`);
              console.log(`   Business Type: ${vendor.business_type || 'NULL'}`);
              console.log(`   Rating: ${vendor.rating}`);
              console.log(`   Verified: ${vendor.verified}`);
              console.log(`   Location: ${vendor.location || 'NULL'}`);
            });
            
            // Check for null business names
            const nullNames = result.sampleRows.filter(v => !v.business_name);
            const nullTypes = result.sampleRows.filter(v => !v.business_type);
            
            console.log(`\n⚠️ Issues Found:`);
            console.log(`   Vendors with NULL business_name: ${nullNames.length}`);
            console.log(`   Vendors with NULL business_type: ${nullTypes.length}`);
            
            if (nullNames.length > 0) {
              console.log('\n❌ PROBLEM: Some vendors have NULL business_name!');
              console.log('   This explains why name field is missing in API response.');
            }
            
            if (nullTypes.length > 0) {
              console.log('\n❌ PROBLEM: Some vendors have NULL business_type!');
              console.log('   This explains why category field is missing in API response.');
            }
          } else {
            console.log('❌ No sample data returned or failed request');
            console.log('Response:', JSON.stringify(result, null, 2));
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Parse error:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Run debug
debugDatabase()
  .then(() => {
    console.log('\n🎉 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error.message);
    process.exit(1);
  });
