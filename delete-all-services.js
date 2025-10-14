// Delete all services from the database
// WARNING: This will permanently delete all services data
// Run this script with: node delete-all-services.js

const API_BASE_URL = 'https://weddingbazaar-web.onrender.com/api';

async function deleteAllServices() {
  console.log('🗑️ Starting deletion of all services...');
  console.log('⚠️ WARNING: This will permanently delete ALL services from the database!');
  
  try {
    // First, get all services to see what we're deleting
    console.log('📊 Fetching current services...');
    const getResponse = await fetch(`${API_BASE_URL}/services`);
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch services: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const servicesData = await getResponse.json();
    const services = servicesData.services || servicesData || [];
    
    console.log(`📋 Found ${services.length} services to delete`);
    
    if (services.length === 0) {
      console.log('✅ No services found. Database is already empty.');
      return;
    }
    
    // List some services for confirmation
    console.log('📝 Sample services that will be deleted:');
    services.slice(0, 5).forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title || service.name || service.id} (ID: ${service.id})`);
    });
    
    if (services.length > 5) {
      console.log(`   ... and ${services.length - 5} more services`);
    }
    
    // Check if there's a bulk delete endpoint
    console.log('\n🔄 Attempting bulk delete...');
    
    // Try DELETE /api/services (bulk delete)
    const bulkDeleteResponse = await fetch(`${API_BASE_URL}/services`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (bulkDeleteResponse.ok) {
      const result = await bulkDeleteResponse.json();
      console.log('✅ Bulk delete successful!');
      console.log('📊 Result:', result);
      return;
    }
    
    console.log('⚠️ Bulk delete not available, trying individual deletion...');
    
    // If bulk delete doesn't work, delete individually
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const service of services) {
      try {
        const deleteResponse = await fetch(`${API_BASE_URL}/services/${service.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (deleteResponse.ok) {
          deletedCount++;
          console.log(`✅ Deleted service: ${service.title || service.id} (${deletedCount}/${services.length})`);
        } else {
          errorCount++;
          console.log(`❌ Failed to delete service: ${service.title || service.id} - ${deleteResponse.status} ${deleteResponse.statusText}`);
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errorCount++;
        console.log(`❌ Error deleting service: ${service.title || service.id} - ${error.message}`);
      }
    }
    
    console.log('\n📊 DELETION SUMMARY:');
    console.log(`✅ Successfully deleted: ${deletedCount} services`);
    console.log(`❌ Failed to delete: ${errorCount} services`);
    console.log(`📊 Total processed: ${deletedCount + errorCount} services`);
    
  } catch (error) {
    console.error('❌ Error during deletion process:', error.message);
    
    // Additional error details
    if (error.response) {
      console.error('🔍 Response status:', error.response.status);
      console.error('🔍 Response text:', await error.response.text());
    }
  }
}

async function confirmAndDelete() {
  // In a real script, you might want to add readline for user confirmation
  console.log('🚨 DANGER: This will delete ALL services from the database!');
  console.log('🚨 This action cannot be undone!');
  console.log('');
  console.log('To proceed, this script will run automatically in 3 seconds...');
  console.log('Press Ctrl+C to cancel');
  
  // 3 second countdown
  for (let i = 3; i > 0; i--) {
    console.log(`⏳ Starting deletion in ${i}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🚀 Starting deletion process...\n');
  await deleteAllServices();
}

// Alternative: Check what endpoints are available
async function checkAvailableEndpoints() {
  try {
    console.log('🔍 Checking available endpoints...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('📋 Available endpoints:', healthData.endpoints);
    }
  } catch (error) {
    console.log('⚠️ Could not check endpoints:', error.message);
  }
}

// Run the script
async function main() {
  await checkAvailableEndpoints();
  console.log('\n');
  await confirmAndDelete();
}

// Execute if running directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { deleteAllServices, checkAvailableEndpoints };
