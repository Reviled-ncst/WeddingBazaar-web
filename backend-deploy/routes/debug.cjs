const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Debug endpoint to check users
router.get('/users', async (req, res) => {
  try {
    const users = await sql`SELECT id, email, user_type, created_at FROM users ORDER BY created_at`;
    res.json({
      success: true,
      users: users,
      count: users.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check database tables
router.get('/tables', async (req, res) => {
  try {
    const tables = await sql`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tableStats = {};
    
    // Get row counts for each table
    for (const table of tables) {
      try {
        const count = await sql(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        tableStats[table.table_name] = {
          columns: table.column_count,
          rows: count[0].count
        };
      } catch (error) {
        tableStats[table.table_name] = {
          columns: table.column_count,
          rows: 'Error counting rows'
        };
      }
    }
    
    res.json({
      success: true,
      tables: tableStats,
      totalTables: tables.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check specific table schema
router.get('/schema/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `;
    
    if (columns.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Table '${tableName}' not found`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Get row count
    const count = await sql(`SELECT COUNT(*) as count FROM ${tableName}`);
    
    res.json({
      success: true,
      table: tableName,
      columns: columns,
      rowCount: count[0].count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for sample data from any table
router.get('/sample/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit = 5 } = req.query;
    
    const data = await sql(`SELECT * FROM ${tableName} LIMIT ${parseInt(limit)}`);
    
    res.json({
      success: true,
      table: tableName,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
