const fetch = require('node-fetch');

async function checkCurrentIDFormats() {
  console.log('🔍 Checking current ID formats in database...\n');
  
  const API_BASE = 'https://weddingbazaar-web.onrender.com/api';
  
  try {
    // Check users table via debug endpoint
    console.log('👥 Checking Users Table:');
    const usersResponse = await fetch(`${API_BASE}/debug/users`);
    if (usersResponse.ok) {
      const usersResult = await usersResponse.json();
      if (usersResult.users && usersResult.users.length > 0) {
        console.log('📊 Current user IDs:');
        usersResult.users.slice(0, 5).forEach(user => {
          console.log(`   - ID: ${user.id} | Type: ${user.user_type} | Email: ${user.email}`);
        });
        console.log(`   Total users: ${usersResult.users.length}`);
        
        // Find the pattern
        const userIds = usersResult.users.map(u => u.id);
        const expectedPattern = userIds.filter(id => id.match(/^1-\d{4}-\d{3}$/));
        const unexpectedPattern = userIds.filter(id => !id.match(/^1-\d{4}-\d{3}$/));
        
        console.log(`✅ Expected format (1-yyyy-000): ${expectedPattern.length}`);
        console.log(`❌ Unexpected format: ${unexpectedPattern.length}`);
        if (unexpectedPattern.length > 0) {
          console.log('   Unexpected IDs:', unexpectedPattern.slice(0, 3));
        }
      }
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Check vendors table
    console.log('🏪 Checking Vendors Table:');
    const vendorsResponse = await fetch(`${API_BASE}/vendors`);
    if (vendorsResponse.ok) {
      const vendorsResult = await vendorsResponse.json();
      if (vendorsResult.vendors && vendorsResult.vendors.length > 0) {
        console.log('📊 Current vendor IDs:');
        vendorsResult.vendors.slice(0, 5).forEach(vendor => {
          console.log(`   - ID: ${vendor.id} | Name: ${vendor.name || vendor.business_name}`);
        });
        console.log(`   Total vendors: ${vendorsResult.vendors.length}`);
        
        // Find the pattern
        const vendorIds = vendorsResult.vendors.map(v => v.id);
        const expectedPattern = vendorIds.filter(id => id.match(/^2-\d{4}-\d{3}$/));
        const unexpectedPattern = vendorIds.filter(id => !id.match(/^2-\d{4}-\d{3}$/));
        
        console.log(`✅ Expected format (2-yyyy-000): ${expectedPattern.length}`);
        console.log(`❌ Unexpected format: ${unexpectedPattern.length}`);
        if (unexpectedPattern.length > 0) {
          console.log('   Unexpected IDs:', unexpectedPattern.slice(0, 3));
        }
      }
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Check services table
    console.log('🛍️ Checking Services Table:');
    const servicesResponse = await fetch(`${API_BASE}/services/vendor/2-2025-003`);
    if (servicesResponse.ok) {
      const servicesResult = await servicesResponse.json();
      if (servicesResult.services && servicesResult.services.length > 0) {
        console.log('📊 Current service IDs:');
        servicesResult.services.slice(0, 5).forEach(service => {
          console.log(`   - ID: ${service.id} | Title: ${service.title}`);
        });
        console.log(`   Total services: ${servicesResult.services.length}`);
        
        // Find the pattern
        const serviceIds = servicesResult.services.map(s => s.id);
        const expectedPattern = serviceIds.filter(id => id.match(/^SRV-\d{4}$/));
        const timestampPattern = serviceIds.filter(id => id.match(/^SRV-\d{13}$/));
        const otherPattern = serviceIds.filter(id => !id.match(/^SRV-\d{4}$/) && !id.match(/^SRV-\d{13}$/));
        
        console.log(`✅ Expected format (SRV-0000): ${expectedPattern.length}`);
        console.log(`⚠️ Timestamp format (SRV-timestamp): ${timestampPattern.length}`);
        console.log(`❓ Other formats: ${otherPattern.length}`);
        
        if (timestampPattern.length > 0) {
          console.log('   Recent timestamp IDs:', timestampPattern.slice(-3));
        }
        if (expectedPattern.length > 0) {
          console.log('   Expected format IDs:', expectedPattern.slice(0, 3));
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ID FORMAT ANALYSIS COMPLETE');
    console.log('Expected patterns:');
    console.log('   Users: 1-2025-001, 1-2025-002, etc.');
    console.log('   Vendors: 2-2025-001, 2-2025-002, etc.');
    console.log('   Services: SRV-0001, SRV-0002, etc.');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error checking ID formats:', error.message);
  }
}

checkCurrentIDFormats();
