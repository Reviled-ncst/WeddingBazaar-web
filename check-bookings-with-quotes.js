// Check database for bookings with vendor_notes
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

async function checkBookingsWithQuotes() {
    console.log('🔍 Checking for Bookings with Vendor Quotes\n');
    console.log('=' .repeat(70));
    
    try {
        // Fetch all bookings
        console.log('\n📊 Fetching bookings from enhanced endpoint...');
        const response = await fetch(`${API_BASE_URL}/api/bookings/enhanced?coupleId=1-2025-001`);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const bookings = data.bookings || [];
        
        console.log(`✅ Found ${bookings.length} total bookings\n`);
        
        // Separate bookings with and without quotes
        const withQuotes = [];
        const withoutQuotes = [];
        
        bookings.forEach(booking => {
            if (booking.vendor_notes && booking.vendor_notes.trim().length > 0) {
                withQuotes.push(booking);
            } else {
                withoutQuotes.push(booking);
            }
        });
        
        console.log('📊 SUMMARY');
        console.log('─'.repeat(70));
        console.log(`✅ Bookings WITH vendor quotes: ${withQuotes.length}`);
        console.log(`⚠️  Bookings WITHOUT vendor quotes: ${withoutQuotes.length}\n`);
        
        // Show details of bookings with quotes
        if (withQuotes.length > 0) {
            console.log('📋 BOOKINGS WITH VENDOR QUOTES:');
            console.log('─'.repeat(70));
            
            withQuotes.forEach((booking, index) => {
                console.log(`\n${index + 1}. Booking ID: ${booking.id}`);
                console.log(`   Status: ${booking.status}`);
                console.log(`   Service: ${booking.service_name || 'N/A'}`);
                console.log(`   Vendor: ${booking.vendor_business_name || 'N/A'}`);
                console.log(`   Amount: $${booking.amount || 'Not set'}`);
                console.log(`   Vendor Notes Length: ${booking.vendor_notes.length} characters`);
                
                // Try to parse as JSON
                try {
                    const parsedNotes = JSON.parse(booking.vendor_notes);
                    
                    if (Array.isArray(parsedNotes)) {
                        console.log(`   ✅ ITEMIZED QUOTE (${parsedNotes.length} items):`);
                        parsedNotes.forEach((item, i) => {
                            console.log(`      ${i + 1}. ${item.name}: $${item.price}`);
                            if (item.description) {
                                console.log(`         └─ ${item.description}`);
                            }
                        });
                        
                        // Calculate total
                        const total = parsedNotes.reduce((sum, item) => sum + (item.price || 0), 0);
                        console.log(`      ────────────────────`);
                        console.log(`      TOTAL: $${total}`);
                    } else if (typeof parsedNotes === 'object') {
                        console.log(`   📝 Quote (object format):`);
                        console.log(`      ${JSON.stringify(parsedNotes, null, 2)}`);
                    }
                } catch (e) {
                    console.log(`   📝 Quote (plain text):`);
                    console.log(`      ${booking.vendor_notes.substring(0, 200)}${booking.vendor_notes.length > 200 ? '...' : ''}`);
                }
            });
        }
        
        // Show bookings without quotes
        if (withoutQuotes.length > 0) {
            console.log('\n\n📋 BOOKINGS WITHOUT VENDOR QUOTES:');
            console.log('─'.repeat(70));
            
            withoutQuotes.forEach((booking, index) => {
                console.log(`${index + 1}. Booking ID: ${booking.id} | Status: ${booking.status} | Service: ${booking.service_name || 'N/A'}`);
            });
        }
        
        // Next steps
        console.log('\n\n' + '='.repeat(70));
        console.log('💡 NEXT STEPS:');
        console.log('='.repeat(70));
        
        if (withQuotes.length > 0) {
            console.log('\n✅ GREAT! Bookings with quotes found!');
            console.log('\n🧪 Testing Steps:');
            console.log('   1. Login to frontend as couple (renzrusselbauto@gmail.com)');
            console.log('   2. Go to Bookings page (/individual/bookings)');
            console.log('   3. Click on booking with quote');
            console.log('   4. Verify itemized services display correctly');
            console.log('   5. Test "Accept Quote" button');
            console.log('\n🔗 Frontend URL: https://weddingbazaar-web.web.app/individual/bookings');
        } else {
            console.log('\n⚠️  No bookings with quotes found in database');
            console.log('\n📝 To create a test quote:');
            console.log('   1. Login as vendor');
            console.log('   2. Go to Vendor Bookings page');
            console.log('   3. Select a booking request');
            console.log('   4. Click "Send Quote"');
            console.log('   5. Add itemized services:');
            console.log('      - Service Name: "Photography Package"');
            console.log('      - Price: $1200');
            console.log('      - Description: "Full day coverage"');
            console.log('   6. Add more items if desired');
            console.log('   7. Send quote to client');
            console.log('\n🔗 Vendor Portal: https://weddingbazaar-web.web.app/vendor/bookings');
        }
        
        console.log('\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if backend is online: curl https://weddingbazaar-web.onrender.com/api/health');
        console.error('   2. Verify API endpoint exists');
        console.error('   3. Check database connection');
    }
}

checkBookingsWithQuotes().catch(console.error);
