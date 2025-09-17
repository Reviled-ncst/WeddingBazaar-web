const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndCreateUser() {
  try {
    console.log('🔍 Searching for couple1@gmail.com...');
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['couple1@gmail.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Found user:', result.rows[0]);
    } else {
      console.log('❌ User couple1@gmail.com not found in database');
      console.log('🔧 Creating this user...');
      
      // Create the user with bcrypt hash for "password123"
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const insertResult = await pool.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, user_type, is_verified, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        ['1-2025-001', 'couple1@gmail.com', hashedPassword, 'Couple', 'One', 'couple', true, new Date()]
      );
      
      console.log('✅ Created user:', insertResult.rows[0]);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndCreateUser();
