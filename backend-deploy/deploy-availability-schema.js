#!/usr/bin/env node

/**
 * Database Schema Deployment Script
 * This script creates the availability tables in the production database
 */

const { neon } = require('@neondatabase/serverless');
const { config } = require('dotenv');

// Load environment variables
config();

async function deployAvailabilitySchema() {
  console.log('🚀 [SCHEMA] Starting availability schema deployment...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ [SCHEMA] DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Test connection
    console.log('🔗 [SCHEMA] Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('✅ [SCHEMA] Database connection successful');

    // Create vendor_availability table
    console.log('📋 [SCHEMA] Creating vendor_availability table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vendor_availability (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          is_available BOOLEAN DEFAULT true,
          reason VARCHAR(255) DEFAULT 'available',
          booking_ids JSONB DEFAULT '[]'::jsonb,
          max_bookings INTEGER DEFAULT 1,
          current_bookings INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(vendor_id, date)
      )
    `;
    console.log('✅ [SCHEMA] vendor_availability table created');

    // Create vendor_off_days table
    console.log('📋 [SCHEMA] Creating vendor_off_days table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vendor_off_days (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          reason VARCHAR(500) NOT NULL DEFAULT 'Unavailable',
          is_recurring BOOLEAN DEFAULT false,
          recurring_pattern VARCHAR(50),
          recurring_end_date DATE,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(vendor_id, date)
      )
    `;
    console.log('✅ [SCHEMA] vendor_off_days table created');

    // Create indexes
    console.log('📋 [SCHEMA] Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_availability_vendor_date ON vendor_availability(vendor_id, date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_availability_vendor_available ON vendor_availability(vendor_id, is_available)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_off_days_vendor_date ON vendor_off_days(vendor_id, date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_off_days_vendor_active ON vendor_off_days(vendor_id, is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_off_days_recurring ON vendor_off_days(vendor_id, is_recurring, is_active)`;
    console.log('✅ [SCHEMA] Indexes created');

    // Create update trigger function
    console.log('📋 [SCHEMA] Creating update trigger function...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log('✅ [SCHEMA] Update trigger function created');

    // Create triggers (PostgreSQL doesn't support IF NOT EXISTS for triggers)
    console.log('📋 [SCHEMA] Creating triggers...');
    try {
      await sql`
        CREATE TRIGGER update_vendor_availability_updated_at 
        BEFORE UPDATE ON vendor_availability 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `;
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
      console.log('⚠️ [SCHEMA] Trigger update_vendor_availability_updated_at already exists');
    }
    
    try {
      await sql`
        CREATE TRIGGER update_vendor_off_days_updated_at 
        BEFORE UPDATE ON vendor_off_days 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `;
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
      console.log('⚠️ [SCHEMA] Trigger update_vendor_off_days_updated_at already exists');
    }
    console.log('✅ [SCHEMA] Triggers created');

    // Create availability view (simplified for now)
    console.log('📋 [SCHEMA] Creating availability view...');
    await sql`
      CREATE OR REPLACE VIEW vendor_availability_view AS
      SELECT 
          COALESCE(va.vendor_id, od.vendor_id) as vendor_id,
          COALESCE(va.date, od.date) as date,
          CASE 
              WHEN od.id IS NOT NULL THEN false
              WHEN va.is_available IS NOT NULL THEN va.is_available
              ELSE true
          END as is_available,
          CASE 
              WHEN od.id IS NOT NULL THEN 'off_day'
              WHEN va.reason IS NOT NULL THEN va.reason
              ELSE 'available'
          END as reason,
          COALESCE(va.current_bookings, 0) as current_bookings,
          COALESCE(va.max_bookings, 1) as max_bookings,
          od.reason as off_day_reason
      FROM vendor_availability va
      FULL OUTER JOIN vendor_off_days od ON va.vendor_id = od.vendor_id AND va.date = od.date AND od.is_active = true
      WHERE COALESCE(va.vendor_id, od.vendor_id) IS NOT NULL
      AND COALESCE(va.date, od.date) IS NOT NULL
    `;
    console.log('✅ [SCHEMA] Availability view created');

    // Insert test data
    console.log('📋 [SCHEMA] Inserting test data...');
    await sql`
      INSERT INTO vendor_off_days (vendor_id, date, reason) VALUES 
          ('vendor_123', '2024-10-15', 'Personal day off')
      ON CONFLICT (vendor_id, date) DO NOTHING
    `;
    console.log('✅ [SCHEMA] Test data inserted');

    // Verify tables exist
    console.log('🔍 [SCHEMA] Verifying table creation...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('vendor_availability', 'vendor_off_days')
      ORDER BY table_name
    `;

    console.log('📊 [SCHEMA] Created tables:', tables.map(t => t.table_name));

    // Test the availability view
    console.log('🔍 [SCHEMA] Testing availability view...');
    const testView = await sql`
      SELECT vendor_id, date::text, is_available, reason 
      FROM vendor_availability_view 
      WHERE vendor_id = 'vendor_123' AND date = '2024-10-15'
      LIMIT 1
    `;

    if (testView.length > 0) {
      console.log('✅ [SCHEMA] Availability view test successful:', testView[0]);
    }

    console.log('\n🎉 [SCHEMA] ===================================');
    console.log('🎉 [SCHEMA] AVAILABILITY SCHEMA DEPLOYED SUCCESSFULLY!');
    console.log('🎉 [SCHEMA] ===================================');
    console.log('✅ [SCHEMA] Tables created: vendor_availability, vendor_off_days');
    console.log('✅ [SCHEMA] Indexes created for performance optimization');
    console.log('✅ [SCHEMA] Triggers created for automatic timestamp updates');
    console.log('✅ [SCHEMA] Availability view created for easy querying');
    console.log('✅ [SCHEMA] Test data inserted (vendor_123, 2024-10-15)');
    console.log('🎉 [SCHEMA] ===================================\n');

  } catch (error) {
    console.error('❌ [SCHEMA] Database schema deployment failed:', error);
    console.error('❌ [SCHEMA] Error details:', error.message);
    process.exit(1);
  }
}

// Run the deployment
deployAvailabilitySchema();
