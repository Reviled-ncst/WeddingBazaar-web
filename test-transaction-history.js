// ============================================================================
// Transaction History API Test Script
// ============================================================================
// Tests both vendor wallet transactions and couple receipts endpoints
// Run: node test-transaction-history.js
// ============================================================================

const API_URL = 'https://weddingbazaar-web.onrender.com';

// Test data from production
const TEST_VENDOR_ID = '4bc25fd3-55d3-47a1-9c6c-7a02cd0dbe39'; // Vendor with transactions
const TEST_USER_ID = 'fa15ab2d-f8fa-4be1-bda7-b0e18e7c20dc'; // User with receipts
const TEST_JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with real token from login

// ANSI color codes for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  data: (label, value) => console.log(`  ${colors.magenta}${label}:${colors.reset} ${value}`),
};

// ============================================================================
// Test 1: Vendor Wallet Transactions
// ============================================================================
async function testVendorTransactions() {
  log.header('📊 TEST 1: Vendor Wallet Transactions');
  log.info(`Testing endpoint: /api/wallet/${TEST_VENDOR_ID}/transactions`);
  
  try {
    const response = await fetch(`${API_URL}/api/wallet/${TEST_VENDOR_ID}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
      },
    });
    
    log.data('Response Status', response.status);
    
    if (!response.ok) {
      log.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      log.data('Error Response', errorText);
      return false;
    }
    
    const data = await response.json();
    log.success('Successfully fetched vendor transactions');
    
    // Validate response structure
    if (!data.success) {
      log.error('Response missing "success" field');
      return false;
    }
    
    if (!Array.isArray(data.transactions)) {
      log.error('Response missing "transactions" array');
      return false;
    }
    
    log.data('Transactions Found', data.transactions.length);
    
    // Validate first transaction structure
    if (data.transactions.length > 0) {
      const firstTx = data.transactions[0];
      log.info('Validating transaction structure...');
      
      const requiredFields = [
        'id', 'receipt_number', 'transaction_type', 'amount', 
        'currency', 'status', 'created_at'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in firstTx));
      
      if (missingFields.length > 0) {
        log.error(`Missing required fields: ${missingFields.join(', ')}`);
        return false;
      }
      
      log.success('All required fields present');
      
      // Display sample transaction
      log.info('Sample Transaction:');
      log.data('  Receipt Number', firstTx.receipt_number);
      log.data('  Type', firstTx.transaction_type);
      log.data('  Amount (centavos)', firstTx.amount);
      log.data('  Amount (PHP)', `₱${(firstTx.amount / 100).toFixed(2)}`);
      log.data('  Currency', firstTx.currency);
      log.data('  Status', firstTx.status);
      log.data('  Service', firstTx.service_name || firstTx.service_category);
      log.data('  Customer', firstTx.couple_name || 'N/A');
      log.data('  Created', new Date(firstTx.created_at).toLocaleString());
      
      // Validate amount is in centavos (should be large number)
      if (firstTx.amount < 1000) {
        log.warn('Amount seems too small - might not be in centavos!');
      } else {
        log.success('Amount appears to be in centavos format');
      }
    }
    
    return true;
    
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

// ============================================================================
// Test 2: Couple Payment Receipts
// ============================================================================
async function testCoupleReceipts() {
  log.header('📊 TEST 2: Couple Payment Receipts');
  log.info(`Testing endpoint: /api/payment/receipts/user/${TEST_USER_ID}`);
  
  try {
    const response = await fetch(`${API_URL}/api/payment/receipts/user/${TEST_USER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
      },
    });
    
    log.data('Response Status', response.status);
    
    if (!response.ok) {
      log.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      log.data('Error Response', errorText);
      return false;
    }
    
    const data = await response.json();
    log.success('Successfully fetched couple receipts');
    
    // Validate response structure
    if (!data.success) {
      log.error('Response missing "success" field');
      return false;
    }
    
    if (!Array.isArray(data.receipts)) {
      log.error('Response missing "receipts" array');
      return false;
    }
    
    log.data('Receipts Found', data.receipts.length);
    
    // Validate statistics
    if (data.statistics) {
      log.info('Statistics:');
      log.data('  Total Spent', data.statistics.totalSpentFormatted || `₱${data.statistics.totalSpent}`);
      log.data('  Total Payments', data.statistics.totalPayments);
      log.data('  Unique Bookings', data.statistics.uniqueBookings);
      log.data('  Unique Vendors', data.statistics.uniqueVendors);
    }
    
    // Display sample receipt
    if (data.receipts.length > 0) {
      const firstReceipt = data.receipts[0];
      log.info('Sample Receipt:');
      log.data('  Receipt Number', firstReceipt.receiptNumber);
      log.data('  Payment Type', firstReceipt.paymentType);
      log.data('  Amount (centavos)', firstReceipt.amount);
      log.data('  Amount (PHP)', `₱${(firstReceipt.amount / 100).toFixed(2)}`);
      log.data('  Vendor', firstReceipt.vendorName);
      log.data('  Service', firstReceipt.serviceType);
      log.data('  Payment Method', firstReceipt.paymentMethod);
      log.data('  Status', firstReceipt.bookingStatus);
      log.data('  Created', new Date(firstReceipt.createdAt).toLocaleString());
    }
    
    return true;
    
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

// ============================================================================
// Test 3: Data Transformation Test
// ============================================================================
function testDataTransformation() {
  log.header('📊 TEST 3: Data Transformation Logic');
  
  // Simulate backend response
  const mockWalletTransaction = {
    id: '123',
    receipt_id: 'TXN-123',
    receipt_number: 'TXN-123',
    booking_id: 'booking-456',
    transaction_type: 'earning',
    amount: 1892800, // 18928.00 PHP in centavos
    currency: 'PHP',
    payment_method: 'card',
    service_name: 'Photography',
    service_category: 'Photography',
    couple_name: 'John Doe',
    couple_email: 'john@example.com',
    status: 'completed',
    notes: 'Wedding photography payment',
    created_at: '2025-10-30T10:00:00Z',
  };
  
  log.info('Mock wallet transaction:');
  log.data('  Amount (centavos)', mockWalletTransaction.amount);
  log.data('  Expected PHP', '₱18,928.00');
  
  // Transform to receipt format (as done in component)
  const transformedReceipt = {
    id: mockWalletTransaction.id,
    receiptNumber: mockWalletTransaction.receipt_number,
    amount: mockWalletTransaction.amount, // Keep in centavos
    currency: mockWalletTransaction.currency,
    paymentType: mockWalletTransaction.transaction_type,
    serviceType: mockWalletTransaction.service_name,
    paidByName: mockWalletTransaction.couple_name,
  };
  
  log.info('Transformed receipt:');
  log.data('  Amount (centavos)', transformedReceipt.amount);
  log.data('  Formatted', `₱${(transformedReceipt.amount / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`);
  
  // Test formatAmount function logic
  const centavos = 1892800;
  const php = centavos / 100; // 18928.00
  const formatted = `₱${php.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  
  log.success(`Format test: ${centavos} centavos → ${formatted}`);
  
  if (formatted === '₱18,928.00') {
    log.success('Amount formatting is CORRECT');
    return true;
  } else {
    log.error(`Amount formatting FAILED. Expected ₱18,928.00, got ${formatted}`);
    return false;
  }
}

// ============================================================================
// Test 4: Authentication Test
// ============================================================================
async function testAuthentication() {
  log.header('📊 TEST 4: Authentication Check');
  
  if (TEST_JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    log.warn('JWT token not set - skipping authentication test');
    log.info('To test with authentication:');
    log.info('1. Log in to the app');
    log.info('2. Open browser DevTools → Application → Local Storage');
    log.info('3. Copy the jwt_token value');
    log.info('4. Replace TEST_JWT_TOKEN in this script');
    return false;
  }
  
  log.info('Testing with provided JWT token...');
  
  try {
    // Test vendor endpoint
    const response = await fetch(`${API_URL}/api/wallet/${TEST_VENDOR_ID}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
      },
    });
    
    if (response.status === 401 || response.status === 403) {
      log.error('Authentication failed - token might be invalid or expired');
      return false;
    }
    
    if (response.ok) {
      log.success('Authentication successful');
      return true;
    }
    
    log.warn(`Unexpected status: ${response.status}`);
    return false;
    
  } catch (error) {
    log.error(`Authentication test failed: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  log.header('🧪 TRANSACTION HISTORY API TEST SUITE');
  console.log('='.repeat(70));
  
  const results = {
    vendorTransactions: false,
    coupleReceipts: false,
    dataTransformation: false,
    authentication: false,
  };
  
  // Run tests
  results.dataTransformation = testDataTransformation();
  results.authentication = await testAuthentication();
  results.vendorTransactions = await testVendorTransactions();
  results.coupleReceipts = await testCoupleReceipts();
  
  // Summary
  log.header('📋 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const tests = [
    { name: 'Data Transformation', result: results.dataTransformation },
    { name: 'Authentication', result: results.authentication },
    { name: 'Vendor Transactions', result: results.vendorTransactions },
    { name: 'Couple Receipts', result: results.coupleReceipts },
  ];
  
  tests.forEach(test => {
    const icon = test.result ? '✓' : '✗';
    const color = test.result ? colors.green : colors.red;
    console.log(`  ${color}${icon}${colors.reset} ${test.name}`);
  });
  
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(70));
  
  if (passedTests === totalTests) {
    log.success(`ALL TESTS PASSED (${passedTests}/${totalTests})`);
    console.log('='.repeat(70) + '\n');
    process.exit(0);
  } else {
    log.error(`SOME TESTS FAILED (${passedTests}/${totalTests} passed)`);
    console.log('='.repeat(70) + '\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log.error('Test suite failed with error:');
  console.error(error);
  process.exit(1);
});
