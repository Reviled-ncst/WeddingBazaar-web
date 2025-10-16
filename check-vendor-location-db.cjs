const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const checkVendorLocation = async () => {
  try {
    console.log('🔍 Checking vendor location data in database...');
    
    const vendorId = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';
    
    // Get full vendor_profiles record
    const vendorResult = await sql`
      SELECT *
      FROM vendor_profiles 
      WHERE id = ${vendorId}
    `;
    
    if (vendorResult.length === 0) {
      console.log('❌ No vendor found');
      return;
    }
    
    const vendor = vendorResult[0];
    console.log('✅ Vendor found in database');
    console.log('=== VENDOR_PROFILES RECORD ===');
    
    // Check all location-related fields
    const locationFields = [
      'location', 'service_area', 'business_description', 
      'years_in_business', 'website', 'facebook_url', 
      'instagram_url', 'twitter_url', 'linkedin_url'
    ];
    
    locationFields.forEach(field => {
      const value = vendor[field];
      console.log(`${field}: ${value !== null ? '✅' : '❌'} ${JSON.stringify(value)}`);
    });
    
    console.log('\n=== ALL FIELDS ===');
    Object.keys(vendor).forEach(key => {
      const value = vendor[key];
      const hasValue = value !== null && value !== undefined && value !== '';
      console.log(`${key}: ${hasValue ? '✅' : '❌'} ${JSON.stringify(value)}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking vendor location:', error.message);
  }
};

checkVendorLocation();
