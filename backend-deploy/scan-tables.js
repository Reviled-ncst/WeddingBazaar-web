import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL);

async function scanAllTables() {
  try {
    console.log('🔍 Scanning entire database...\n');

    // Get all table names
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log(`📊 Found ${tables.length} tables in database:\n`);

    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n�️  TABLE: ${tableName.toUpperCase()}`);
      console.log('=' .repeat(60));

      // Get column information
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = ${tableName} 
          AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      console.log('\n📝 SCHEMA:');
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        let dataType = col.data_type;
        
        if (col.character_maximum_length) {
          dataType += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision) {
          dataType += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
        }
        
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  • ${col.column_name.padEnd(25)} ${dataType.padEnd(20)} ${nullable}${defaultVal}`);
      });

      // Get row count first
      try {
        const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
        const countResult = await sql(countQuery);
        const rowCount = parseInt(countResult[0].count);
        console.log(`\n📊 TOTAL ROWS: ${rowCount}`);

        if (rowCount > 0) {
          // Get sample data (first 3 rows)
          const sampleQuery = `SELECT * FROM "${tableName}" LIMIT 3`;
          const sampleData = await sql(sampleQuery);
          
          console.log('\n📄 SAMPLE DATA:');
          sampleData.forEach((row, index) => {
            console.log(`\n  📌 Row ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
              let displayValue = value;
              if (value === null) {
                displayValue = '❌ NULL';
              } else if (typeof value === 'string') {
                if (value.length > 150) {
                  displayValue = value.substring(0, 150) + '...';
                } else {
                  displayValue = `"${value}"`;
                }
              } else if (Array.isArray(value)) {
                displayValue = `[Array: ${value.length} items] ${JSON.stringify(value).substring(0, 100)}${JSON.stringify(value).length > 100 ? '...' : ''}`;
              } else if (typeof value === 'object' && value !== null) {
                const jsonStr = JSON.stringify(value);
                displayValue = `{Object} ${jsonStr.substring(0, 100)}${jsonStr.length > 100 ? '...' : ''}`;
              } else if (typeof value === 'boolean') {
                displayValue = value ? '✅ true' : '❌ false';
              } else {
                displayValue = value;
              }
              console.log(`    ${key.padEnd(20)}: ${displayValue}`);
            });
          });

          // Get unique values for key columns (if table has common ID patterns)
          if (columns.some(col => col.column_name === 'id')) {
            try {
              const idsQuery = `SELECT DISTINCT id FROM "${tableName}" ORDER BY id LIMIT 10`;
              const uniqueIds = await sql(idsQuery);
              if (uniqueIds.length > 0) {
                console.log(`\n🆔 SAMPLE IDs: ${uniqueIds.map(r => r.id).join(', ')}${uniqueIds.length === 10 ? '...' : ''}`);
              }
            } catch (idError) {
              // Ignore ID query errors
            }
          }

        } else {
          console.log('\n📄 SAMPLE DATA: (empty table)');
        }

      } catch (sampleError) {
        console.log(`\n❌ Error getting data: ${sampleError.message}`);
      }

      console.log('\n' + '─'.repeat(80));
    }

    // Get database-wide statistics
    console.log('\n\n📈 DATABASE SUMMARY:');
    console.log('═'.repeat(40));
    
    let totalRows = 0;
    for (const table of tables) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM "${table.table_name}"`;
        const countResult = await sql(countQuery);
        const count = parseInt(countResult[0].count);
        totalRows += count;
        console.log(`${table.table_name.padEnd(25)}: ${count.toLocaleString()} rows`);
      } catch (e) {
        console.log(`${table.table_name.padEnd(25)}: Error counting rows`);
      }
    }
    
    console.log(`${'─'.repeat(35)}`);
    console.log(`${'TOTAL'.padEnd(25)}: ${totalRows.toLocaleString()} rows`);
    console.log('\n✅ Complete database scan finished!');

  } catch (error) {
    console.error('❌ Error scanning database:', error);
    console.error('Stack trace:', error.stack);
  }
}

scanAllTables();
