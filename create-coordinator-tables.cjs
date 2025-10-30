#!/usr/bin/env node

/**
 * Create Coordinator Tables Script
 * 
 * This script creates all necessary database tables for the Wedding Coordinator features
 * Run this script to set up the coordinator database schema in Neon PostgreSQL
 * 
 * Usage: node create-coordinator-tables.cjs
 */

require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createCoordinatorTables() {
  console.log('🚀 Starting Wedding Coordinator database setup...\n');

  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'create-coordinator-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL script loaded successfully');
    console.log('🔄 Executing database migrations...\n');

    // Execute SQL
    await pool.query(sql);

    console.log('✅ Database tables created successfully!\n');

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'coordinator_%' 
        OR table_name LIKE 'wedding_%'
      ORDER BY table_name
    `);

    console.log('📋 Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verify views were created
    const viewsResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
        AND (table_name LIKE 'coordinator_%' OR table_name LIKE 'wedding_%')
      ORDER BY table_name
    `);

    if (viewsResult.rows.length > 0) {
      console.log('\n📊 Views created:');
      viewsResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }

    // Verify indexes were created
    const indexesResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND (indexname LIKE 'idx_coordinator_%' OR indexname LIKE 'idx_wedding_%')
      ORDER BY indexname
    `);

    if (indexesResult.rows.length > 0) {
      console.log('\n🔍 Indexes created:');
      indexesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.indexname}`);
      });
    }

    console.log('\n✨ Wedding Coordinator database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add coordinator role to users table if not exists');
    console.log('   2. Create test coordinator account');
    console.log('   3. Test API endpoints with Postman/Insomnia');
    console.log('   4. Deploy backend to Render');
    console.log('   5. Connect frontend to backend API\n');

  } catch (error) {
    console.error('❌ Error creating coordinator tables:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
createCoordinatorTables();
