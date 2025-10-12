#!/usr/bin/env node

/**
 * BACKEND DEPLOYMENT SCRIPT
 * This script helps deploy the backend fixes to production hosting
 */

import fs from 'fs';
import https from 'https';

const PRODUCTION_API = 'https://weddingbazaar-web.onrender.com';

class BackendDeploymentManager {
  constructor() {
    this.fixes = [];
    this.testResults = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async testCurrentBackend() {
    this.log('🔍 Testing Current Backend Status');
    
    try {
      // Test health endpoint
      const healthResponse = await fetch(`${PRODUCTION_API}/api/health`);
      const healthData = await healthResponse.json();
      
      this.log('✅ Backend Health Check', {
        status: healthData.status,
        version: healthData.version,
        database: healthData.database
      });

      // Test the problematic endpoint
      this.log('🧪 Testing Problematic Status Update Endpoint');
      
      try {
        const statusResponse = await fetch(`${PRODUCTION_API}/api/bookings/662340/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'quote_sent' })
        });
        
        const statusData = await statusResponse.text();
        
        if (statusResponse.status === 500) {
          this.log('❌ Confirmed: Backend has schema issues', {
            status: statusResponse.status,
            error: statusData
          });
          
          if (statusData.includes('status_reason')) {
            this.fixes.push('ADD_STATUS_REASON_COLUMN');
          }
          
          if (statusData.includes('quote_sent')) {
            this.fixes.push('UPDATE_STATUS_ENUM');
          }
        } else {
          this.log('✅ Status update endpoint working', {
            status: statusResponse.status,
            response: statusData
          });
        }
        
      } catch (error) {
        this.log('❌ Status update test failed', { error: error.message });
        this.fixes.push('FIX_STATUS_ENDPOINT');
      }

      return { healthy: healthData.status === 'OK', fixes: this.fixes };
      
    } catch (error) {
      this.log('❌ Backend health check failed', { error: error.message });
      return { healthy: false, fixes: ['FULL_BACKEND_REPAIR'] };
    }
  }

  generateDatabaseMigration() {
    const migration = `
-- WEDDING BAZAAR BACKEND SCHEMA MIGRATION
-- Run this on your production database

BEGIN;

-- 1. Add missing columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_data JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP;

-- 2. Update status constraint to allow quote_sent
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_status_constraint;
ALTER TABLE bookings ADD CONSTRAINT booking_status_constraint 
CHECK (status IN ('pending', 'quote_sent', 'quote_accepted', 'confirmed', 'cancelled', 'completed'));

-- 3. Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    service_items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
`;

    fs.writeFileSync('database-migration.sql', migration);
    this.log('📄 Database migration script created: database-migration.sql');
    return migration;
  }

  generateBackendCode() {
    const backendFix = `
// BACKEND API FIXES
// Add these endpoints to your backend server

// Fix PATCH /api/bookings/:id/status endpoint
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    // Allow quote_sent status
    const allowedStatuses = ['pending', 'quote_sent', 'quote_accepted', 'confirmed', 'cancelled', 'completed'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: \`Invalid status. Must be one of: \${allowedStatuses.join(', ')}\`
      });
    }

    // Update with proper column names
    const result = await db.query(
      'UPDATE bookings SET status = $1, status_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, message, id]
    );

    if (result.rows.length > 0) {
      res.json({
        success: true,
        booking: result.rows[0]
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add GET /api/bookings/:id endpoint
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        booking: result.rows[0]
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
`;

    fs.writeFileSync('backend-api-fixes.js', backendFix);
    this.log('📄 Backend API fixes created: backend-api-fixes.js');
    return backendFix;
  }

  generateDeploymentInstructions() {
    const instructions = `
# WEDDING BAZAAR BACKEND DEPLOYMENT INSTRUCTIONS

## 🚀 Step-by-Step Deployment Guide

### 1. Database Migration
\`\`\`bash
# Connect to your production database (Neon PostgreSQL)
psql "postgresql://your-connection-string"

# Run the migration
\\i database-migration.sql
\`\`\`

### 2. Backend Code Updates
\`\`\`bash
# Update your backend server with the new endpoints
# Copy the code from backend-api-fixes.js into your main server file

# Restart your backend service
# For Render.com: Push changes to your connected Git repository
git add .
git commit -m "Fix backend schema issues and add missing endpoints"
git push
\`\`\`

### 3. Environment Variables
Make sure these are set in your hosting environment:
\`\`\`
NODE_ENV=production
DATABASE_URL=your-neon-postgresql-url
\`\`\`

### 4. Test Deployment
\`\`\`bash
# Run the test script
node test-backend-deployment.js
\`\`\`

## 🔧 Manual Fixes (if automated deployment fails)

### Option 1: Direct Database Access
1. Login to your Neon PostgreSQL dashboard
2. Open SQL editor
3. Run the migration script manually

### Option 2: Backend Code Injection
1. Login to your Render.com dashboard
2. Open your backend service
3. Add the API fixes to your main server file
4. Deploy manually

## 📊 Expected Results After Deployment

✅ PATCH /api/bookings/:id/status accepts 'quote_sent' status
✅ GET /api/bookings/:id returns individual booking details
✅ No more "status_reason column does not exist" errors
✅ Frontend quote system works with full backend persistence

## 🆘 Troubleshooting

If deployment fails:
1. Check database connection string
2. Verify table permissions
3. Check server logs for specific errors
4. Use fallback frontend-only solution (already working)

## 📞 Support

The frontend system is already working with fallback mechanisms.
Backend fixes will enhance functionality but are not critical for user experience.
`;

    fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', instructions);
    this.log('📄 Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md');
    return instructions;
  }

  async runDeploymentTest() {
    this.log('🚀 Starting Backend Deployment Test');
    
    const backendStatus = await this.testCurrentBackend();
    
    if (backendStatus.healthy) {
      this.log('✅ Backend is healthy');
      
      if (backendStatus.fixes.length > 0) {
        this.log('⚠️ Backend needs fixes:', backendStatus.fixes);
        this.generateDatabaseMigration();
        this.generateBackendCode();
        this.generateDeploymentInstructions();
      } else {
        this.log('🎉 Backend is fully operational - no fixes needed!');
      }
    } else {
      this.log('❌ Backend has critical issues');
      this.generateDatabaseMigration();
      this.generateBackendCode();
      this.generateDeploymentInstructions();
    }

    // Create comprehensive test script
    this.createBackendTestScript();
    
    const summary = {
      backendHealthy: backendStatus.healthy,
      fixesNeeded: backendStatus.fixes,
      filesGenerated: [
        'database-migration.sql',
        'backend-api-fixes.js', 
        'DEPLOYMENT_INSTRUCTIONS.md',
        'test-backend-deployment.js'
      ],
      nextSteps: backendStatus.healthy 
        ? ['Apply minor fixes', 'Test endpoints', 'Deploy to production']
        : ['Run database migration', 'Update backend code', 'Test deployment']
    };

    this.log('📊 Deployment Summary', summary);
    return summary;
  }

  createBackendTestScript() {
    const testScript = `
const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function testBackendDeployment() {
  console.log('🧪 Testing Backend Deployment');
  console.log('============================');
  
  const tests = [
    {
      name: 'Health Check',
      test: async () => {
        const response = await fetch(\`\${API_BASE}/api/health\`);
        const data = await response.json();
        return { success: response.ok, data };
      }
    },
    {
      name: 'Status Update (PATCH)',
      test: async () => {
        const response = await fetch(\`\${API_BASE}/api/bookings/662340/status\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'quote_sent', message: 'Test quote sent' })
        });
        const data = await response.text();
        return { success: response.ok, status: response.status, data };
      }
    },
    {
      name: 'Individual Booking (GET)',
      test: async () => {
        const response = await fetch(\`\${API_BASE}/api/bookings/662340\`);
        const data = response.ok ? await response.json() : await response.text();
        return { success: response.ok, status: response.status, data };
      }
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      console.log(\`\\n🔍 Testing: \${test.name}\`);
      const result = await test.test();
      
      if (result.success) {
        console.log(\`✅ \${test.name}: PASSED\`);
        passed++;
      } else {
        console.log(\`❌ \${test.name}: FAILED\`);
        console.log(\`   Status: \${result.status}\`);
        console.log(\`   Response: \${JSON.stringify(result.data, null, 2)}\`);
      }
    } catch (error) {
      console.log(\`💥 \${test.name}: ERROR - \${error.message}\`);
    }
  }

  console.log(\`\\n📊 Test Results: \${passed}/\${total} passed\`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend deployment successful!');
  } else {
    console.log('⚠️ Some tests failed. Check deployment instructions.');
  }
}

testBackendDeployment();
`;

    fs.writeFileSync('test-backend-deployment.js', testScript);
    this.log('📄 Backend test script created: test-backend-deployment.js');
  }
}

// Run the deployment manager
async function main() {
  const manager = new BackendDeploymentManager();
  try {
    await manager.runDeploymentTest();
    console.log('\\n✨ Backend deployment preparation complete!');
    console.log('📋 Check generated files for deployment instructions.');
  } catch (error) {
    console.error('💥 Deployment preparation failed:', error);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default BackendDeploymentManager;
