const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function debugDatabaseSchema() {
  try {
    console.log('🔍 Debugging database schema and bookings...');
    
    // Check if bookings table exists
    console.log('\n1. Checking if bookings table exists...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings'
      );
    `);
    console.log('Bookings table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Get table schema
      console.log('\n2. Current bookings table schema:');
      const schema = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'bookings'
        ORDER BY ordinal_position
      `);
      
      schema.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });
      
      // Check for specific columns we need
      console.log('\n3. Checking for required columns...');
      const requiredColumns = ['vendor_name', 'service_id', 'service_name', 'event_location', 'guest_count', 'budget_range', 'contact_phone', 'preferred_contact_method'];
      
      const existingColumns = schema.rows.map(row => row.column_name);
      
      requiredColumns.forEach(col => {
        const exists = existingColumns.includes(col);
        console.log(`  - ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      });
      
      // Count bookings
      console.log('\n4. Counting bookings...');
      const count = await pool.query('SELECT COUNT(*) as count FROM bookings');
      console.log('Total bookings:', count.rows[0].count);
      
      // Show recent bookings if any
      if (parseInt(count.rows[0].count) > 0) {
        console.log('\n5. Recent bookings:');
        const recent = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 3');
        recent.rows.forEach(booking => {
          console.log(`  - ID: ${booking.id}, Status: ${booking.status}, Created: ${booking.created_at}`);
        });
      }
    }
    
    await pool.end();
    console.log('\n✅ Database debug completed');
    
  } catch (error) {
    console.error('❌ Error debugging database:', error);
    await pool.end();
    process.exit(1);
  }
}

debugDatabaseSchema();
