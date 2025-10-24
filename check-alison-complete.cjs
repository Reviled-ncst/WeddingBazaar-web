const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAlisonComplete() {
  try {
    console.log('=== ALISON\'S COMPLETE PROFILE ===\n');
    
    const userId = '2-2025-002';
    const vendorProfileId = '9dc49ff7-1196-4c94-a722-fe39d05c9ecc';
    
    // 1. User account
    console.log('1. User Account:');
    const user = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    console.log(JSON.stringify(user, null, 2));
    
    // 2. Vendor profile
    console.log('\n2. Vendor Profile:');
    const vendorProfile = await sql`
      SELECT * FROM vendor_profiles WHERE id = ${vendorProfileId}
    `;
    console.log(JSON.stringify(vendorProfile, null, 2));
    
    // 3. Vendor documents
    console.log('\n3. Vendor Documents:');
    const docs = await sql`
      SELECT * FROM vendor_documents 
      WHERE vendor_id = ${vendorProfileId}
      ORDER BY uploaded_at DESC
    `;
    console.log(JSON.stringify(docs, null, 2));
    
    // 4. Services
    console.log('\n4. Services:');
    const services = await sql`
      SELECT *
      FROM services 
      WHERE vendor_id = ${vendorProfileId}
    `;
    console.log(JSON.stringify(services, null, 2));
    
    // 5. Check if she can create services (what's blocking her?)
    console.log('\n5. Verification Summary:');
    console.log({
      emailVerified: user[0]?.email_verified,
      phoneVerified: user[0]?.phone_verified,
      businessVerified: vendorProfile[0]?.business_verified,
      documentsVerified: vendorProfile[0]?.documents_verified,
      verificationStatus: vendorProfile[0]?.verification_status,
      documentsUploaded: docs.length,
      canCreateServices: user[0]?.email_verified && docs.length > 0
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAlisonComplete();
