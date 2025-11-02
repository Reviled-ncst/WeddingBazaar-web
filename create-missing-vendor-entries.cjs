require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createMissingVendorEntries() {
  console.log('🔧 Creating missing vendor entries...\n');
  
  // Get vendor users without vendor entries
  const missingVendors = [
    { user_id: '2-2025-002', email: 'alison.ortega5@gmail.com', name: 'Alison Ortega' },
    { user_id: '2-2025-004', email: 'godwen.dava@gmail.com', name: 'Fiel Dava' }
  ];
  
  // Get current vendor count
  const countResult = await sql`SELECT COUNT(*) as count FROM vendors`;
  let vendorCount = parseInt(countResult[0].count);
  
  console.log(`📊 Current vendor count: ${vendorCount}\n`);
  
  for (const missing of missingVendors) {
    vendorCount++;
    const vendorId = `VEN-${vendorCount.toString().padStart(5, '0')}`;
    
    console.log(`Creating vendor for ${missing.email}:`);
    console.log(`  User ID: ${missing.user_id}`);
    console.log(`  Vendor ID: ${vendorId}`);
    
    try {
      // Get business info from vendor_profiles if exists
      const profiles = await sql`
        SELECT business_name, business_type, service_area
        FROM vendor_profiles
        WHERE user_id = ${missing.user_id}
      `;
      
      const businessName = profiles.length > 0 && profiles[0].business_name 
        ? profiles[0].business_name 
        : `${missing.name}'s Business`;
      
      const businessType = profiles.length > 0 && profiles[0].business_type
        ? profiles[0].business_type
        : 'Other';
      
      const location = profiles.length > 0 && profiles[0].service_area
        ? profiles[0].service_area
        : 'Philippines';
      
      await sql`
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
          ${missing.user_id},
          ${businessName},
          ${businessType},
          ${''},
          ${location},
          ${0},
          ${0},
          ${false},
          NOW(),
          NOW()
        )
      `;
      
      console.log(`  ✅ Created: ${businessName} (${vendorId})\n`);
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
    }
  }
  
  // Verify
  console.log('📊 Final vendor list:\n');
  const allVendors = await sql`
    SELECT id, user_id, business_name
    FROM vendors
    ORDER BY id
  `;
  
  allVendors.forEach((v, i) => {
    console.log(`${i + 1}. ${v.id} - ${v.business_name} (User: ${v.user_id})`);
  });
  
  console.log(`\n✅ Total vendors now: ${allVendors.length}`);
}

createMissingVendorEntries();
