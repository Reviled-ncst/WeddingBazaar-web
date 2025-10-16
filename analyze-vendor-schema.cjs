const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function analyzeVendorSchema() {
  try {
    console.log('🔍 Analyzing vendor and document schema...');
    
    // Check vendor table structure
    const vendorSchema = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'vendors'
      ORDER BY ordinal_position
    `;
    console.log('📊 Vendors table schema:', vendorSchema);
    
    // Check vendor_documents table structure
    const docSchema = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_documents'
      ORDER BY ordinal_position
    `;
    console.log('📊 Vendor_documents table schema:', docSchema);
    
    // Check if there's a vendor_profiles table
    const vendorProfileSchema = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles'
      ORDER BY ordinal_position
    `;
    console.log('📊 Vendor_profiles table schema:', vendorProfileSchema);
    
    // Check what's in the vendors table
    const vendors = await sql`
      SELECT id, name, category FROM vendors LIMIT 10
    `;
    console.log('📋 Sample vendors:', vendors);
    
    // Check vendor_profiles table if it exists
    try {
      const vendorProfiles = await sql`
        SELECT id, user_id, business_name FROM vendor_profiles LIMIT 10
      `;
      console.log('📋 Sample vendor profiles:', vendorProfiles);
    } catch (e) {
      console.log('ℹ️ vendor_profiles table may not exist or be empty');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing schema:', error);
  }
}

analyzeVendorSchema();
