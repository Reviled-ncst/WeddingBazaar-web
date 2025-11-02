/**
 * Create vendor profile for vendor0qw@gmail.com
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createVendorProfile() {
  console.log('\n🏢 CREATING VENDOR PROFILE\n');
  console.log('='.repeat(60));

  const userId = '2-2025-003'; // vendor0qw@gmail.com
  
  try {
    // Generate vendor ID
    const countResult = await sql`SELECT COUNT(*) as count FROM vendors`;
    const vendorCount = parseInt(countResult[0].count) + 1;
    const vendorId = `VEN-${vendorCount.toString().padStart(5, '0')}`;
    
    console.log(`\n🆔 Generated Vendor ID: ${vendorId}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📧 Email: vendor0qw@gmail.com`);
    
    // Create vendor profile with minimal data (matching actual table structure)
    const result = await sql`
      INSERT INTO vendors (
        id,
        user_id,
        business_name,
        business_type,
        description,
        location,
        rating,
        review_count,
        verified,
        created_at,
        updated_at
      ) VALUES (
        ${vendorId},
        ${userId},
        'Test Vendor Business',
        'Catering',
        'Test vendor profile for development',
        'Manila, Philippines',
        0.0,
        0,
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    
    console.log('\n✅ VENDOR PROFILE CREATED!\n');
    console.log('Vendor Details:');
    console.log(JSON.stringify(result[0], null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Now you can create services using this vendor account!');
    console.log(`   Vendor ID to use: ${vendorId}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    if (error.code === '23505') {
      console.error('\n❌ Vendor profile already exists for this user');
      console.error('   (Duplicate key violation)\n');
    } else {
      console.error('\n❌ Error creating vendor profile:');
      console.error(error);
    }
  }
}

createVendorProfile();
