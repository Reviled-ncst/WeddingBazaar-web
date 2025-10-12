#!/usr/bin/env node

/**
 * COMPLETE BACKEND DEPLOYMENT SCRIPT
 * 
 * This script handles the complete deployment of the enhanced booking system:
 * 1. Tests current backend status
 * 2. Provides deployment instructions
 * 3. Validates database migration requirements
 * 4. Tests enhanced booking functionality
 */

const PRODUCTION_API = 'https://weddingbazaar-web.onrender.com';

class CompleteBackendDeployment {
  constructor() {
    this.deploymentResults = [];
  }

  logResult(step, status, message, data = null) {
    const result = {
      step,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.deploymentResults.push(result);
    
    const emoji = status === 'SUCCESS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARNING' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${step}] ${message}`);
    if (data && typeof data === 'object') {
      console.log(`   Details:`, JSON.stringify(data, null, 2));
    }
  }

  async testCurrentBackendStatus() {
    console.log('🔍 STEP 1: Testing Current Backend Status');
    console.log('=' + '='.repeat(50));

    try {
      // Test health endpoint
      const healthResponse = await fetch(`${PRODUCTION_API}/api/health`);
      const healthData = await healthResponse.json();
      
      if (healthResponse.ok) {
        this.logResult('HEALTH_CHECK', 'SUCCESS', 
          `Backend is healthy: ${healthData.status}`, 
          { version: healthData.version, database: healthData.database });
      } else {
        this.logResult('HEALTH_CHECK', 'FAIL', 
          `Health check failed: ${healthResponse.status}`);
        return false;
      }

      // Test current endpoints
      const endpoints = [
        { path: '/api/bookings/vendor/2', name: 'Vendor Bookings' },
        { path: '/api/bookings/stats', name: 'Booking Stats' },
        { path: '/api/vendors/featured', name: 'Featured Vendors' }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${PRODUCTION_API}${endpoint.path}`);
          if (response.ok) {
            this.logResult('ENDPOINT_TEST', 'SUCCESS', 
              `${endpoint.name} endpoint working`);
          } else {
            this.logResult('ENDPOINT_TEST', 'WARNING', 
              `${endpoint.name} endpoint returned ${response.status}`);
          }
        } catch (error) {
          this.logResult('ENDPOINT_TEST', 'FAIL', 
            `${endpoint.name} endpoint failed: ${error.message}`);
        }
      }

      return true;
    } catch (error) {
      this.logResult('HEALTH_CHECK', 'FAIL', 
        `Backend connection failed: ${error.message}`);
      return false;
    }
  }

  async testMissingEndpoints() {
    console.log('\\n🔍 STEP 2: Testing Missing Endpoints');
    console.log('=' + '='.repeat(50));

    const missingEndpoints = [
      { 
        path: '/api/bookings/662340', 
        method: 'GET',
        name: 'Individual Booking Retrieval',
        description: 'Should return specific booking details'
      },
      { 
        path: '/api/bookings/662340/status', 
        method: 'PUT',
        name: 'Alternative Status Update',
        description: 'Alternative to PATCH for status updates'
      }
    ];

    for (const endpoint of missingEndpoints) {
      try {
        const options = endpoint.method === 'PUT' ? {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed', message: 'Test' })
        } : {};

        const response = await fetch(`${PRODUCTION_API}${endpoint.path}`, options);
        
        if (response.ok) {
          this.logResult('MISSING_ENDPOINT', 'SUCCESS', 
            `${endpoint.name} endpoint is working`);
        } else if (response.status === 404) {
          this.logResult('MISSING_ENDPOINT', 'FAIL', 
            `${endpoint.name} endpoint missing (404) - NEEDS DEPLOYMENT`);
        } else {
          this.logResult('MISSING_ENDPOINT', 'WARNING', 
            `${endpoint.name} endpoint exists but returned ${response.status}`);
        }
      } catch (error) {
        this.logResult('MISSING_ENDPOINT', 'FAIL', 
          `${endpoint.name} test failed: ${error.message}`);
      }
    }
  }

  async testEnhancedStatusValidation() {
    console.log('\\n🔍 STEP 3: Testing Enhanced Status Validation');
    console.log('=' + '='.repeat(50));

    // Get a booking to test with
    try {
      const bookingsResponse = await fetch(`${PRODUCTION_API}/api/bookings/vendor/2`);
      const bookingsData = await bookingsResponse.json();
      
      if (!bookingsData.success || !bookingsData.bookings || bookingsData.bookings.length === 0) {
        this.logResult('STATUS_VALIDATION', 'WARNING', 
          'No test bookings available - cannot test status validation');
        return;
      }

      const testBookingId = bookingsData.bookings[0].id;
      
      // Test new status values
      const newStatuses = ['quote_sent', 'quote_accepted', 'in_progress'];
      let workingStatuses = 0;

      for (const status of newStatuses) {
        try {
          const response = await fetch(`${PRODUCTION_API}/api/bookings/${testBookingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, message: `Testing ${status}` })
          });

          if (response.ok) {
            workingStatuses++;
            this.logResult('STATUS_VALIDATION', 'SUCCESS', 
              `Status '${status}' is accepted`);
          } else {
            const errorData = await response.text();
            if (errorData.includes('Invalid status. Must be one of: pending, confirmed, cancelled, completed')) {
              this.logResult('STATUS_VALIDATION', 'FAIL', 
                `Status '${status}' rejected - OLD VALIDATION STILL ACTIVE`);
            } else {
              this.logResult('STATUS_VALIDATION', 'WARNING', 
                `Status '${status}' returned ${response.status}`);
            }
          }
        } catch (error) {
          this.logResult('STATUS_VALIDATION', 'FAIL', 
            `Status '${status}' test failed: ${error.message}`);
        }
      }

      if (workingStatuses === 0) {
        this.logResult('STATUS_VALIDATION', 'FAIL', 
          'NO NEW STATUSES WORKING - ENHANCED BOOKING SERVICE NOT DEPLOYED');
      } else if (workingStatuses === newStatuses.length) {
        this.logResult('STATUS_VALIDATION', 'SUCCESS', 
          'ALL NEW STATUSES WORKING - ENHANCED BOOKING SERVICE DEPLOYED');
      } else {
        this.logResult('STATUS_VALIDATION', 'WARNING', 
          `PARTIAL DEPLOYMENT - ${workingStatuses}/${newStatuses.length} statuses working`);
      }

    } catch (error) {
      this.logResult('STATUS_VALIDATION', 'FAIL', 
        `Status validation test failed: ${error.message}`);
    }
  }

  generateDeploymentInstructions() {
    console.log('\\n📋 STEP 4: Deployment Instructions');
    console.log('=' + '='.repeat(50));

    const instructions = [
      {
        step: 1,
        title: 'Update Backend Service Files',
        description: 'Replace the booking service with enhanced version',
        files: [
          'backend/services/bookingService.js - ✅ UPDATED',
          'backend/services/bookingService.ts - ✅ UPDATED'
        ],
        action: 'Copy enhanced files to production backend'
      },
      {
        step: 2,
        title: 'Add Missing API Routes',
        description: 'Add new endpoints to routes/bookings.js',
        files: [
          'comprehensive-booking-routes.js - ✅ CREATED'
        ],
        action: 'Copy routes from comprehensive-booking-routes.js to production routes/bookings.js'
      },
      {
        step: 3,
        title: 'Run Database Migration',
        description: 'Update database schema in Neon PostgreSQL',
        files: [
          'database-migration-enhanced-booking.sql - ✅ CREATED'
        ],
        action: 'Execute SQL script in Neon PostgreSQL dashboard'
      },
      {
        step: 4,
        title: 'Deploy to Render',
        description: 'Push changes and trigger deployment',
        files: [],
        action: 'git add . && git commit -m "Enhanced booking system" && git push origin main'
      },
      {
        step: 5,
        title: 'Verify Deployment',
        description: 'Test enhanced booking functionality',
        files: [
          'test-enhanced-booking-backend.js - ✅ READY'
        ],
        action: 'Run: node test-enhanced-booking-backend.js'
      }
    ];

    instructions.forEach(instruction => {
      console.log(`\\n${instruction.step}. ${instruction.title}`);
      console.log(`   ${instruction.description}`);
      if (instruction.files.length > 0) {
        instruction.files.forEach(file => {
          console.log(`   📁 ${file}`);
        });
      }
      console.log(`   🔧 Action: ${instruction.action}`);
    });
  }

  async runCompleteDeploymentTest() {
    console.log('🚀 COMPLETE BACKEND DEPLOYMENT TEST');
    console.log('═'.repeat(70));
    console.log('Testing current backend status and generating deployment plan...');
    
    const startTime = Date.now();

    // Step 1: Test current backend
    const backendHealthy = await this.testCurrentBackendStatus();
    
    if (!backendHealthy) {
      console.log('\\n❌ Backend is not healthy - cannot proceed with deployment tests');
      return this.generateReport();
    }

    // Step 2: Test missing endpoints
    await this.testMissingEndpoints();

    // Step 3: Test enhanced status validation
    await this.testEnhancedStatusValidation();

    // Step 4: Generate deployment instructions
    this.generateDeploymentInstructions();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\\n' + '═'.repeat(70));
    console.log(`🏁 Complete Deployment Test Finished in ${duration}ms`);

    return await this.generateReport();
  }

  async generateReport() {
    const totalSteps = this.deploymentResults.length;
    const successCount = this.deploymentResults.filter(r => r.status === 'SUCCESS').length;
    const failCount = this.deploymentResults.filter(r => r.status === 'FAIL').length;
    const warningCount = this.deploymentResults.filter(r => r.status === 'WARNING').length;
    
    const report = {
      summary: {
        total: totalSteps,
        success: successCount,
        failed: failCount,
        warnings: warningCount,
        readinessScore: totalSteps > 0 ? Math.round((successCount / totalSteps) * 100) : 0
      },
      results: this.deploymentResults,
      status: failCount === 0 ? 'READY_FOR_DEPLOYMENT' : 'NEEDS_FIXES'
    };

    console.log('\\n📊 DEPLOYMENT READINESS REPORT');
    console.log('=' + '='.repeat(40));
    console.log(`✅ Success: ${successCount}/${totalSteps}`);
    console.log(`❌ Failed: ${failCount}/${totalSteps}`);
    console.log(`⚠️ Warnings: ${warningCount}/${totalSteps}`);
    console.log(`📈 Readiness Score: ${report.summary.readinessScore}%`);
    console.log(`🎯 Status: ${report.status}`);

    // Write detailed report
    try {
      const { writeFileSync } = await import('fs');
      writeFileSync('deployment-readiness-report.json', JSON.stringify(report, null, 2));
      console.log('\\n📄 Detailed report saved: deployment-readiness-report.json');
    } catch (error) {
      console.log('\\n⚠️ Could not save report file:', error.message);
    }

    return report;
  }
}

// Run the complete deployment test
async function runCompleteDeploymentTest() {
  const deployment = new CompleteBackendDeployment();
  try {
    await deployment.runCompleteDeploymentTest();
  } catch (error) {
    console.error('💥 Deployment test failed:', error);
  }
}

// Auto-run if called directly
runCompleteDeploymentTest();
