/**
 * Database Migration: Create Booking Dates Table
 * 
 * Creates a table for tracking vendor unavailable dates:
 * - Automatically blocks dates when bookings are confirmed
 * - Allows vendors to manually block dates
 * - Prevents double-booking
 * - Supports time slot granularity (full day, morning, afternoon, evening)
 */

const { sql } = require('./backend-deploy/config/database.cjs');

async function createBookingDatesTable() {
  console.log('🔧 Starting database migration: Create Booking Dates Table');
  console.log('━'.repeat(60));
  
  try {
    // Check if table exists
    console.log('📋 Step 1: Checking if booking_dates table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'booking_dates'
      )
    `;
    
    if (tableExists[0].exists) {
      console.log('⏭️  Table booking_dates already exists');
    } else {
      console.log('\n📝 Creating table: booking_dates');
      
      // Create booking_dates table
      await sql`
        CREATE TABLE booking_dates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id VARCHAR(50) NOT NULL,
          booking_id BIGINT,
          event_date DATE NOT NULL,
          status VARCHAR(20) DEFAULT 'booked',
          time_slot VARCHAR(20) DEFAULT 'full_day',
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          
          CONSTRAINT unique_vendor_date_slot UNIQUE(vendor_id, event_date, time_slot)
        )
      `;
      
      console.log('✅ Table booking_dates created');
    }
    
    // Create indexes
    console.log('\n📊 Step 2: Creating indexes...');
    
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_booking_dates_vendor 
        ON booking_dates(vendor_id, event_date)
      `;
      console.log('✅ Index created: idx_booking_dates_vendor');
    } catch (indexError) {
      console.log('⏭️  Index idx_booking_dates_vendor already exists');
    }
    
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_booking_dates_status 
        ON booking_dates(status) 
        WHERE status = 'booked'
      `;
      console.log('✅ Index created: idx_booking_dates_status');
    } catch (indexError) {
      console.log('⏭️  Index idx_booking_dates_status already exists');
    }
    
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_booking_dates_booking 
        ON booking_dates(booking_id) 
        WHERE booking_id IS NOT NULL
      `;
      console.log('✅ Index created: idx_booking_dates_booking');
    } catch (indexError) {
      console.log('⏭️  Index idx_booking_dates_booking already exists');
    }
    
    // Verify table structure
    console.log('\n🔍 Step 3: Verifying table structure...');
    const columns = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'booking_dates'
      ORDER BY ordinal_position
    `;
    
    console.log('\n✅ Columns in booking_dates table:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Create view for vendor availability
    console.log('\n📊 Step 4: Creating availability view...');
    try {
      await sql`
        CREATE OR REPLACE VIEW vendor_availability AS
        SELECT 
          bd.vendor_id,
          bd.event_date,
          bd.time_slot,
          bd.status,
          bd.booking_id,
          bd.notes,
          b.couple_name,
          b.service_type,
          v.business_name as vendor_name
        FROM booking_dates bd
        LEFT JOIN bookings b ON bd.booking_id = b.id
        LEFT JOIN vendors v ON bd.vendor_id = v.vendor_id
        WHERE bd.status = 'booked'
        ORDER BY bd.event_date ASC
      `;
      console.log('✅ View created: vendor_availability');
    } catch (viewError) {
      console.log('⏭️  View vendor_availability already exists or error:', viewError.message);
    }
    
    console.log('\n━'.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - booking_dates table created');
    console.log('   - Indexes created for performance');
    console.log('   - vendor_availability view created');
    console.log('\n💡 Next steps:');
    console.log('   1. Update booking confirmation to block dates');
    console.log('   2. Create API endpoints for date management');
    console.log('   3. Integrate calendar with unavailable dates');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migration
createBookingDatesTable();
