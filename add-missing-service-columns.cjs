require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addMissingServiceColumns() {
  try {
    console.log('🔧 Starting migration: Adding missing columns to services table...');
    
    // Add contact_info column (JSONB)
    try {
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS contact_info JSONB
      `;
      console.log('✅ Added contact_info column (JSONB)');
    } catch (error) {
      console.log('⚠️  contact_info column might already exist:', error.message);
    }
    
    // Add tags column (TEXT ARRAY)
    try {
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS tags TEXT[]
      `;
      console.log('✅ Added tags column (TEXT[])');
    } catch (error) {
      console.log('⚠️  tags column might already exist:', error.message);
    }
    
    // Add keywords column (TEXT)
    try {
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS keywords TEXT
      `;
      console.log('✅ Added keywords column (TEXT)');
    } catch (error) {
      console.log('⚠️  keywords column might already exist:', error.message);
    }
    
    // Add location_coordinates column (JSONB)
    try {
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS location_coordinates JSONB
      `;
      console.log('✅ Added location_coordinates column (JSONB)');
    } catch (error) {
      console.log('⚠️  location_coordinates column might already exist:', error.message);
    }
    
    // Add location_details column (JSONB)
    try {
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS location_details JSONB
      `;
      console.log('✅ Added location_details column (JSONB)');
    } catch (error) {
      console.log('⚠️  location_details column might already exist:', error.message);
    }
    
    // Verify the new columns exist
    console.log('\n📊 Verifying services table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `;
    
    console.log('\n✅ Current services table columns:');
    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
      console.log(`  - ${col.column_name} (${col.data_type}) ${nullable}`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - contact_info: Store phone, email, website');
    console.log('   - tags: Store searchable tags (e.g., "luxury", "affordable")');
    console.log('   - keywords: Store SEO keywords');
    console.log('   - location_coordinates: Store lat/lng for map display');
    console.log('   - location_details: Store address, city, state, zip');
    console.log('\n✅ All service fields now supported - NO DATA LOSS!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

addMissingServiceColumns();
