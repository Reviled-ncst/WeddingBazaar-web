#!/usr/bin/env node
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function findServicesTables() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%service%'
    ORDER BY table_name
  `;
  console.log('Service-related tables:', tables.map(t => t.table_name).join(', '));
}

findServicesTables().catch(console.error);
