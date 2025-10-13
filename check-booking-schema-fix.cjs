#!/usr/bin/env node

/**
 * Check Database Schema and Fix Column Mapping
 * Investigates the actual database schema and fixes column mapping issues
 */

const { sql } = require('./backend-deploy/config/database.cjs');

async function checkBookingSchema() {
  try {
    console.log('🔍 Checking bookings table schema...\n');
    
    // Get table schema
    const schema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Bookings table columns:');
    schema.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Get sample booking data
    console.log('📋 Sample booking data:');
    const bookings = await sql`
      SELECT * FROM bookings 
      WHERE couple_id = '1-2025-001'
      LIMIT 2
    `;
    
    if (bookings.length > 0) {
      console.log(`Found ${bookings.length} bookings for couple 1-2025-001:`);
      bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log(`  ID: ${booking.id}`);
        console.log(`  Couple ID: ${booking.couple_id}`);
        console.log(`  Vendor ID: ${booking.vendor_id}`);
        console.log(`  Service Name: ${booking.service_name || 'N/A'}`);
        console.log(`  Amount: ${booking.amount || booking.total_amount || 'N/A'}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Event Date: ${booking.event_date}`);
        console.log(`  Notes: ${booking.notes || 'N/A'}`);
      });
    } else {
      console.log('No bookings found for couple 1-2025-001');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Check vendor data connection
    console.log('🏪 Checking vendor data connection:');
    const vendorBookings = await sql`
      SELECT 
        b.id,
        b.couple_id,
        b.vendor_id,
        b.service_name,
        b.amount,
        b.status,
        v.business_name,
        v.business_type
      FROM bookings b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.couple_id = '1-2025-001'
      LIMIT 2
    `;
    
    if (vendorBookings.length > 0) {
      console.log(`Vendor join results:`);
      vendorBookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1} with vendor data:`);
        console.log(`  Booking ID: ${booking.id}`);
        console.log(`  Vendor ID: ${booking.vendor_id}`);
        console.log(`  Business Name: ${booking.business_name || 'NOT FOUND'}`);
        console.log(`  Business Type: ${booking.business_type || 'NOT FOUND'}`);
        console.log(`  Service: ${booking.service_name}`);
        console.log(`  Amount: ${booking.amount}`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Check available vendors
    console.log('🔍 Available vendors:');
    const vendors = await sql`SELECT id, business_name, business_type FROM vendors LIMIT 5`;
    vendors.forEach(vendor => {
      console.log(`  ${vendor.id}: ${vendor.business_name} (${vendor.business_type})`);
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    process.exit(0);
  }
}

checkBookingSchema();
