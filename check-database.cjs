const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAllTables() {
  try {
    console.log('🔍 Checking all table contents...\n');
    
    // Check vendors table
    console.log('📊 VENDORS TABLE:');
    const vendors = await sql`SELECT * FROM vendors ORDER BY id`;
    console.log(`Total vendors: ${vendors.length}`);
    vendors.forEach(vendor => {
      console.log(`  ID: ${vendor.id} | Name: ${vendor.business_name} | Type: ${vendor.business_type || vendor.category} | Rating: ${vendor.rating} | Reviews: ${vendor.review_count} | Verified: ${vendor.verified}`);
    });
    
    console.log('\n📊 SERVICES TABLE:');
    const services = await sql`SELECT * FROM services ORDER BY id`;
    console.log(`Total services: ${services.length}`);
    services.forEach(service => {
      console.log(`  ID: ${service.id} | Name: ${service.name} | Vendor ID: ${service.vendor_id} | Category: ${service.category} | Price: ${service.price}`);
    });
    
    console.log('\n📊 USERS TABLE:');
    const users = await sql`SELECT id, email, user_type, created_at FROM users ORDER BY id`;
    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`  ID: ${user.id} | Email: ${user.email} | Type: ${user.user_type} | Created: ${user.created_at}`);
    });
    
    console.log('\n📊 CONVERSATIONS TABLE:');
    const conversations = await sql`SELECT * FROM conversations ORDER BY id`;
    console.log(`Total conversations: ${conversations.length}`);
    conversations.forEach(conv => {
      console.log(`  ID: ${conv.id} | Customer: ${conv.customer_id} | Vendor: ${conv.vendor_id} | Created: ${conv.created_at}`);
    });
    
    console.log('\n📊 MESSAGES TABLE:');
    const messages = await sql`SELECT * FROM messages ORDER BY id LIMIT 10`;
    console.log(`Total messages (showing first 10): ${messages.length}`);
    messages.forEach(msg => {
      console.log(`  ID: ${msg.id} | Conv: ${msg.conversation_id} | Sender: ${msg.sender_id} | Content: ${msg.content.substring(0, 50)}...`);
    });
    
    console.log('\n📊 BOOKINGS TABLE:');
    const bookings = await sql`SELECT * FROM bookings ORDER BY id`;
    console.log(`Total bookings: ${bookings.length}`);
    bookings.forEach(booking => {
      console.log(`  ID: ${booking.id} | Customer: ${booking.customer_id} | Vendor: ${booking.vendor_id} | Service: ${booking.service_id} | Status: ${booking.status} | Amount: ${booking.total_amount}`);
    });
    
    // Test the featured vendors query that the API uses
    console.log('\n🌟 FEATURED VENDORS QUERY TEST:');
    const featuredVendors = await sql`
      SELECT 
        v.id, v.business_name, v.business_type, v.category, v.location, 
        v.rating, v.review_count, v.description, v.verified
      FROM vendors v
      WHERE v.verified = true 
        AND v.rating >= 4.5 
        AND v.review_count >= 10
      ORDER BY v.rating DESC, v.review_count DESC
      LIMIT 6
    `;
    
    console.log(`Featured vendors found: ${featuredVendors.length}`);
    featuredVendors.forEach(vendor => {
      console.log(`  - ${vendor.business_name} (${vendor.business_type || vendor.category}) - Rating: ${vendor.rating} - Reviews: ${vendor.review_count}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkAllTables().then(() => {
  console.log('\n✅ Database check completed!');
  process.exit(0);
});
