#!/usr/bin/env node

/**
 * Seed Coordinator Data Script
 * 
 * This script populates the coordinator tables with realistic sample data
 * Run this AFTER running create-coordinator-tables.cjs
 * 
 * Usage: node seed-coordinator-data.cjs
 */

require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seedCoordinatorData() {
  console.log('🌱 Starting Wedding Coordinator data seeding...\n');

  try {
    // Step 1: Create test coordinator user
    console.log('👤 Creating test coordinator user...');
    
    // Generate unique IDs (max 20 chars)
    const timestamp = Date.now().toString().slice(-8);
    const coordId1 = `COORD-${timestamp}-1`;
    const coordId2 = `COORD-${timestamp}-2`;
    
    const coordinatorResult = await pool.query(`
      INSERT INTO users (id, email, password, first_name, last_name, user_type, role, phone, email_verified)
      VALUES 
        ($1, 'coordinator@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Sarah', 'Martinez', 'coordinator', 'coordinator', '+1-555-0100', true),
        ($2, 'coordinator2@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Michael', 'Chen', 'coordinator', 'coordinator', '+1-555-0101', true)
      ON CONFLICT (email) DO UPDATE 
      SET role = EXCLUDED.role, user_type = EXCLUDED.user_type, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name
      RETURNING id, email, first_name, last_name
    `, [coordId1, coordId2]);

    console.log(`   ✓ Created ${coordinatorResult.rows.length} coordinator users`);
    coordinatorResult.rows.forEach(row => {
      console.log(`     - ${row.first_name} ${row.last_name} (${row.email})`);
    });

    const coordinatorId1 = coordinatorResult.rows[0].id;
    const coordinatorId2 = coordinatorResult.rows[1]?.id || coordinatorId1;

    // Step 2: Create wedding clients
    console.log('\n💑 Creating wedding clients...');
    
    // Generate unique IDs for clients (max 20 chars)
    const clientIds = Array.from({ length: 6 }, (_, i) => `CLI-${timestamp}-${i + 1}`);
    
    const clientResult = await pool.query(`
      INSERT INTO users (id, email, password, first_name, last_name, user_type, role, phone, email_verified)
      VALUES 
        ($1, 'sarah.johnson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Sarah', 'Johnson', 'couple', 'couple', '+1-555-0201', true),
        ($2, 'james.wilson@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'James', 'Wilson', 'couple', 'couple', '+1-555-0202', true),
        ($3, 'emily.chen@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Emily', 'Chen', 'couple', 'couple', '+1-555-0203', true),
        ($4, 'david.brown@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'David', 'Brown', 'couple', 'couple', '+1-555-0204', true),
        ($5, 'sophia.garcia@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Sophia', 'Garcia', 'couple', 'couple', '+1-555-0205', true),
        ($6, 'oliver.martinez@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Oliver', 'Martinez', 'couple', 'couple', '+1-555-0206', true)
      ON CONFLICT (email) DO UPDATE 
      SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, user_type = EXCLUDED.user_type
      RETURNING id, email, first_name, last_name
    `, clientIds);

    console.log(`   ✓ Created ${clientResult.rows.length} wedding clients`);

    // Step 3: Create weddings
    console.log('\n💒 Creating weddings...');
    
    const weddingsData = [
      {
        coordinator_id: coordinatorId1,
        client_user_id: clientResult.rows[0].id,
        couple_name: 'Sarah & James',
        partner1_name: 'Sarah Johnson',
        partner2_name: 'James Wilson',
        wedding_date: '2025-12-15',
        venue_name: 'Garden Manor Estate',
        venue_address: '123 Rose Garden Lane, Beverly Hills, CA 90210',
        guest_count: 150,
        budget: 75000.00,
        status: 'planning',
        contact_email: 'sarah.johnson@email.com',
        contact_phone: '+1-555-0201',
        wedding_style: 'Garden/Outdoor',
        color_theme: 'Blush Pink & Gold'
      },
      {
        coordinator_id: coordinatorId1,
        client_user_id: clientResult.rows[2].id,
        couple_name: 'Emily & David',
        partner1_name: 'Emily Chen',
        partner2_name: 'David Brown',
        wedding_date: '2026-03-20',
        venue_name: 'Oceanview Resort',
        venue_address: '456 Coastal Drive, Malibu, CA 90265',
        guest_count: 120,
        budget: 60000.00,
        status: 'planning',
        contact_email: 'emily.chen@email.com',
        contact_phone: '+1-555-0203',
        wedding_style: 'Beach/Coastal',
        color_theme: 'Navy Blue & White'
      },
      {
        coordinator_id: coordinatorId2,
        client_user_id: clientResult.rows[4].id,
        couple_name: 'Sophia & Oliver',
        partner1_name: 'Sophia Garcia',
        partner2_name: 'Oliver Martinez',
        wedding_date: '2026-06-10',
        venue_name: 'Historic Ballroom',
        venue_address: '789 Grand Avenue, Downtown LA, CA 90012',
        guest_count: 200,
        budget: 95000.00,
        status: 'confirmed',
        contact_email: 'sophia.garcia@email.com',
        contact_phone: '+1-555-0205',
        wedding_style: 'Classic/Elegant',
        color_theme: 'Burgundy & Champagne'
      },
      {
        coordinator_id: coordinatorId1,
        client_user_id: clientResult.rows[0].id,
        couple_name: 'Amanda & Michael',
        partner1_name: 'Amanda Smith',
        partner2_name: 'Michael Davis',
        wedding_date: '2025-09-25',
        venue_name: 'Rustic Barn Venue',
        venue_address: '321 Country Road, Napa Valley, CA 94558',
        guest_count: 100,
        budget: 50000.00,
        status: 'completed',
        contact_email: 'amanda.smith@email.com',
        contact_phone: '+1-555-0207',
        wedding_style: 'Rustic/Country',
        color_theme: 'Sage Green & Ivory'
      },
      {
        coordinator_id: coordinatorId2,
        client_user_id: clientResult.rows[2].id,
        couple_name: 'Jessica & Ryan',
        partner1_name: 'Jessica Lee',
        partner2_name: 'Ryan Taylor',
        wedding_date: '2026-01-15',
        venue_name: 'Modern Loft Space',
        venue_address: '555 Industrial Blvd, Brooklyn, NY 11201',
        guest_count: 80,
        budget: 45000.00,
        status: 'on-hold',
        contact_email: 'jessica.lee@email.com',
        contact_phone: '+1-555-0208',
        wedding_style: 'Modern/Industrial',
        color_theme: 'Black & Gold'
      }
    ];

    for (const wedding of weddingsData) {
      await pool.query(`
        INSERT INTO weddings (
          coordinator_id, client_user_id, couple_name, partner1_name, partner2_name,
          wedding_date, venue_name, venue_address, guest_count, budget, status,
          contact_email, contact_phone, wedding_style, color_theme
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        wedding.coordinator_id, wedding.client_user_id, wedding.couple_name,
        wedding.partner1_name, wedding.partner2_name, wedding.wedding_date,
        wedding.venue_name, wedding.venue_address, wedding.guest_count,
        wedding.budget, wedding.status, wedding.contact_email,
        wedding.contact_phone, wedding.wedding_style, wedding.color_theme
      ]);
    }

    console.log(`   ✓ Created ${weddingsData.length} weddings`);

    // Get wedding IDs for further seeding
    const weddingsResult = await pool.query(`
      SELECT id, couple_name FROM weddings ORDER BY created_at DESC LIMIT 5
    `);

    // Step 4: Create coordinator vendors
    console.log('\n🎨 Creating coordinator vendors...');
    
    const vendorsData = [
      {
        coordinator_id: coordinatorId1,
        business_name: 'Perfect Moments Photography',
        category: 'Photography',
        contact_name: 'Alex Rodriguez',
        contact_email: 'alex@perfectmoments.com',
        contact_phone: '+1-555-0301',
        rating: 4.9,
        specialty: 'Wedding & Event Photography',
        status: 'active'
      },
      {
        coordinator_id: coordinatorId1,
        business_name: 'Elegance Catering Co.',
        category: 'Catering',
        contact_name: 'Maria Lopez',
        contact_email: 'maria@elegancecatering.com',
        contact_phone: '+1-555-0302',
        rating: 4.8,
        specialty: 'Fine Dining & Custom Menus',
        status: 'active'
      },
      {
        coordinator_id: coordinatorId2,
        business_name: 'Blooms & Petals',
        category: 'Florals',
        contact_name: 'Sophie Anderson',
        contact_email: 'sophie@bloomsandpetals.com',
        contact_phone: '+1-555-0303',
        rating: 4.7,
        specialty: 'Floral Design & Arrangements',
        status: 'active'
      },
      {
        coordinator_id: coordinatorId1,
        business_name: 'Classic Sounds DJ',
        category: 'DJ/Music',
        contact_name: 'Chris Thompson',
        contact_email: 'chris@classicsounds.com',
        contact_phone: '+1-555-0304',
        rating: 4.6,
        specialty: 'Wedding Entertainment',
        status: 'active'
      },
      {
        coordinator_id: coordinatorId2,
        business_name: 'Sweet Dreams Bakery',
        category: 'Bakery',
        contact_name: 'Emma Wilson',
        contact_email: 'emma@sweetdreamsbakery.com',
        contact_phone: '+1-555-0305',
        rating: 4.9,
        specialty: 'Custom Wedding Cakes',
        status: 'active'
      },
      {
        coordinator_id: coordinatorId1,
        business_name: 'Luxe Rentals',
        category: 'Rentals',
        contact_name: 'David Kim',
        contact_email: 'david@luxerentals.com',
        contact_phone: '+1-555-0306',
        rating: 4.5,
        specialty: 'Event Furniture & Decor',
        status: 'active'
      }
    ];

    for (const vendor of vendorsData) {
      await pool.query(`
        INSERT INTO coordinator_vendors (
          coordinator_id, business_name, category, contact_name, contact_email,
          contact_phone, rating, specialty, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        vendor.coordinator_id, vendor.business_name, vendor.category,
        vendor.contact_name, vendor.contact_email, vendor.contact_phone,
        vendor.rating, vendor.specialty, vendor.status
      ]);
    }

    console.log(`   ✓ Created ${vendorsData.length} coordinator vendors`);

    // Step 5: Create coordinator clients
    console.log('\n👥 Creating coordinator clients...');
    
    const coordinatorClientsData = [
      {
        coordinator_id: coordinatorId1,
        user_id: clientResult.rows[0].id,
        wedding_id: weddingsResult.rows[0].id,
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0201',
        wedding_date: '2025-12-15',
        status: 'active',
        budget_range: '$50k - $100k',
        preferred_style: 'Garden/Outdoor'
      },
      {
        coordinator_id: coordinatorId1,
        user_id: clientResult.rows[2].id,
        wedding_id: weddingsResult.rows[1].id,
        full_name: 'Emily Chen',
        email: 'emily.chen@email.com',
        phone: '+1-555-0203',
        wedding_date: '2026-03-20',
        status: 'active',
        budget_range: '$50k - $100k',
        preferred_style: 'Beach/Coastal'
      },
      {
        coordinator_id: coordinatorId2,
        user_id: clientResult.rows[4].id,
        wedding_id: weddingsResult.rows[2].id,
        full_name: 'Sophia Garcia',
        email: 'sophia.garcia@email.com',
        phone: '+1-555-0205',
        wedding_date: '2026-06-10',
        status: 'active',
        budget_range: '$75k - $150k',
        preferred_style: 'Classic/Elegant'
      }
    ];

    for (const client of coordinatorClientsData) {
      await pool.query(`
        INSERT INTO coordinator_clients (
          coordinator_id, user_id, wedding_id, full_name, email, phone,
          wedding_date, status, budget_range, preferred_style
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        client.coordinator_id, client.user_id, client.wedding_id,
        client.full_name, client.email, client.phone, client.wedding_date,
        client.status, client.budget_range, client.preferred_style
      ]);
    }

    console.log(`   ✓ Created ${coordinatorClientsData.length} coordinator clients`);

    // Step 6: Create wedding tasks
    console.log('\n✅ Creating wedding tasks...');
    
    const tasksData = [
      {
        wedding_id: weddingsResult.rows[0].id,
        task_name: 'Send Save the Dates',
        description: 'Design and send save-the-date cards to all guests',
        due_date: '2025-09-15',
        category: 'invitations',
        priority: 'high',
        status: 'completed'
      },
      {
        wedding_id: weddingsResult.rows[0].id,
        task_name: 'Book Photographer',
        description: 'Finalize contract with Perfect Moments Photography',
        due_date: '2025-10-01',
        category: 'vendors',
        priority: 'high',
        status: 'completed'
      },
      {
        wedding_id: weddingsResult.rows[0].id,
        task_name: 'Finalize Guest List',
        description: 'Confirm final headcount for catering',
        due_date: '2025-11-15',
        category: 'planning',
        priority: 'high',
        status: 'in-progress'
      },
      {
        wedding_id: weddingsResult.rows[1].id,
        task_name: 'Venue Site Visit',
        description: 'Schedule walkthrough of Oceanview Resort',
        due_date: '2025-11-30',
        category: 'venue',
        priority: 'high',
        status: 'pending'
      },
      {
        wedding_id: weddingsResult.rows[1].id,
        task_name: 'Cake Tasting',
        description: 'Schedule tasting with Sweet Dreams Bakery',
        due_date: '2025-12-10',
        category: 'catering',
        priority: 'medium',
        status: 'pending'
      }
    ];

    for (const task of tasksData) {
      await pool.query(`
        INSERT INTO wedding_tasks (
          wedding_id, task_name, description, due_date, category, priority, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        task.wedding_id, task.task_name, task.description,
        task.due_date, task.category, task.priority, task.status
      ]);
    }

    console.log(`   ✓ Created ${tasksData.length} wedding tasks`);

    // Step 7: Summary
    console.log('\n📊 Data Seeding Summary:');
    
    const summaryQueries = [
      { table: 'users (coordinators)', query: "SELECT COUNT(*) FROM users WHERE role = 'coordinator'" },
      { table: 'weddings', query: 'SELECT COUNT(*) FROM weddings' },
      { table: 'coordinator_vendors', query: 'SELECT COUNT(*) FROM coordinator_vendors' },
      { table: 'coordinator_clients', query: 'SELECT COUNT(*) FROM coordinator_clients' },
      { table: 'wedding_tasks', query: 'SELECT COUNT(*) FROM wedding_tasks' }
    ];

    for (const summary of summaryQueries) {
      const result = await pool.query(summary.query);
      console.log(`   ✓ ${result.rows[0].count} ${summary.table}`);
    }

    console.log('\n✨ Wedding Coordinator data seeding complete!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: coordinator@test.com');
    console.log('   Password: password123 (use bcrypt to hash)');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Test login with coordinator@test.com');
    console.log('   2. Verify data in Neon SQL Console');
    console.log('   3. Test API endpoints');
    console.log('   4. Connect frontend to backend\n');

  } catch (error) {
    console.error('❌ Error seeding coordinator data:', error);
    console.error('\nDetails:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
seedCoordinatorData();
