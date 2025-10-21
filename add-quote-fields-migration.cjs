/**
 * Database Migration: Add Quote Fields to Bookings Table
 * 
 * Adds proper fields for storing quote information:
 * - quoted_price: The total price quoted by vendor
 * - quoted_deposit: The deposit amount (usually 30% of quoted_price)
 * - quote_itemization: JSONB field for storing service breakdown
 * - quote_sent_date: When the quote was sent
 * - quote_valid_until: Expiration date for the quote
 */

const { sql } = require('./backend-deploy/config/database.cjs');

async function addQuoteFields() {
  console.log('🔧 Starting database migration: Add Quote Fields');
  console.log('━'.repeat(60));
  
  try {
    // Check if columns already exist
    console.log('📋 Step 1: Checking existing columns...');
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      AND column_name IN ('quoted_price', 'quoted_deposit', 'quote_itemization', 'quote_sent_date', 'quote_valid_until')
    `;
    
    const existing = existingColumns.map(col => col.column_name);
    console.log(`✅ Found existing columns: ${existing.length > 0 ? existing.join(', ') : 'none'}`);
    
    // Add quoted_price if not exists
    if (!existing.includes('quoted_price')) {
      console.log('\n📝 Adding column: quoted_price (NUMERIC(10,2))');
      await sql`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(10,2)
      `;
      console.log('✅ Column quoted_price added');
    } else {
      console.log('⏭️  Column quoted_price already exists');
    }
    
    // Add quoted_deposit if not exists
    if (!existing.includes('quoted_deposit')) {
      console.log('\n📝 Adding column: quoted_deposit (NUMERIC(10,2))');
      await sql`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS quoted_deposit NUMERIC(10,2)
      `;
      console.log('✅ Column quoted_deposit added');
    } else {
      console.log('⏭️  Column quoted_deposit already exists');
    }
    
    // Add quote_itemization if not exists
    if (!existing.includes('quote_itemization')) {
      console.log('\n📝 Adding column: quote_itemization (JSONB)');
      await sql`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS quote_itemization JSONB
      `;
      console.log('✅ Column quote_itemization added');
    } else {
      console.log('⏭️  Column quote_itemization already exists');
    }
    
    // Add quote_sent_date if not exists
    if (!existing.includes('quote_sent_date')) {
      console.log('\n📝 Adding column: quote_sent_date (TIMESTAMP)');
      await sql`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP
      `;
      console.log('✅ Column quote_sent_date added');
    } else {
      console.log('⏭️  Column quote_sent_date already exists');
    }
    
    // Add quote_valid_until if not exists
    if (!existing.includes('quote_valid_until')) {
      console.log('\n📝 Adding column: quote_valid_until (TIMESTAMP)');
      await sql`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS quote_valid_until TIMESTAMP
      `;
      console.log('✅ Column quote_valid_until added');
    } else {
      console.log('⏭️  Column quote_valid_until already exists');
    }
    
    // Verify all columns exist
    console.log('\n🔍 Step 2: Verifying all columns...');
    const verifyColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      AND column_name IN ('quoted_price', 'quoted_deposit', 'quote_itemization', 'quote_sent_date', 'quote_valid_until')
      ORDER BY column_name
    `;
    
    console.log('\n✅ Quote-related columns in bookings table:');
    verifyColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Create index for quote_sent_date for faster queries
    console.log('\n📊 Step 3: Creating indexes...');
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_bookings_quote_sent_date 
        ON bookings(quote_sent_date) 
        WHERE quote_sent_date IS NOT NULL
      `;
      console.log('✅ Index created: idx_bookings_quote_sent_date');
    } catch (indexError) {
      console.log('⏭️  Index already exists or error:', indexError.message);
    }
    
    console.log('\n━'.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - quoted_price: Total price quoted by vendor');
    console.log('   - quoted_deposit: Deposit amount (usually 30%)');
    console.log('   - quote_itemization: Service breakdown as JSONB');
    console.log('   - quote_sent_date: When quote was sent');
    console.log('   - quote_valid_until: Quote expiration date');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migration
addQuoteFields();
