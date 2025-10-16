const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUserSchema() {
  try {
    console.log('🔍 Checking user table structure...');
    
    // Check users table structure
    const userColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n👤 Users Table Structure:');
    userColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if there's a role column or separate admin table
    const roleColumn = userColumns.find(col => col.column_name === 'role' || col.column_name === 'user_type');
    
    if (roleColumn) {
      console.log(`\n✅ Found role column: ${roleColumn.column_name}`);
      
      // Check existing users and their roles
      const users = await sql`SELECT id, email, first_name, last_name, ${roleColumn.column_name} FROM users LIMIT 10`;
      console.log('\n📋 Existing Users:');
      users.forEach(user => {
        console.log(`  ${user.email} - ${user[roleColumn.column_name]} (${user.first_name} ${user.last_name})`);
      });
    } else {
      console.log('\n⚠️ No role column found. Checking for admin-related tables...');
      
      // Check for admin-related tables
      const adminTables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%admin%';
      `;
      
      console.log('Admin-related tables:', adminTables);
    }
    
    // Check auth table if it exists
    try {
      const authColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns
        WHERE table_name = 'auth'
        ORDER BY ordinal_position;
      `;
      
      console.log('\n🔐 Auth Table Structure:');
      authColumns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    } catch (error) {
      console.log('\n⚠️ No auth table found');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
}

checkUserSchema();
