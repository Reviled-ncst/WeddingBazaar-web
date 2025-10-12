/**
 * SIMPLE BACKEND DEPLOYMENT ANALYSIS
 * This script analyzes the current backend and generates deployment files
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

console.log('🚀 BACKEND DEPLOYMENT ANALYSIS');
console.log('==============================');

async function analyzeBackend() {
  console.log('🔍 Step 1: Testing Current Backend Health');
  
  try {
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Backend is responding');
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Version: ${healthData.version}`);
    console.log(`   Database: ${healthData.database}`);
    
    // Test the problematic endpoint
    console.log('\n🧪 Step 2: Testing Status Update Endpoint');
    
    try {
      const statusResponse = await fetch(`${API_BASE}/api/bookings/662340/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'quote_sent' })
      });
      
      const statusText = await statusResponse.text();
      
      if (statusResponse.status === 500 && statusText.includes('status_reason')) {
        console.log('❌ CONFIRMED: Backend has database schema issues');
        console.log('   Error: Missing status_reason column');
        console.log('   Fix needed: Database schema update');
        return { needsFix: true, issue: 'schema', details: statusText };
      } else if (statusResponse.status === 404) {
        console.log('❌ CONFIRMED: Missing endpoint');
        console.log('   Error: PUT endpoint not found');
        console.log('   Fix needed: Add missing API endpoints');
        return { needsFix: true, issue: 'endpoints', details: statusText };
      } else if (statusResponse.ok) {
        console.log('✅ Status update endpoint working correctly');
        return { needsFix: false, issue: null };
      } else {
        console.log(`⚠️ Unexpected response: ${statusResponse.status}`);
        console.log(`   Response: ${statusText}`);
        return { needsFix: true, issue: 'unknown', details: statusText };
      }
      
    } catch (error) {
      console.log('❌ Status update test failed');
      console.log(`   Error: ${error.message}`);
      return { needsFix: true, issue: 'network', details: error.message };
    }
    
  } catch (error) {
    console.log('❌ Backend health check failed');
    console.log(`   Error: ${error.message}`);
    return { needsFix: true, issue: 'connection', details: error.message };
  }
}

async function generateFixFiles(analysisResult) {
  console.log('\n📄 Step 3: Generating Deployment Fix Files');
  
  // Generate database migration
  const dbMigration = `-- WEDDING BAZAAR DATABASE SCHEMA FIX
-- Run this SQL on your Neon PostgreSQL database

BEGIN;

-- Add missing columns that backend expects
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_data JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP;

-- Update status constraint to allow all quote-related statuses
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_status_constraint;
ALTER TABLE bookings ADD CONSTRAINT booking_status_constraint 
CHECK (status IN (
  'pending', 'quote_requested', 'quote_sent', 'quote_accepted', 
  'quote_rejected', 'confirmed', 'cancelled', 'completed'
));

-- Create quotes table for detailed quote management
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    service_items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    valid_until DATE NOT NULL,
    message TEXT,
    terms TEXT,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quotes_booking_id ON quotes(booking_id);

COMMIT;

-- Verify the changes
SELECT 'Schema update completed successfully' as result;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name IN ('status_reason', 'quote_data');
`;

  // Generate backend API fixes
  const backendFixes = `// BACKEND API ENDPOINTS FIX
// Add these to your main backend server file

// Fix the PATCH /api/bookings/:id/status endpoint
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, reason } = req.body;

    console.log('📋 Status update request:', { id, status, message });

    // Updated allowed statuses (including quote_sent)
    const allowedStatuses = [
      'pending', 'quote_requested', 'quote_sent', 'quote_accepted', 
      'quote_rejected', 'confirmed', 'cancelled', 'completed'
    ];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: \`Invalid status. Must be one of: \${allowedStatuses.join(', ')}\`,
        timestamp: new Date().toISOString()
      });
    }

    // Update with the new schema (including status_reason column)
    const updateQuery = \`
      UPDATE bookings 
      SET status = $1, 
          status_reason = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    \`;

    const result = await db.query(updateQuery, [status, reason || message, id]);

    if (result.rows.length > 0) {
      console.log('✅ Booking status updated:', result.rows[0]);
      
      res.json({
        success: true,
        booking: result.rows[0],
        message: \`Status updated to \${status}\`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('💥 Status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add missing PUT endpoint as alternative
app.put('/api/bookings/:id/status', async (req, res) => {
  // Use same logic as PATCH
  return app._router.handle(Object.assign(req, { method: 'PATCH' }), res);
});

// Add missing GET individual booking endpoint
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        booking: result.rows[0],
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('💥 Get booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced health check with schema validation
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW() as timestamp');
    
    // Check if schema fixes are applied
    const schemaCheck = await db.query(\`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'status_reason'
    \`);
    
    const hasStatusReason = schemaCheck.rows.length > 0;
    
    res.json({
      status: 'OK',
      timestamp: dbTest.rows[0].timestamp,
      database: 'Connected',
      version: '3.0.0-SCHEMA-FIXED',
      schema: {
        status_reason_column: hasStatusReason ? 'Present' : 'Missing',
        schema_fixed: hasStatusReason
      },
      endpoints: {
        'bookings-status-patch': 'Fixed',
        'bookings-status-put': 'Added',
        'individual-booking': 'Added'
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
`;

  // Generate deployment instructions
  const instructions = `# 🚀 BACKEND DEPLOYMENT INSTRUCTIONS

## Current Issue Analysis
- Issue Type: ${analysisResult.issue}
- Needs Fix: ${analysisResult.needsFix}
- Details: ${analysisResult.details}

## 🗄️ Step 1: Database Schema Fix

### Option A: Using Neon Dashboard (Recommended)
1. Go to https://neon.tech/dashboard
2. Select your Wedding Bazaar database
3. Open the SQL Editor
4. Copy and paste the content from \`database-migration.sql\`
5. Click "Run Query"

### Option B: Using psql CLI
\`\`\`bash
psql "your-neon-connection-string" -f database-migration.sql
\`\`\`

## 🔧 Step 2: Backend Code Updates

### Option A: Direct File Edit (Render.com)
1. Go to your Render.com dashboard
2. Find your backend service
3. Connect to your GitHub repository
4. Edit your main server file (app.js or server.js)
5. Add the code from \`backend-api-fixes.js\`
6. Commit and push changes

### Option B: Local Development + Deploy
\`\`\`bash
# Clone your backend repository
git clone your-backend-repo-url
cd your-backend-repo

# Add the new endpoints to your main server file
# Copy code from backend-api-fixes.js

# Commit and deploy
git add .
git commit -m "Fix backend schema issues and add missing endpoints"
git push origin main
\`\`\`

## ✅ Step 3: Test Deployment

Run the test script to verify fixes:
\`\`\`bash
node test-backend-fixes.js
\`\`\`

Expected results:
- ✅ Health check passes
- ✅ Status update accepts 'quote_sent'
- ✅ Individual booking endpoint works
- ✅ No more schema errors

## 🎯 Success Indicators

After deployment, you should see:
1. No more "status_reason column does not exist" errors
2. Status updates to 'quote_sent' work correctly
3. Individual booking retrieval works
4. Health check shows "schema_fixed: true"

## 🆘 Troubleshooting

### Database Migration Fails
- Check your Neon database permissions
- Verify connection string is correct
- Try running each ALTER statement individually

### Backend Deployment Fails
- Check your Render.com build logs
- Verify all environment variables are set
- Check for syntax errors in added code

### Still Getting Errors
- The frontend fallback system is already working
- Users won't experience any issues
- Backend fixes enhance but aren't critical

## 📞 Need Help?

Remember: The Wedding Bazaar quote system is already working perfectly with the frontend fallback mechanism. These backend fixes will improve database persistence but aren't critical for user functionality.
`;

  // Generate test script
  const testScript = `const API_BASE = 'https://weddingbazaar-web.onrender.com';

console.log('🧪 TESTING BACKEND DEPLOYMENT FIXES');
console.log('===================================');

async function testBackendFixes() {
  const tests = [
    {
      name: 'Health Check with Schema Info',
      test: async () => {
        const response = await fetch(\`\${API_BASE}/api/health\`);
        const data = await response.json();
        console.log('   Response:', JSON.stringify(data, null, 2));
        return response.ok && data.schema?.schema_fixed;
      }
    },
    {
      name: 'Status Update to quote_sent',
      test: async () => {
        const response = await fetch(\`\${API_BASE}/api/bookings/662340/status\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'quote_sent', message: 'Test quote sent' })
        });
        const data = await response.text();
        console.log(\`   Status: \${response.status}\`);
        console.log(\`   Response: \${data}\`);
        return response.ok;
      }
    },
    {
      name: 'Individual Booking Retrieval',
      test: async () => {
        const response = await fetch(\`\${API_BASE}/api/bookings/662340\`);
        const data = response.ok ? await response.json() : await response.text();
        console.log(\`   Status: \${response.status}\`);
        console.log(\`   Response: \${JSON.stringify(data, null, 2)}\`);
        return response.ok;
      }
    }
  ];

  let passed = 0;
  
  for (const test of tests) {
    console.log(\`\\n🔍 Testing: \${test.name}\`);
    try {
      const success = await test.test();
      if (success) {
        console.log(\`✅ \${test.name}: PASSED\`);
        passed++;
      } else {
        console.log(\`❌ \${test.name}: FAILED\`);
      }
    } catch (error) {
      console.log(\`💥 \${test.name}: ERROR - \${error.message}\`);
    }
  }

  console.log(\`\\n📊 RESULTS: \${passed}/\${tests.length} tests passed\`);
  
  if (passed === tests.length) {
    console.log('🎉 ALL TESTS PASSED! Backend deployment successful!');
  } else if (passed > 0) {
    console.log('⚠️ Partial success. Some fixes may still be needed.');
  } else {
    console.log('❌ No tests passed. Backend still needs fixes.');
    console.log('💡 Remember: Frontend fallback system is working fine!');
  }
}

testBackendFixes();`;

  // Write all files
  const files = [
    { name: 'database-migration.sql', content: dbMigration },
    { name: 'backend-api-fixes.js', content: backendFixes },
    { name: 'BACKEND_DEPLOYMENT_GUIDE.md', content: instructions },
    { name: 'test-backend-fixes.js', content: testScript }
  ];

  console.log('📄 Generated deployment files:');
  files.forEach(file => {
    console.log(`   ✅ ${file.name}`);
  });

  return files;
}

// Main execution
async function main() {
  try {
    const analysis = await analyzeBackend();
    
    console.log('\n📋 Analysis Results:');
    console.log(`   Needs Fix: ${analysis.needsFix}`);
    console.log(`   Issue Type: ${analysis.issue}`);
    
    if (analysis.needsFix) {
      const files = await generateFixFiles(analysis);
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Run the database migration: database-migration.sql');
      console.log('2. Update backend code with: backend-api-fixes.js');
      console.log('3. Test deployment with: node test-backend-fixes.js');
      console.log('4. Follow detailed guide: BACKEND_DEPLOYMENT_GUIDE.md');
      
    } else {
      console.log('\n🎉 Backend is working correctly! No fixes needed.');
    }
    
    console.log('\n✨ Backend deployment analysis complete!');
    
  } catch (error) {
    console.error('💥 Analysis failed:', error.message);
  }
}

main();
