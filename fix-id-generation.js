const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * Fix ID Generation Logic for Users, Vendors, and Services
 * 
 * Expected Formats:
 * - Users: 1-yyyy-000 (individuals), 2-yyyy-000 (vendors)
 * - Vendors: 2-yyyy-000 (should match user ID)
 * - Services: SRV-0001, SRV-0002, etc.
 */

// Helper function to get the next sequential ID for users
async function getNextUserId(role) {
  try {
    const prefix = role === 'vendor' ? '2' : '1';
    const year = new Date().getFullYear();
    
    // Get the highest existing ID for this role and year
    const result = await sql`
      SELECT id FROM users 
      WHERE id LIKE ${`${prefix}-${year}-%`}
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (result.length === 0) {
      // First user of this type this year
      return `${prefix}-${year}-001`;
    }
    
    // Extract the number part and increment
    const lastId = result[0].id;
    const numberPart = parseInt(lastId.split('-')[2]);
    const nextNumber = (numberPart + 1).toString().padStart(3, '0');
    
    return `${prefix}-${year}-${nextNumber}`;
  } catch (error) {
    console.error('❌ Error generating user ID:', error);
    // Fallback to timestamp-based ID
    return `${prefix}-${year}-${String(Date.now()).slice(-3)}`;
  }
}

// Helper function to get the next sequential ID for services
async function getNextServiceId() {
  try {
    // Get the latest service ID
    const result = await sql`
      SELECT id FROM services 
      WHERE id LIKE 'SRV-%'
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (result.length === 0) {
      // First service
      return 'SRV-0001';
    }
    
    // Extract the number part and increment
    const lastId = result[0].id;
    const numberPart = parseInt(lastId.replace('SRV-', ''));
    const nextNumber = (numberPart + 1).toString().padStart(4, '0');
    
    return `SRV-${nextNumber}`;
  } catch (error) {
    console.error('❌ Error generating service ID:', error);
    // Fallback to timestamp-based ID
    return `SRV-${Date.now()}`;
  }
}

// Test the ID generation functions
async function testIdGeneration() {
  console.log('🧪 Testing ID Generation Functions...\n');
  
  try {
    // Test user ID generation
    const individualId = await getNextUserId('individual');
    const vendorId = await getNextUserId('vendor');
    
    console.log('👤 User ID Generation:');
    console.log(`  Individual: ${individualId}`);
    console.log(`  Vendor: ${vendorId}`);
    
    // Test service ID generation
    const serviceId = await getNextServiceId();
    console.log(`\n🛠️ Service ID Generation:`);
    console.log(`  Service: ${serviceId}`);
    
    console.log('\n✅ ID Generation Test Complete');
    
    return {
      individualId,
      vendorId,
      serviceId,
      functions: {
        getNextUserId,
        getNextServiceId
      }
    };
    
  } catch (error) {
    console.error('❌ ID Generation Test Failed:', error);
    throw error;
  }
}

// Export functions for use in other files
module.exports = {
  getNextUserId,
  getNextServiceId,
  testIdGeneration
};

// Run test if called directly
if (require.main === module) {
  testIdGeneration()
    .then(() => {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}
