const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// GET /api/debug/schema - Check database schema
router.get('/schema', async (req, res) => {
  console.log('🔍 [DEBUG] GET /api/debug/schema called');
  
  try {
    // Get all table names
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log(`✅ [DEBUG] Found ${tables.length} tables`);
    
    const schema = {};
    
    // For each table, get its columns
    for (const table of tables) {
      const tableName = table.table_name;
      
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position;
      `;
      
      schema[tableName] = {
        columns: columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default
        }))
      };
      
      // Get row count for each table
      try {
        const count = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
        schema[tableName].row_count = parseInt(count[0].count);
      } catch (error) {
        schema[tableName].row_count = 'Error counting rows';
      }
    }
    
    // Specifically check for reviews table
    const reviewsTableExists = tables.some(table => table.table_name === 'reviews');
    
    console.log('📊 [DEBUG] Reviews table exists:', reviewsTableExists);
    
    res.json({
      success: true,
      tables: tables.map(t => t.table_name),
      schema: schema,
      reviewsTableExists: reviewsTableExists,
      analysis: {
        totalTables: tables.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [DEBUG] Schema analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/debug/vendors-table - Check vendors table structure specifically
router.get('/vendors-table', async (req, res) => {
  console.log('🔍 [DEBUG] GET /api/debug/vendors-table called');
  
  try {
    // Get vendors table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vendors'
      ORDER BY ordinal_position;
    `;
    
    // Get sample vendor data
    const sampleVendors = await sql`
      SELECT id, business_name, rating, review_count, created_at
      FROM vendors 
      LIMIT 3;
    `;
    
    console.log(`✅ [DEBUG] Found ${columns.length} columns in vendors table`);
    console.log(`✅ [DEBUG] Found ${sampleVendors.length} sample vendors`);
    
    res.json({
      success: true,
      vendors_table: {
        columns: columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default
        })),
        sample_data: sampleVendors,
        analysis: {
          has_review_count_column: columns.some(col => col.column_name === 'review_count'),
          has_rating_column: columns.some(col => col.column_name === 'rating'),
          timestamp: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [DEBUG] Vendors table analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
