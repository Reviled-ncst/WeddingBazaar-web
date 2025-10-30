#!/usr/bin/env node

/**
 * Add Coordinator Role to Users Table
 * 
 * This script ensures the users table supports the 'coordinator' role
 * and creates a test coordinator account
 * 
 * Usage: node add-coordinator-role.cjs
 */

require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addCoordinatorRole() {
  console.log('🚀 Adding coordinator role support...\n');

  try {
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Users table does not exist! Please create it first.');
      process.exit(1);
    }

    console.log('✅ Users table exists');

    // Check and update user_type constraint to include 'coordinator'
    console.log('\n📝 Checking user_type constraint...');
    
    try {
      await pool.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
        ALTER TABLE users ADD CONSTRAINT users_user_type_check 
        CHECK (user_type IN ('couple', 'vendor', 'admin', 'coordinator'));
      `);
      console.log('✅ User type constraint updated to include coordinator');
    } catch (error) {
      console.log('⚠️  Could not update constraint:', error.message);
    }

    // Check if role column exists
    const columnCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'role';
    `);

    if (columnCheck.rows.length === 0) {
      console.log('📝 Adding role column to users table...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'individual';
      `);
      console.log('✅ Role column added');
    } else {
      console.log('✅ Role column already exists');
    }

    // Check if a coordinator account already exists
    const existingCoordinator = await pool.query(`
      SELECT email FROM users WHERE role = 'coordinator' LIMIT 1;
    `);

    if (existingCoordinator.rows.length > 0) {
      console.log(`\n✅ Coordinator account already exists: ${existingCoordinator.rows[0].email}`);
      console.log('   No new test account created.\n');
      return;
    }

    // Create test coordinator account
    console.log('\n📝 Creating test coordinator account...');
    
    const testEmail = 'coordinator@test.com';
    const testPassword = 'coordinator123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    // Generate a shorter ID (max 20 chars) - using timestamp + random
    const userId = `coord-${Date.now().toString(36)}`.substring(0, 20);

    const result = await pool.query(`
      INSERT INTO users (id, email, password, first_name, last_name, user_type, role, email_verified, phone_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE 
      SET role = $7, user_type = $6, updated_at = NOW()
      RETURNING id, email, first_name, last_name, role, user_type;
    `, [userId, testEmail, hashedPassword, 'Test', 'Coordinator', 'coordinator', 'coordinator', true, false]);

    console.log('✅ Test coordinator account created!\n');
    console.log('📧 Email: coordinator@test.com');
    console.log('🔑 Password: coordinator123');
    console.log(`🆔 User ID: ${result.rows[0].id}`);
    console.log(`👤 Name: ${result.rows[0].first_name} ${result.rows[0].last_name}\n`);

    // Verify coordinator role is available
    const roleCheck = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      WHERE role IN ('individual', 'vendor', 'admin', 'coordinator')
      GROUP BY role
      ORDER BY role;
    `);

    console.log('📊 Current user role distribution:');
    roleCheck.rows.forEach(row => {
      console.log(`   - ${row.role}: ${row.count} user(s)`);
    });

    console.log('\n✨ Coordinator role setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node create-coordinator-tables.cjs');
    console.log('   2. Login as coordinator@test.com');
    console.log('   3. Test coordinator dashboard at /coordinator');
    console.log('   4. Deploy backend to Render\n');

  } catch (error) {
    console.error('❌ Error adding coordinator role:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
addCoordinatorRole();
