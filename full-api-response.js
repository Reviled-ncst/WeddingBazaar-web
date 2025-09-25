// Test and log the full API response
const apiUrl = 'https://weddingbazaar-web.onrender.com';

async function fullAPIResponse() {
  console.log('🔍 Getting full API response...');
  
  try {
    const response = await fetch(`${apiUrl}/api/bookings?coupleId=1-2025-001`);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log('\n📄 Full response text:');
    console.log(text);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('\n📊 Parsed JSON structure:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('❌ Failed to parse as JSON:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fullAPIResponse();
