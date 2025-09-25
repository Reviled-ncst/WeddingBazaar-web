// Debug the exact field structure from the API
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function debugFieldStructure() {
  try {
    console.log('\n🔍 DEBUGGING FIELD STRUCTURE FROM API...\n');
    
    const response = await makeRequest('/api/bookings?coupleId=c-38319639-149');
    
    if (response.success && response.data?.bookings?.length > 0) {
      const booking = response.data.bookings[0];
      
      console.log('📋 FIRST BOOKING STRUCTURE:');
      console.log('==================================================');
      console.log('Raw booking object keys:', Object.keys(booking));
      console.log('');
      
      // Check price-related fields
      console.log('💰 PRICE FIELDS:');
      console.log(`  amount: ${booking.amount} (${typeof booking.amount})`);
      console.log(`  quoted_price: ${booking.quoted_price} (${typeof booking.quoted_price})`);
      console.log(`  final_price: ${booking.final_price} (${typeof booking.final_price})`);
      console.log(`  downpayment_amount: ${booking.downpayment_amount} (${typeof booking.downpayment_amount})`);
      console.log(`  total_paid: ${booking.total_paid} (${typeof booking.total_paid})`);
      console.log(`  remaining_balance: ${booking.remaining_balance} (${typeof booking.remaining_balance})`);
      console.log('');
      
      // Check name fields
      console.log('👤 NAME FIELDS:');
      console.log(`  vendor_name: ${booking.vendor_name} (${typeof booking.vendor_name})`);
      console.log(`  couple_name: ${booking.couple_name} (${typeof booking.couple_name})`);
      console.log(`  contact_person: ${booking.contact_person} (${typeof booking.contact_person})`);
      console.log('');
      
      // Check other key fields
      console.log('📍 OTHER KEY FIELDS:');
      console.log(`  id: ${booking.id} (${typeof booking.id})`);
      console.log(`  status: ${booking.status} (${typeof booking.status})`);
      console.log(`  service_type: ${booking.service_type} (${typeof booking.service_type})`);
      console.log(`  event_date: ${booking.event_date} (${typeof booking.event_date})`);
      console.log('');
      
      // Test the mapping logic
      console.log('🧪 TESTING MAPPING LOGIC:');
      const testAmount = Number(booking.final_price) || Number(booking.quoted_price) || Number(booking.amount) || 0;
      console.log(`  Mapped amount: ${testAmount}`);
      console.log(`  Number(booking.final_price): ${Number(booking.final_price)}`);
      console.log(`  Number(booking.quoted_price): ${Number(booking.quoted_price)}`);
      console.log(`  Number(booking.amount): ${Number(booking.amount)}`);
      
      console.log('\n📝 FULL BOOKING OBJECT:');
      console.log(JSON.stringify(booking, null, 2));
      
    } else {
      console.log('❌ No bookings found or API error');
      console.log('Response:', response);
    }
    
  } catch (error) {
    console.error('❌ Error debugging field structure:', error.message);
  }
}

debugFieldStructure();
