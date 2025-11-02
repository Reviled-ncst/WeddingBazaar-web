require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addVendorTypeColumn() {
  try {
    console.log('🔧 Adding vendor_type column to vendors table...\n');
    
    // Add vendor_type column with default 'business' for existing vendors
    await sql`
      ALTER TABLE vendors 
      ADD COLUMN IF NOT EXISTS vendor_type VARCHAR(50) DEFAULT 'business'
    `;
    
    console.log('✅ Added vendor_type column (default: business)');
    
    // Add constraint to ensure only valid types
    await sql`
      ALTER TABLE vendors
      ADD CONSTRAINT check_vendor_type 
      CHECK (vendor_type IN ('business', 'freelancer'))
    `;
    
    console.log('✅ Added check constraint for vendor_type');
    
    // Check the updated schema
    const columns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vendors' AND column_name = 'vendor_type'
    `;
    
    console.log('\n📊 New column details:');
    console.table(columns);
    
    // Update existing vendors to 'business' explicitly
    const result = await sql`
      UPDATE vendors 
      SET vendor_type = 'business' 
      WHERE vendor_type IS NULL
    `;
    
    console.log('\n✅ Updated existing vendors to business type');
    console.log(`   Rows affected: ${result.count || 0}`);
    
    // Verify the changes
    const vendors = await sql`
      SELECT id, business_name, vendor_type 
      FROM vendors 
      LIMIT 5
    `;
    
    console.log('\n📋 Sample vendors with vendor_type:');
    console.table(vendors);
    
    console.log('\n🎉 Migration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addVendorTypeColumn();
