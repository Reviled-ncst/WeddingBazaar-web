#!/usr/bin/env node
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Checking vendor ID mapping for user 2-2025-003\n');
  
  // 1. Check vendors table
  const vendors = await sql`SELECT id, user_id, business_name FROM vendors WHERE user_id = '2-2025-003'`;
  
  if (vendors.length === 0) {
    console.log('❌ NOT FOUND in vendors table!');
    console.log('   This is why vendorId = null in auth response.\n');
  } else {
    console.log('✅ FOUND in vendors table:');
    console.log(`   Vendor ID: ${vendors[0].id}`);
    console.log(`   Business: ${vendors[0].business_name}\n`);
  }
  
  // 2. Check vendor_profiles table
  const profiles = await sql`SELECT id, user_id, business_name FROM vendor_profiles WHERE user_id = '2-2025-003'`;
  
  if (profiles.length > 0) {
    console.log('✅ FOUND in vendor_profiles table:');
    console.log(`   Profile ID: ${profiles[0].id}`);
    console.log(`   Business: ${profiles[0].business_name}\n`);
  }
  
  // 3. Check subscription
  const subs = await sql`SELECT id, vendor_id, plan_name, status FROM vendor_subscriptions WHERE vendor_id = '2-2025-003'`;
  
  if (subs.length > 0) {
    console.log('✅ FOUND in vendor_subscriptions table:');
    console.log(`   Plan: ${subs[0].plan_name}`);
    console.log(`   Status: ${subs[0].status}`);
    console.log(`   vendor_id points to: ${subs[0].vendor_id}\n`);
  }
  
  // 4. Summary
  console.log('📊 SUMMARY:');
  console.log(`   vendors table: ${vendors.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`   vendor_profiles table: ${profiles.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`   vendor_subscriptions table: ${subs.length > 0 ? '✅ EXISTS' : '❌ MISSING'}\n`);
  
  if (vendors.length === 0 && profiles.length > 0) {
    console.log('💡 ROOT CAUSE:');
    console.log('   User has profile in vendor_profiles but NO entry in vendors table.');
    console.log('   The auth endpoint only checks vendors table for vendorId.');
    console.log('   Subscription uses user_id (2-2025-003) directly, which works.\n');
    console.log('🔧 SOLUTION:');
    console.log('   Create entry in vendors table OR change auth.cjs to check vendor_profiles.');
  }
}

main().catch(console.error);
