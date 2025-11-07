#!/usr/bin/env node
/**
 * 🎯 Add Tier Column to Service Packages
 * 
 * This script adds the 'tier' column to the service_packages table
 * to support package-level tier selection (basic, standard, premium)
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addTierColumn() {
  console.log('🔧 [Migration] Adding tier column to service_packages...\n');

  try {
    // Step 1: Check if column already exists
    console.log('1️⃣ Checking if tier column exists...');
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'service_packages' 
      AND column_name = 'tier'
    `;

    if (checkColumn.length > 0) {
      console.log('✅ Tier column already exists! Skipping creation.\n');
      return;
    }

    // Step 2: Add tier column
    console.log('2️⃣ Adding tier column...');
    await sql`
      ALTER TABLE service_packages 
      ADD COLUMN tier VARCHAR(20) CHECK (tier IN ('basic', 'standard', 'premium'))
    `;
    console.log('✅ Tier column added successfully!\n');

    // Step 3: Set default tier based on package names (if any exist)
    console.log('3️⃣ Setting default tier for existing packages...');
    const updateBasic = await sql`
      UPDATE service_packages 
      SET tier = 'basic'
      WHERE tier IS NULL 
      AND (
        LOWER(package_name) LIKE '%basic%' OR 
        LOWER(package_name) LIKE '%essential%' OR
        LOWER(package_name) LIKE '%starter%'
      )
    `;
    console.log(`   - Set ${updateBasic.length} packages to 'basic'`);

    const updatePremium = await sql`
      UPDATE service_packages 
      SET tier = 'premium'
      WHERE tier IS NULL 
      AND (
        LOWER(package_name) LIKE '%premium%' OR 
        LOWER(package_name) LIKE '%luxury%' OR
        LOWER(package_name) LIKE '%ultimate%' OR
        LOWER(package_name) LIKE '%deluxe%'
      )
    `;
    console.log(`   - Set ${updatePremium.length} packages to 'premium'`);

    const updateStandard = await sql`
      UPDATE service_packages 
      SET tier = 'standard'
      WHERE tier IS NULL
    `;
    console.log(`   - Set ${updateStandard.length} remaining packages to 'standard'\n`);

    // Step 4: Verify the changes
    console.log('4️⃣ Verifying tier distribution...');
    const tierCounts = await sql`
      SELECT 
        tier,
        COUNT(*) as count
      FROM service_packages
      GROUP BY tier
      ORDER BY 
        CASE tier
          WHEN 'basic' THEN 1
          WHEN 'standard' THEN 2
          WHEN 'premium' THEN 3
        END
    `;

    console.log('\n📊 Tier Distribution:');
    tierCounts.forEach(row => {
      const icon = row.tier === 'basic' ? '⚡' : row.tier === 'standard' ? '✨' : '💎';
      console.log(`   ${icon} ${row.tier}: ${row.count} packages`);
    });

    console.log('\n✅ [Migration] Complete! Tier column added successfully.\n');

  } catch (error) {
    console.error('❌ [Migration] Error:', error);
    throw error;
  }
}

// Run migration
addTierColumn()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
