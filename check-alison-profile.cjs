const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAlisonProfile() {
  try {
    console.log('=== CHECKING ALISON\'S PROFILE ===\n');
    
    // 1. Check user account
    console.log('1. User Account:');
    const user = await sql`
      SELECT id, email, first_name, last_name, user_type, email_verified, phone, phone_verified, created_at
      FROM users 
      WHERE id = '32edf34e-2d6e-408f-82dd-dc39c68e8f98'
    `;
    console.log(JSON.stringify(user, null, 2));
    
    // 2. Check vendor profile
    console.log('\n2. Vendor Profile:');
    const vendorProfile = await sql`
      SELECT * 
      FROM vendor_profiles 
      WHERE user_id = '32edf34e-2d6e-408f-82dd-dc39c68e8f98'
    `;
    console.log(JSON.stringify(vendorProfile, null, 2));
    
    // 3. Check vendor documents
    if (vendorProfile.length > 0) {
      console.log('\n3. Vendor Documents:');
      const docs = await sql`
        SELECT * 
        FROM vendor_documents 
        WHERE vendor_id = ${vendorProfile[0].id}
        ORDER BY uploaded_at DESC
      `;
      console.log(JSON.stringify(docs, null, 2));
    }
    
    // 4. Check vendor services
    if (vendorProfile.length > 0) {
      console.log('\n4. Vendor Services:');
      const services = await sql`
        SELECT * 
        FROM services 
        WHERE vendor_id = ${vendorProfile[0].id}
      `;
      console.log(JSON.stringify(services, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAlisonProfile();
