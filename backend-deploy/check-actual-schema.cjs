const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const checkDatabaseSchema = async () => {
  try {
    console.log('🔍 Checking actual vendor_profiles table schema...');
    
    // Get actual column names from vendor_profiles table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n=== VENDOR_PROFILES TABLE COLUMNS ===');
    columns.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if we have a description column or business_description
    const hasDescription = columns.some(col => col.column_name === 'description');
    const hasBusinessDescription = columns.some(col => col.column_name === 'business_description');
    
    console.log('\n=== DESCRIPTION FIELD ANALYSIS ===');
    console.log(`Has 'description' column: ${hasDescription ? '✅' : '❌'}`);
    console.log(`Has 'business_description' column: ${hasBusinessDescription ? '✅' : '❌'}`);
    
    if (!hasDescription && !hasBusinessDescription) {
      console.log('\n⚠️  No description column found! Need to add one.');
      console.log('We should add a description column or use business_description.');
    }
    
    // Check location column
    const hasLocation = columns.some(col => col.column_name === 'location');
    const hasServiceArea = columns.some(col => col.column_name === 'service_area');
    
    console.log('\n=== LOCATION FIELD ANALYSIS ===');
    console.log(`Has 'location' column: ${hasLocation ? '✅' : '❌'}`);
    console.log(`Has 'service_area' column: ${hasServiceArea ? '✅' : '❌'}`);
    
    // Get a sample vendor record to see actual data structure
    console.log('\n=== SAMPLE VENDOR DATA ===');
    const sampleVendor = await sql`
      SELECT * FROM vendor_profiles 
      WHERE id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
      LIMIT 1;
    `;
    
    if (sampleVendor.length > 0) {
      const vendor = sampleVendor[0];
      console.log('Available fields in actual data:');
      Object.keys(vendor).forEach(key => {
        const value = vendor[key];
        console.log(`  ${key}: ${typeof value} = ${value !== null ? JSON.stringify(value) : 'NULL'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
  }
};

checkDatabaseSchema();
