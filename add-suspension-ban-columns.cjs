/**
 * Database Migration: Add User Suspension and Ban System
 * 
 * This script adds columns to the users table to support:
 * - Temporary suspensions with duration and reason
 * - Permanent bans with reason and timestamp
 * - Optional history tracking tables
 * 
 * Run this before using the suspension/ban features
 */

const { sql } = require('./backend-deploy/config/database.cjs');

async function addSuspensionAndBanColumns() {
  console.log('🔧 Starting user suspension and ban system migration...\n');
  
  try {
    // Step 1: Check if columns already exist
    console.log('📋 Step 1: Checking existing schema...');
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('suspension_end', 'suspension_reason', 'ban_reason', 'banned_at', 'account_status')
    `;
    
    const existingColumnNames = existingColumns.map(c => c.column_name);
    console.log('   Existing columns:', existingColumnNames.length > 0 ? existingColumnNames : 'None');
    
    // Step 2: Add account_status column if it doesn't exist
    if (!existingColumnNames.includes('account_status')) {
      console.log('\n📝 Step 2: Adding account_status column...');
      await sql`
        ALTER TABLE users 
        ADD COLUMN account_status VARCHAR(20) DEFAULT 'active' 
        CHECK (account_status IN ('active', 'inactive', 'suspended', 'banned'))
      `;
      console.log('   ✅ account_status column added');
    } else {
      console.log('\n✓ Step 2: account_status column already exists');
    }
    
    // Step 3: Add suspension columns
    if (!existingColumnNames.includes('suspension_end')) {
      console.log('\n📝 Step 3: Adding suspension_end column...');
      await sql`ALTER TABLE users ADD COLUMN suspension_end TIMESTAMP`;
      console.log('   ✅ suspension_end column added');
    } else {
      console.log('\n✓ Step 3: suspension_end column already exists');
    }
    
    if (!existingColumnNames.includes('suspension_reason')) {
      console.log('\n📝 Step 4: Adding suspension_reason column...');
      await sql`ALTER TABLE users ADD COLUMN suspension_reason TEXT`;
      console.log('   ✅ suspension_reason column added');
    } else {
      console.log('\n✓ Step 4: suspension_reason column already exists');
    }
    
    // Step 5: Add ban columns
    if (!existingColumnNames.includes('ban_reason')) {
      console.log('\n📝 Step 5: Adding ban_reason column...');
      await sql`ALTER TABLE users ADD COLUMN ban_reason TEXT`;
      console.log('   ✅ ban_reason column added');
    } else {
      console.log('\n✓ Step 5: ban_reason column already exists');
    }
    
    if (!existingColumnNames.includes('banned_at')) {
      console.log('\n📝 Step 6: Adding banned_at column...');
      await sql`ALTER TABLE users ADD COLUMN banned_at TIMESTAMP`;
      console.log('   ✅ banned_at column added');
    } else {
      console.log('\n✓ Step 6: banned_at column already exists');
    }
    
    // Step 7: Create suspension history table (optional, fail gracefully)
    console.log('\n📝 Step 7: Creating user_suspensions history table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_suspensions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          reason TEXT NOT NULL,
          suspension_end TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          removed_at TIMESTAMP
        )
      `;
      console.log('   ✅ user_suspensions table created');
    } catch (tableError) {
      console.log('   ⚠️  user_suspensions table creation failed (may already exist)');
    }
    
    // Step 8: Create ban history table (optional, fail gracefully)
    console.log('\n📝 Step 8: Creating user_bans history table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_bans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          ban_reason TEXT NOT NULL,
          banned_at TIMESTAMP DEFAULT NOW(),
          unbanned_at TIMESTAMP
        )
      `;
      console.log('   ✅ user_bans table created');
    } catch (tableError) {
      console.log('   ⚠️  user_bans table creation failed (may already exist)');
    }
    
    // Step 9: Migrate existing data
    console.log('\n📝 Step 9: Migrating existing users to new schema...');
    const updateResult = await sql`
      UPDATE users 
      SET account_status = COALESCE(account_status, 'active')
      WHERE account_status IS NULL
    `;
    console.log(`   ✅ Updated ${updateResult.count || 0} users with default active status`);
    
    // Step 10: Verify installation
    console.log('\n📊 Step 10: Verifying installation...');
    const finalColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('account_status', 'suspension_end', 'suspension_reason', 'ban_reason', 'banned_at')
      ORDER BY ordinal_position
    `;
    
    console.log('\n✅ Installation complete! Added columns:');
    console.table(finalColumns);
    
    // Summary
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    const suspended = await sql`SELECT COUNT(*) as count FROM users WHERE account_status = 'suspended'`;
    const banned = await sql`SELECT COUNT(*) as count FROM users WHERE account_status = 'banned'`;
    
    console.log('\n📈 Current Statistics:');
    console.log(`   Total Users: ${users[0].count}`);
    console.log(`   Suspended: ${suspended[0].count}`);
    console.log(`   Banned: ${banned[0].count}`);
    
    console.log('\n✨ Migration completed successfully!');
    console.log('   You can now use the suspension and ban features.\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('   Error details:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run migration
addSuspensionAndBanColumns();
