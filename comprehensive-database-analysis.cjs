const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Neon database connection using environment variable
const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:unpG2RaXJSrr@ep-wild-king-a5xdm9el.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function comprehensiveDatabaseAnalysis() {
    console.log('📊 COMPREHENSIVE DATABASE ANALYSIS - Wedding Bazaar');
    console.log('='.repeat(80));
    
    try {
        // 1. Check all tables in the database
        console.log('\n🏗️  DATABASE SCHEMA ANALYSIS');
        console.log('-'.repeat(40));
        
        const tables = await sql`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        
        console.log(`📋 Found ${tables.length} tables:`);
        tables.forEach(table => {
            console.log(`  • ${table.table_name} (${table.table_type})`);
        });

        // 2. USERS TABLE ANALYSIS
        console.log('\n👥 USERS TABLE ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            const users = await sql`SELECT * FROM users ORDER BY id`;
            console.log(`📊 Total users: ${users.length}`);
            
            if (users.length > 0) {
                console.log('\n👤 All Users:');
                users.forEach((user, index) => {
                    console.log(`  ${index + 1}. ID: ${user.id}`);
                    console.log(`     Email: ${user.email}`);
                    console.log(`     Name: ${user.first_name} ${user.last_name}`);
                    console.log(`     Role: ${user.role}`);
                    console.log(`     Created: ${user.created_at}`);
                    console.log(`     Business: ${user.business_name || 'N/A'}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`❌ Error accessing users table: ${error.message}`);
        }

        // 3. VENDORS TABLE ANALYSIS
        console.log('\n🏪 VENDORS TABLE ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            const vendors = await sql`SELECT * FROM vendors ORDER BY id`;
            console.log(`📊 Total vendors: ${vendors.length}`);
            
            if (vendors.length > 0) {
                console.log('\n🏪 All Vendors:');
                vendors.forEach((vendor, index) => {
                    console.log(`  ${index + 1}. ID: ${vendor.id}`);
                    console.log(`     Business: ${vendor.business_name || vendor.name}`);
                    console.log(`     Category: ${vendor.category || vendor.service_category}`);
                    console.log(`     Rating: ${vendor.rating}`);
                    console.log(`     Location: ${vendor.location}`);
                    console.log(`     Contact: ${vendor.contact_email}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`❌ Error accessing vendors table: ${error.message}`);
        }

        // 4. CONVERSATIONS TABLE ANALYSIS
        console.log('\n💬 CONVERSATIONS TABLE ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            const conversations = await sql`SELECT * FROM conversations ORDER BY created_at DESC`;
            console.log(`📊 Total conversations: ${conversations.length}`);
            
            if (conversations.length > 0) {
                console.log('\n💬 All Conversations:');
                conversations.forEach((conv, index) => {
                    console.log(`  ${index + 1}. ID: ${conv.id}`);
                    console.log(`     Vendor ID: ${conv.vendor_id}`);
                    console.log(`     Couple ID: ${conv.couple_id}`);
                    console.log(`     Service ID: ${conv.service_id}`);
                    console.log(`     Service Name: ${conv.service_name}`);
                    console.log(`     Created: ${conv.created_at}`);
                    console.log(`     Updated: ${conv.updated_at}`);
                    console.log(`     Status: ${conv.status || 'active'}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`❌ Error accessing conversations table: ${error.message}`);
        }

        // 5. MESSAGES TABLE ANALYSIS
        console.log('\n📨 MESSAGES TABLE ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC`;
            console.log(`📊 Total messages: ${messages.length}`);
            
            if (messages.length > 0) {
                console.log('\n📨 All Messages:');
                messages.forEach((msg, index) => {
                    console.log(`  ${index + 1}. ID: ${msg.id}`);
                    console.log(`     Conversation: ${msg.conversation_id}`);
                    console.log(`     Sender: ${msg.sender_id} (${msg.sender_name})`);
                    console.log(`     Type: ${msg.sender_type}`);
                    console.log(`     Content: "${msg.content}"`);
                    console.log(`     Created: ${msg.created_at}`);
                    console.log(`     Read: ${msg.is_read}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`❌ Error accessing messages table: ${error.message}`);
        }

        // 6. CONVERSATION PARTICIPANTS ANALYSIS
        console.log('\n👥 CONVERSATION PARTICIPANTS ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            const participants = await sql`SELECT * FROM conversation_participants ORDER BY conversation_id`;
            console.log(`📊 Total participants: ${participants.length}`);
            
            if (participants.length > 0) {
                console.log('\n👥 All Participants:');
                participants.forEach((participant, index) => {
                    console.log(`  ${index + 1}. Conversation: ${participant.conversation_id}`);
                    console.log(`     User ID: ${participant.user_id}`);
                    console.log(`     Role: ${participant.role}`);
                    console.log(`     Joined: ${participant.joined_at}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`❌ Error accessing conversation_participants table: ${error.message}`);
        }

        // 7. BOOKINGS TABLE ANALYSIS
        console.log('\n📅 BOOKINGS TABLE ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
            console.log(`📊 Total bookings: ${bookings.length}`);
            
            if (bookings.length > 0) {
                console.log('\n📅 All Bookings:');
                bookings.forEach((booking, index) => {
                    console.log(`  ${index + 1}. ID: ${booking.id}`);
                    console.log(`     Vendor: ${booking.vendor_id}`);
                    console.log(`     User: ${booking.user_id}`);
                    console.log(`     Service: ${booking.service_name}`);
                    console.log(`     Date: ${booking.event_date}`);
                    console.log(`     Status: ${booking.status}`);
                    console.log(`     Budget: ${booking.budget}`);
                    console.log(`     Created: ${booking.created_at}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`❌ Error accessing bookings table: ${error.message}`);
        }

        // 8. SERVICES TABLE ANALYSIS (if exists)
        console.log('\n🎯 SERVICES TABLE ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            const services = await sql`SELECT * FROM services ORDER BY id`;
            console.log(`📊 Total services: ${services.length}`);
            
            if (services.length > 0) {
                console.log('\n🎯 All Services:');
                services.forEach((service, index) => {
                    console.log(`  ${index + 1}. ID: ${service.id}`);
                    console.log(`     Name: ${service.name}`);
                    console.log(`     Category: ${service.category}`);
                    console.log(`     Vendor: ${service.vendor_id}`);
                    console.log(`     Price: ${service.price}`);
                    console.log(`     Description: ${service.description?.substring(0, 100)}...`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`❌ Error accessing services table: ${error.message}`);
        }

        // 9. DATA RELATIONSHIPS ANALYSIS
        console.log('\n🔗 DATA RELATIONSHIPS ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            // Analyze conversation-message relationships
            const convMessageCount = await sql`
                SELECT c.id as conversation_id, c.service_name, 
                       COUNT(m.id) as message_count,
                       c.vendor_id, c.couple_id
                FROM conversations c
                LEFT JOIN messages m ON c.id = m.conversation_id
                GROUP BY c.id, c.service_name, c.vendor_id, c.couple_id
                ORDER BY message_count DESC
            `;
            
            console.log('💬 Conversations with Message Counts:');
            convMessageCount.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.conversation_id} (${item.service_name})`);
                console.log(`     Messages: ${item.message_count}`);
                console.log(`     Vendor: ${item.vendor_id}, Couple: ${item.couple_id}`);
                console.log('');
            });
        } catch (error) {
            console.log(`❌ Error analyzing relationships: ${error.message}`);
        }

        // 10. USER ID MAPPING ANALYSIS
        console.log('\n🗺️  USER ID MAPPING ANALYSIS');
        console.log('-'.repeat(40));
        
        try {
            // Check which user emails map to which conversation participant IDs
            const userMapping = await sql`
                SELECT DISTINCT 
                    u.email,
                    u.id as user_table_id,
                    c.vendor_id,
                    c.couple_id,
                    c.service_name
                FROM users u
                LEFT JOIN conversations c ON (u.id = c.vendor_id OR u.id = c.couple_id)
                ORDER BY u.email
            `;
            
            console.log('📧 Email to ID Mapping:');
            userMapping.forEach((mapping, index) => {
                console.log(`  ${index + 1}. ${mapping.email} → User ID: ${mapping.user_table_id}`);
                if (mapping.service_name) {
                    console.log(`     Involved in: ${mapping.service_name}`);
                    console.log(`     As Vendor: ${mapping.vendor_id}, As Couple: ${mapping.couple_id}`);
                }
                console.log('');
            });
        } catch (error) {
            console.log(`❌ Error analyzing user mapping: ${error.message}`);
        }

        console.log('\n✅ COMPREHENSIVE DATABASE ANALYSIS COMPLETE');
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('❌ Critical error during database analysis:', error);
    }
}

// Run the analysis
comprehensiveDatabaseAnalysis();
