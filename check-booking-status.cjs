#!/usr/bin/env node

/**
 * 🔍 CHECK BOOKING STATUS: Debug status mapping issue
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkBookingStatus() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('Make sure .env file exists in root directory');
    process.exit(1);
  }
  
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔍 ====================================');
  console.log('🔍 BOOKING STATUS DEBUG');
  console.log('🔍 ====================================\n');

  try {
    // Get all distinct statuses in the database
    console.log('📊 1. ALL DISTINCT STATUSES IN DATABASE:');
    const distinctStatuses = await sql`
      SELECT DISTINCT status, COUNT(*) as count
      FROM bookings
      GROUP BY status
      ORDER BY count DESC
    `;
    
    console.log('\nStatus distribution:');
    distinctStatuses.forEach(s => {
      console.log(`   ${s.status}: ${s.count} bookings`);
    });

    // Check for bookings with fully_paid or paid_in_full
    console.log('\n📊 2. FULLY PAID BOOKINGS:');
    const fullyPaid = await sql`
      SELECT id, status, payment_status, vendor_id, couple_id, service_name, total_amount
      FROM bookings
      WHERE status IN ('fully_paid', 'paid_in_full', 'paid', 'completed')
      LIMIT 5
    `;
    
    if (fullyPaid.length > 0) {
      console.log(`\nFound ${fullyPaid.length} bookings with paid/completed status:`);
      fullyPaid.forEach(b => {
        console.log(`   ID: ${b.id}`);
        console.log(`   Status: ${b.status}`);
        console.log(`   Payment Status: ${b.payment_status || 'N/A'}`);
        console.log(`   Vendor: ${b.vendor_id}`);
        console.log(`   Couple: ${b.couple_id}`);
        console.log(`   Service: ${b.service_name}`);
        console.log(`   Amount: ${b.total_amount}`);
        console.log('   ---');
      });
    } else {
      console.log('\nNo bookings with fully_paid/paid_in_full status found');
    }

    // Check specific vendor's bookings
    console.log('\n📊 3. SAMPLE VENDOR BOOKINGS:');
    const vendorBookings = await sql`
      SELECT id, status, vendor_id, couple_id, service_name
      FROM bookings
      LIMIT 5
    `;
    
    console.log(`\nFirst 5 bookings in database:`);
    vendorBookings.forEach(b => {
      console.log(`   ID: ${b.id} | Status: ${b.status} | Vendor: ${b.vendor_id}`);
    });

    // Check if there's a payment_status column
    console.log('\n📊 4. TABLE SCHEMA CHECK:');
    const schema = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      AND column_name LIKE '%status%'
      ORDER BY ordinal_position
    `;
    
    console.log('\nStatus-related columns:');
    schema.forEach(c => {
      console.log(`   ${c.column_name}: ${c.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }

  console.log('\n✅ Check complete');
  process.exit(0);
}

checkBookingStatus();
