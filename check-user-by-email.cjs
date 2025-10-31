#!/usr/bin/env node

/**
 * Check User by Email in Database
 * 
 * This script checks if a user exists in the users table by email
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkUserByEmail(email) {
  console.log('\n🔍 Checking user in database...');
  console.log(`📧 Email: ${email}`);
  
  try {
    // Check users table
    const users = await sql`
      SELECT id, email, first_name, last_name, user_type, phone, email_verified, created_at
      FROM users
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      console.log('\n❌ User NOT found in database');
      console.log('This confirms the registration was blocked by Firebase (email already in use)');
      console.log('\n💡 Solutions:');
      console.log('   1. Login with this email if you already have an account');
      console.log('   2. Use a different email to register a new account');
      console.log('   3. Reset your password if you forgot it');
      return;
    }
    
    const user = users[0];
    console.log('\n✅ User found in database!');
    console.log('=====================================');
    console.log('👤 User Data:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Role: ${user.user_type}`);
    console.log(`   Phone: ${user.phone || 'N/A'}`);
    console.log(`   Email Verified: ${user.email_verified}`);
    console.log(`   Created: ${user.created_at}`);
    
    // If coordinator/vendor, check vendor_profiles
    if (user.user_type === 'coordinator' || user.user_type === 'vendor') {
      console.log('\n🔍 Checking vendor profile...');
      
      const profiles = await sql`
        SELECT id, business_name, business_type, years_experience, team_size, 
               specialties, service_areas, created_at
        FROM vendor_profiles
        WHERE user_id = ${user.id}
      `;
      
      if (profiles.length > 0) {
        const profile = profiles[0];
        console.log('\n✅ Profile found!');
        console.log('=====================================');
        console.log('🏢 Profile Data:');
        console.log(`   ID: ${profile.id}`);
        console.log(`   Business Name: ${profile.business_name}`);
        console.log(`   Business Type: ${profile.business_type}`);
        console.log(`   Years Experience: ${profile.years_experience || 'N/A'}`);
        console.log(`   Team Size: ${profile.team_size || 'N/A'}`);
        console.log(`   Specialties: ${profile.specialties?.join(', ') || 'N/A'}`);
        console.log(`   Service Areas: ${profile.service_areas?.join(', ') || 'N/A'}`);
        console.log(`   Created: ${profile.created_at}`);
      } else {
        console.log('\n⚠️ No profile found in vendor_profiles table');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Database Error:', error.message);
  }
}

const email = process.argv[2] || 'elealesantos06@gmail.com';
checkUserByEmail(email);
