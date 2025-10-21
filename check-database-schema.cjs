#!/usr/bin/env node

/**
 * 🔍 CHECK DATABASE SCHEMA: Analyze table structures
 */

const { neon } = require('@neondatabase/serverless');

async function checkDatabaseSchema() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://[your-database-url]');

  console.log('🔍 ====================================');
  console.log('🔍 DATABASE SCHEMA ANALYSIS');
  console.log('🔍 ====================================');

  try {
    console.log('\n📋 1. BOOKINGS TABLE STRUCTURE');
    console.log('-------------------------------');
    
    const bookingsSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
    `;
    
    console.log('📅 Bookings table columns:');
    bookingsSchema.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Sample booking data
    const sampleBookings = await sql`SELECT id, vendor_id, couple_id, service_name FROM bookings LIMIT 2`;
    console.log('\n📊 Sample booking data:');
    sampleBookings.forEach(b => {
      console.log(`   ID: ${b.id} (${typeof b.id}) | vendor_id: ${b.vendor_id} (${typeof b.vendor_id})`);
    });
    
  } catch (error) {
    console.error('❌ Bookings schema check failed:', error.message);
  }

  try {
    console.log('\n📋 2. VENDORS TABLE STRUCTURE');
    console.log('------------------------------');
    
    const vendorsSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vendors' 
      ORDER BY ordinal_position
    `;
    
    console.log('🏪 Vendors table columns:');
    vendorsSchema.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Sample vendor data  
    const sampleVendors = await sql`SELECT id, business_name FROM vendors LIMIT 2`;
    console.log('\n📊 Sample vendor data:');
    sampleVendors.forEach(v => {
      console.log(`   ID: ${v.id} (${typeof v.id}) | business_name: ${v.business_name}`);
    });
    
  } catch (error) {
    console.error('❌ Vendors schema check failed:', error.message);
  }

  try {
    console.log('\n📋 3. RECEIPTS TABLE (if exists)');
    console.log('----------------------------------');
    
    const receiptsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'receipts'
      )
    `;
    
    if (receiptsExists[0].exists) {
      const receiptsSchema = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'receipts' 
        ORDER BY ordinal_position
      `;
      
      console.log('🧾 Receipts table columns:');
      receiptsSchema.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
      const receiptCount = await sql`SELECT COUNT(*) as count FROM receipts`;
      console.log(`\n📊 Receipts in table: ${receiptCount[0].count}`);
    } else {
      console.log('🧾 Receipts table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Receipts schema check failed:', error.message);
  }

  try {
    console.log('\n📋 4. TESTING SIMPLE RECEIPT VIEW');
    console.log('----------------------------------');
    
    // Create a simple receipt view without the problematic JOIN
    await sql`
      CREATE OR REPLACE VIEW receipt_simple AS
      SELECT 
        r.*,
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted,
        CONCAT('₱', TO_CHAR(r.total_amount::DECIMAL / 100, 'FM999,999,999.00')) as total_amount_formatted
      FROM receipts r
    `;
    
    console.log('✅ Simple receipt view created successfully');
    
    // Test vendor join separately
    await sql`
      CREATE OR REPLACE VIEW receipt_with_vendor AS
      SELECT 
        r.*,
        v.business_name as vendor_name,
        CONCAT('₱', TO_CHAR(r.amount_paid::DECIMAL / 100, 'FM999,999,999.00')) as amount_paid_formatted
      FROM receipts r
      LEFT JOIN vendors v ON r.vendor_id = v.id
    `;
    
    console.log('✅ Receipt with vendor view created successfully');
    
  } catch (error) {
    console.error('❌ Receipt view creation failed:', error.message);
  }
}

async function main() {
  try {
    await checkDatabaseSchema();
    console.log('\n🎯 Schema analysis complete');
  } catch (error) {
    console.error('💥 Schema check failed:', error);
  }
}

if (require.main === module) {
  main();
}
