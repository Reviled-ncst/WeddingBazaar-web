const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkAllTables() {
  try {
    await client.connect();
    console.log('🔌 Connected to database successfully!');

    // Check vendor_profiles table
    console.log('\n📋 VENDOR_PROFILES TABLE:');
    try {
      const profilesResult = await client.query(`
        SELECT 
          id, user_id, business_name, business_type, business_description, 
          years_in_business, average_rating, total_reviews, total_bookings,
          website_url, social_media, service_areas, pricing_range,
          portfolio_images, featured_image_url, business_hours,
          verification_status, is_featured, is_premium, created_at
        FROM vendor_profiles 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      if (profilesResult.rows.length > 0) {
        console.log(`✅ Found ${profilesResult.rows.length} vendor profiles:`);
        profilesResult.rows.forEach((profile, index) => {
          console.log(`\n${index + 1}. Vendor Profile:`);
          console.log(`   ID: ${profile.id}`);
          console.log(`   User ID: ${profile.user_id}`);
          console.log(`   Business: ${profile.business_name}`);
          console.log(`   Type: ${profile.business_type}`);
          console.log(`   Description: ${profile.business_description ? profile.business_description.substring(0, 100) + '...' : 'N/A'}`);
          console.log(`   Years in Business: ${profile.years_in_business || 'N/A'}`);
          console.log(`   Rating: ${profile.average_rating || 'N/A'} (${profile.total_reviews || 0} reviews)`);
          console.log(`   Total Bookings: ${profile.total_bookings || 0}`);
          console.log(`   Website: ${profile.website_url || 'N/A'}`);
          console.log(`   Featured Image: ${profile.featured_image_url || 'N/A'}`);
          console.log(`   Portfolio Images: ${profile.portfolio_images ? JSON.stringify(profile.portfolio_images).substring(0, 100) + '...' : 'N/A'}`);
          console.log(`   Verification: ${profile.verification_status}`);
          console.log(`   Featured: ${profile.is_featured}`);
          console.log(`   Premium: ${profile.is_premium}`);
          console.log(`   Created: ${profile.created_at}`);
        });
      } else {
        console.log('❌ No vendor profiles found');
      }
    } catch (error) {
      console.log('❌ Error querying vendor_profiles:', error.message);
    }

    // Check vendor_subscriptions table
    console.log('\n📋 VENDOR_SUBSCRIPTIONS TABLE:');
    try {
      const subscriptionsResult = await client.query(`
        SELECT 
          id, vendor_id, plan_name, status, billing_cycle, 
          start_date, end_date, created_at, updated_at
        FROM vendor_subscriptions 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      if (subscriptionsResult.rows.length > 0) {
        console.log(`✅ Found ${subscriptionsResult.rows.length} vendor subscriptions:`);
        subscriptionsResult.rows.forEach((subscription, index) => {
          console.log(`\n${index + 1}. Subscription:`);
          console.log(`   ID: ${subscription.id}`);
          console.log(`   Vendor ID: ${subscription.vendor_id}`);
          console.log(`   Plan: ${subscription.plan_name}`);
          console.log(`   Status: ${subscription.status}`);
          console.log(`   Billing: ${subscription.billing_cycle}`);
          console.log(`   Period: ${subscription.start_date} to ${subscription.end_date}`);
          console.log(`   Created: ${subscription.created_at}`);
        });
      } else {
        console.log('❌ No vendor subscriptions found');
      }
    } catch (error) {
      console.log('❌ Error querying vendor_subscriptions:', error.message);
    }

    // Check users table
    console.log('\n📋 USERS TABLE:');
    try {
      const usersResult = await client.query(`
        SELECT 
          id, email, user_type, first_name, last_name,
          phone, address, avatar_url, profile_image,
          created_at, updated_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      if (usersResult.rows.length > 0) {
        console.log(`✅ Found ${usersResult.rows.length} users:`);
        usersResult.rows.forEach((user, index) => {
          console.log(`\n${index + 1}. User:`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Type: ${user.user_type}`);
          console.log(`   Name: ${user.first_name} ${user.last_name}`);
          console.log(`   Phone: ${user.phone || 'N/A'}`);
          console.log(`   Address: ${user.address || 'N/A'}`);
          console.log(`   Avatar: ${user.avatar_url || 'N/A'}`);
          console.log(`   Profile Image: ${user.profile_image || 'N/A'}`);
          console.log(`   Created: ${user.created_at}`);
        });
      } else {
        console.log('❌ No users found');
      }
    } catch (error) {
      console.log('❌ Error querying users:', error.message);
    }

    // Check relationships between tables
    console.log('\n🔗 TABLE RELATIONSHIPS:');
    try {
      const relationshipResult = await client.query(`
        SELECT 
          u.id as user_id,
          u.email,
          u.user_type,
          u.first_name,
          u.last_name,
          vp.id as profile_id,
          vp.business_name,
          vp.business_type,
          vs.id as subscription_id,
          vs.plan_name,
          vs.status as subscription_status
        FROM users u
        LEFT JOIN vendor_profiles vp ON u.id::text = vp.user_id
        LEFT JOIN vendor_subscriptions vs ON vp.user_id = vs.vendor_id
        WHERE u.user_type = 'vendor' OR vp.id IS NOT NULL
        ORDER BY u.created_at DESC
        LIMIT 10
      `);
      
      if (relationshipResult.rows.length > 0) {
        console.log(`✅ Found ${relationshipResult.rows.length} user-vendor relationships:`);
        relationshipResult.rows.forEach((rel, index) => {
          console.log(`\n${index + 1}. Relationship:`);
          console.log(`   User: ${rel.first_name} ${rel.last_name} (${rel.email}) - Type: ${rel.user_type}`);
          console.log(`   Profile: ${rel.business_name || 'No profile'} (${rel.business_type || 'N/A'})`);
          console.log(`   Subscription: ${rel.plan_name || 'No subscription'} (${rel.subscription_status || 'N/A'})`);
        });
      } else {
        console.log('❌ No vendor relationships found');
      }
    } catch (error) {
      console.log('❌ Error checking relationships:', error.message);
    }

    // Check table schemas
    console.log('\n📊 TABLE SCHEMAS:');
    
    const tables = ['vendor_profiles', 'vendor_subscriptions', 'users'];
    for (const table of tables) {
      try {
        const schemaResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table]);
        
        console.log(`\n${table.toUpperCase()} Schema:`);
        schemaResult.rows.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
      } catch (error) {
        console.log(`❌ Error getting ${table} schema:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

checkAllTables();
