const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkEmailVerificationSource() {
  try {
    console.log('=== INVESTIGATING EMAIL VERIFICATION ===\n');
    
    // Check Alison's current email_verified status
    console.log('1. Current Status:');
    const user = await sql`
      SELECT id, email, user_type, email_verified, firebase_uid, created_at
      FROM users 
      WHERE id = '2-2025-002'
    `;
    console.log(JSON.stringify(user, null, 2));
    
    // Check all vendors to see the pattern
    console.log('\n2. All Vendors Email Verification Status:');
    const vendors = await sql`
      SELECT id, email, email_verified, firebase_uid, created_at
      FROM users 
      WHERE user_type = 'vendor'
      ORDER BY created_at DESC
    `;
    console.log(JSON.stringify(vendors, null, 2));
    
    // Check if there's a firebase_uid
    console.log('\n3. Firebase UID Analysis:');
    vendors.forEach(v => {
      console.log(`${v.email}:`, {
        email_verified: v.email_verified,
        has_firebase_uid: !!v.firebase_uid,
        firebase_uid: v.firebase_uid
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmailVerificationSource();
