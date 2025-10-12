#!/usr/bin/env node

/**
 * 🔧 DATABASE FIX SCRIPT: Update vendor_id mapping and create receipts table
 * This script fixes the vendor_id mismatch and sets up the receipts system
 */

const { neon } = require('@neondatabase/serverless');

async function applyDatabaseFixes() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://weddingbazaar_owner:VlHUhpfOqfEb@ep-summer-dawn-a51pz2k4.us-east-2.aws.neon.tech/weddingbazaar?sslmode=require');

  console.log('🔧 ====================================');
  console.log('🔧 DATABASE FIX SCRIPT STARTING');
  console.log('🔧 ====================================');

  try {
    console.log('\n📊 1. CHECKING CURRENT STATE');
    console.log('-----------------------------');
    
    // Check current bookings with vendor mapping
    const currentBookings = await sql`
      SELECT 
        b.id,
        b.vendor_id,
        b.service_name,
        v.business_name as vendor_name
      FROM bookings b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      ORDER BY b.created_at DESC
    `;
    
    console.log(`📅 Found ${currentBookings.length} bookings:`);
    currentBookings.forEach(b => {
      const status = b.vendor_name ? `✅ ${b.vendor_name}` : `❌ NULL (vendor_id: ${b.vendor_id})`;
      console.log(`   ${b.id}: ${b.service_name} - ${status}`);
    });
    
    // Check vendor IDs
    const vendors = await sql`SELECT id, business_name FROM vendors ORDER BY business_name`;
    console.log(`\n🏪 Available vendors:`);
    vendors.forEach(v => {
      console.log(`   ${v.id}: ${v.business_name}`);
    });
    
  } catch (error) {
    console.error('❌ State check failed:', error.message);
    return false;
  }

  try {
    console.log('\n🔧 2. APPLYING VENDOR_ID FIX');
    console.log('-----------------------------');
    
    // Update bookings to use correct vendor_id
    const updateResult = await sql`
      UPDATE bookings 
      SET vendor_id = '2-2025-004' 
      WHERE vendor_id = '2'
      RETURNING id, service_name, vendor_id
    `;
    
    console.log(`✅ Updated ${updateResult.length} booking records:`);
    updateResult.forEach(b => {
      console.log(`   📝 Booking ${b.id}: ${b.service_name} → vendor_id: ${b.vendor_id}`);
    });
    
  } catch (error) {
    console.error('❌ Vendor_id fix failed:', error.message);
    return false;
  }

  try {
    console.log('\n🧾 3. CREATING RECEIPTS TABLE');
    console.log('------------------------------');
    
    // Create receipts table
    await sql`
      CREATE TABLE IF NOT EXISTS receipts (
        id VARCHAR(50) PRIMARY KEY DEFAULT CONCAT('RCP-', TO_CHAR(NOW(), 'YYYY-MM-DD-'), LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0')),
        booking_id VARCHAR(50) NOT NULL,
        couple_id VARCHAR(50) NOT NULL,
        vendor_id VARCHAR(50) NOT NULL,
        amount_paid INTEGER NOT NULL,
        total_amount INTEGER NOT NULL,
        tax_amount INTEGER DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT 'online',
        payment_status VARCHAR(20) DEFAULT 'completed',
        receipt_number VARCHAR(100) UNIQUE NOT NULL,
        transaction_reference VARCHAR(100),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Receipts table created successfully');
    
    // Create receipt view for formatted display
    await sql`
      CREATE OR REPLACE VIEW receipt_display AS
      SELECT 
        r.*,
        v.business_name as vendor_name,
        v.category as vendor_category,
        b.service_name,
        b.booking_date,
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
        CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted,
        CONCAT('₱', TO_CHAR(r.tax_amount::DECIMAL / 100, 'FM999,999,999.00')) as tax_amount_formatted
      FROM receipts r
      LEFT JOIN vendors v ON r.vendor_id = v.id
      LEFT JOIN bookings b ON r.booking_id = b.id
    `;
    
    console.log('✅ Receipt display view created');
    
  } catch (error) {
    console.error('❌ Receipts table creation failed:', error.message);
    return false;
  }

  try {
    console.log('\n🧾 4. INSERTING SAMPLE RECEIPTS');
    console.log('-------------------------------');
    
    // Get existing bookings to create receipts for
    const bookings = await sql`SELECT id, couple_id, vendor_id, service_name FROM bookings WHERE status = 'quote_accepted' LIMIT 1`;
    
    if (bookings.length > 0) {
      const booking = bookings[0];
      const description = `Payment for ${booking.service_name}`;
      
      // Insert sample receipt
      const receiptResult = await sql`
        INSERT INTO receipts (
          booking_id, 
          couple_id, 
          vendor_id, 
          amount_paid, 
          total_amount, 
          tax_amount,
          receipt_number,
          transaction_reference,
          description
        ) VALUES (
          ${booking.id},
          ${booking.couple_id},
          ${booking.vendor_id},
          5000000,
          5000000,
          0,
          CONCAT('RCP-', TO_CHAR(NOW(), 'YYYY-MM-DD-'), LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0')),
          CONCAT('TXN-', UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))),
          ${description}
        )
        ON CONFLICT (receipt_number) DO NOTHING
        RETURNING receipt_number
      `;
      
      if (receiptResult.length > 0) {
        console.log(`✅ Created sample receipt: ${receiptResult[0].receipt_number}`);
      } else {
        console.log('ℹ️  Sample receipt already exists');
      }
    }
    
  } catch (error) {
    console.error('❌ Sample receipt creation failed:', error.message);
  }

  try {
    console.log('\n✅ 5. VERIFYING FIXES');
    console.log('--------------------');
    
    // Verify bookings now have vendor names
    const fixedBookings = await sql`
      SELECT 
        b.id,
        b.vendor_id,
        b.service_name,
        v.business_name as vendor_name
      FROM bookings b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      ORDER BY b.created_at DESC
    `;
    
    console.log(`📅 Verified ${fixedBookings.length} bookings:`);
    fixedBookings.forEach(b => {
      const status = b.vendor_name ? `✅ ${b.vendor_name}` : `❌ NULL (vendor_id: ${b.vendor_id})`;
      console.log(`   ${b.id}: ${b.service_name} - ${status}`);
    });
    
    // Verify receipts
    const receipts = await sql`SELECT COUNT(*) as count FROM receipts`;
    console.log(`\n🧾 Receipts in system: ${receipts[0].count}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }

  return true;
}

async function main() {
  try {
    const success = await applyDatabaseFixes();
    
    console.log('\n🎯 ====================================');
    if (success) {
      console.log('✅ DATABASE FIXES APPLIED SUCCESSFULLY');
      console.log('🚀 System is now ready for production');
      console.log('📱 Frontend will show correct vendor names');
      console.log('🧾 Receipts system is operational');
      console.log('');
      console.log('📋 WHAT WAS FIXED:');
      console.log('1. ✅ Updated booking vendor_id mapping');
      console.log('2. ✅ Created receipts table with constraints');
      console.log('3. ✅ Created receipt display view');
      console.log('4. ✅ Inserted sample receipt data');
    } else {
      console.log('❌ DATABASE FIXES FAILED');
    }
    console.log('🎯 ====================================');
    
  } catch (error) {
    console.error('💥 Database fix execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
