const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateBookingsSchema() {
  try {
    console.log('🔄 Starting bookings table schema migration...');
    
    // Start transaction
    await pool.query('BEGIN');
    
    // Add missing columns
    console.log('1. Adding missing columns...');
    
    const addColumns = [
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_name VARCHAR(255)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type VARCHAR(100)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_date DATE',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_time VARCHAR(20)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_location TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS budget_range VARCHAR(50)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(20)',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contract_details TEXT'
    ];
    
    for (const sql of addColumns) {
      try {
        await pool.query(sql);
        console.log('✅', sql);
      } catch (error) {
        console.log('⚠️', sql, '- Column may already exist');
      }
    }
    
    // Copy data from old columns to new columns where possible
    console.log('2. Migrating existing data...');
    
    const migrations = [
      "UPDATE bookings SET event_date = wedding_date WHERE wedding_date IS NOT NULL",
      "UPDATE bookings SET event_location = venue WHERE venue IS NOT NULL",
      "UPDATE bookings SET budget_range = CASE WHEN budget IS NOT NULL THEN '₱' || budget::text ELSE NULL END",
      "UPDATE bookings SET service_type = 'General' WHERE service_type IS NULL",
      "UPDATE bookings SET preferred_contact_method = 'email' WHERE preferred_contact_method IS NULL"
    ];
    
    for (const sql of migrations) {
      try {
        const result = await pool.query(sql);
        console.log('✅', sql, `- Updated ${result.rowCount} rows`);
      } catch (error) {
        console.log('⚠️', sql, '- Migration error:', error.message);
      }
    }
    
    // Update status values to match expected format
    console.log('3. Updating status values...');
    await pool.query("UPDATE bookings SET status = 'pending' WHERE status IS NULL OR status = ''");
    console.log('✅ Updated null status values to pending');
    
    // Commit transaction
    await pool.query('COMMIT');
    console.log('✅ Schema migration completed successfully!');
    
    // Verify the migration
    console.log('\n4. Verifying migration...');
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1');
    if (result.rows.length > 0) {
      const booking = result.rows[0];
      console.log('Sample migrated booking:');
      console.log('  - ID:', booking.id);
      console.log('  - Vendor Name:', booking.vendor_name);
      console.log('  - Service Name:', booking.service_name);
      console.log('  - Event Date:', booking.event_date);
      console.log('  - Event Location:', booking.event_location);
      console.log('  - Budget Range:', booking.budget_range);
      console.log('  - Status:', booking.status);
    }
    
    await pool.end();
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateBookingsSchema();
