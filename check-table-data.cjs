const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTableData() {
  try {
    console.log('🔍 Checking actual table data...');
    
    // Check vendors table
    const vendors = await sql`
      SELECT id, user_id, business_name, business_type FROM vendors LIMIT 10
    `;
    console.log('📋 Vendors table data:', vendors);
    
    // Check vendor_profiles table
    const vendorProfiles = await sql`
      SELECT id, user_id, business_name, documents_verified FROM vendor_profiles LIMIT 10
    `;
    console.log('📋 Vendor_profiles table data:', vendorProfiles);
    
    // Check for our specific user 2-2025-001 in vendor_profiles
    const userVendorProfile = await sql`
      SELECT * FROM vendor_profiles WHERE user_id = '2-2025-001'
    `;
    console.log('👤 Vendor profile for user 2-2025-001:', userVendorProfile);
    
    // Check if we can find which vendor_profile the documents belong to
    const docVendorMatch = await sql`
      SELECT vp.*, vd.document_type, vd.verification_status
      FROM vendor_profiles vp
      INNER JOIN vendor_documents vd ON vp.id = vd.vendor_id
      LIMIT 10
    `;
    console.log('🔗 Vendor profiles with documents:', docVendorMatch);
    
  } catch (error) {
    console.error('❌ Error checking table data:', error);
  }
}

checkTableData();
