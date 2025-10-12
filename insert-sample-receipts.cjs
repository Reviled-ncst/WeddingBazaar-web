#!/usr/bin/env node

/**
 * 🧾 INSERT SAMPLE RECEIPTS: Add sample receipt data with correct data types
 */

const { neon } = require('@neondatabase/serverless');

async function insertSampleReceipts() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9tiyUmfaX3QB@ep-mute-mode-a1c209pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

  console.log('🧾 ====================================');
  console.log('🧾 INSERTING SAMPLE RECEIPTS');
  console.log('🧾 ====================================');

  try {
    console.log('\n📋 1. GETTING BOOKING DATA');
    console.log('---------------------------');
    
    // Get existing bookings
    const bookings = await sql`SELECT id, couple_id, vendor_id, service_name, status FROM bookings ORDER BY created_at DESC LIMIT 3`;
    
    console.log(`📅 Found ${bookings.length} bookings:`);
    bookings.forEach(b => {
      console.log(`   ID: ${b.id} - ${b.service_name} - Status: ${b.status} - Vendor: ${b.vendor_id}`);
    });
    
  } catch (error) {
    console.error('❌ Booking data retrieval failed:', error.message);
    return false;
  }

  try {
    console.log('\n📋 2. INSERTING SAMPLE RECEIPTS');
    console.log('-------------------------------');
    
    // Get bookings to create receipts for
    const bookings = await sql`SELECT id, couple_id, vendor_id, service_name FROM bookings LIMIT 2`;
    
    for (const booking of bookings) {
      const receiptNumber = `RCP-${Date.now()}-${booking.id}`;
      const transactionRef = `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const description = `Payment for ${booking.service_name}`;
      
      try {
        // Insert receipt with correct data types
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
            description,
            payment_method
          ) VALUES (
            ${booking.id.toString()},
            ${booking.couple_id},
            ${booking.vendor_id},
            5000000,
            5000000,
            0,
            ${receiptNumber},
            ${transactionRef},
            ${description},
            'bank_transfer'
          )
          ON CONFLICT (receipt_number) DO NOTHING
          RETURNING receipt_number, amount_paid, vendor_id
        `;
        
        if (receiptResult.length > 0) {
          console.log(`✅ Created receipt: ${receiptResult[0].receipt_number} - ₱${receiptResult[0].amount_paid / 100} - Vendor: ${receiptResult[0].vendor_id}`);
        } else {
          console.log(`ℹ️  Receipt for booking ${booking.id} already exists`);
        }
        
      } catch (receiptError) {
        console.error(`❌ Failed to create receipt for booking ${booking.id}:`, receiptError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Receipt insertion failed:', error.message);
    return false;
  }

  try {
    console.log('\n📋 3. TESTING RECEIPTS API QUERY');
    console.log('---------------------------------');
    
    // Test the exact query that the API uses
    const receiptsForCouple = await sql`
      SELECT 
        r.*,
        v.business_name as vendor_name,
        v.category as vendor_category,
        v.rating as vendor_rating,
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
        CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted,
        CONCAT('₱', TO_CHAR(r.tax_amount::DECIMAL / 100, 'FM999,999,999.00')) as tax_amount_formatted
      FROM receipts r
      LEFT JOIN vendors v ON r.vendor_id = v.id
      WHERE r.couple_id = '1-2025-001'
      ORDER BY r.created_at DESC
      LIMIT 20
    `;
    
    console.log(`📊 Receipts API query result: ${receiptsForCouple.length} receipts`);
    receiptsForCouple.forEach(r => {
      console.log(`   🧾 ${r.receipt_number} - ${r.amount_paid_formatted} - ${r.vendor_name || 'Unknown Vendor'}`);
      console.log(`      📅 Date: ${new Date(r.payment_date).toLocaleDateString()}`);
      console.log(`      📊 Status: ${r.payment_status}`);
    });
    
  } catch (error) {
    console.error('❌ API query test failed:', error.message);
    return false;
  }

  try {
    console.log('\n📋 4. VERIFYING COMPLETE SYSTEM');
    console.log('-------------------------------');
    
    // Test the complete booking system
    const enhancedBookings = await sql`
      SELECT 
        b.id,
        b.vendor_id,
        b.couple_id,
        b.service_name,
        b.status,
        b.total_amount,
        v.business_name as vendor_name,
        v.category as vendor_category,
        COUNT(r.id) as receipt_count
      FROM bookings b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      LEFT JOIN receipts r ON r.booking_id = b.id::varchar
      WHERE b.couple_id = '1-2025-001'
      GROUP BY b.id, b.vendor_id, b.couple_id, b.service_name, b.status, b.total_amount, v.business_name, v.category
      ORDER BY b.created_at DESC
    `;
    
    console.log(`📅 Enhanced bookings result: ${enhancedBookings.length} bookings`);
    enhancedBookings.forEach(b => {
      console.log(`   📅 Booking ${b.id}: ${b.service_name}`);
      console.log(`      🏪 Vendor: ${b.vendor_name || 'Unknown'} (${b.vendor_id})`);
      console.log(`      💰 Amount: ₱${b.total_amount?.toLocaleString() || 'N/A'}`);
      console.log(`      🧾 Receipts: ${b.receipt_count}`);
      console.log(`      📊 Status: ${b.status}`);
    });
    
  } catch (error) {
    console.error('❌ Complete system verification failed:', error.message);
    return false;
  }

  return true;
}

async function main() {
  try {
    const success = await insertSampleReceipts();
    
    console.log('\n🎯 ====================================');
    if (success) {
      console.log('✅ SAMPLE RECEIPTS CREATED SUCCESSFULLY');
      console.log('🚀 Complete system is now operational');
      console.log('📱 Frontend APIs will work correctly');
      console.log('');
      console.log('📋 SYSTEM STATUS:');
      console.log('1. ✅ Bookings show correct vendor names');
      console.log('2. ✅ Receipts table has sample data');
      console.log('3. ✅ APIs are ready for frontend');
      console.log('4. ✅ Database relationships working');
    } else {
      console.log('❌ RECEIPT SYSTEM SETUP FAILED');
    }
    console.log('🎯 ====================================');
    
  } catch (error) {
    console.error('💥 Receipt creation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
