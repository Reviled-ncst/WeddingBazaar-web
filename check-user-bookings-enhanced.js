#!/usr/bin/env node

// Get command line arguments for filtering
const args = process.argv.slice(2);
const filterArg = args.find(arg => arg.startsWith('--filter='));
const statusFilter = filterArg ? filterArg.split('=')[1] : null;

// Colors for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m'
};

// Helper functions for better formatting
function header(text, color = colors.cyan) {
  const border = '▓'.repeat(60);
  console.log(`\n${color}${border}${colors.reset}`);
  console.log(`${color}${colors.bright}  ${text.padEnd(56)}  ${colors.reset}`);
  console.log(`${color}${border}${colors.reset}\n`);
}

function subHeader(text, icon = '📋') {
  console.log(`\n${colors.blue}${colors.bright}${icon} ${text}${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(text.length + 3)}${colors.reset}`);
}

function infoBox(title, content, color = colors.white) {
  console.log(`\n${color}${colors.bright}┌─ ${title} ${colors.reset}`);
  content.forEach(line => {
    console.log(`${color}│  ${line}${colors.reset}`);
  });
  console.log(`${color}└${'─'.repeat(title.length + 3)}${colors.reset}`);
}

function successBox(text) {
  console.log(`\n${colors.bgGreen}${colors.bright} ✓ SUCCESS ${colors.reset} ${colors.green}${text}${colors.reset}`);
}

function errorBox(text) {
  console.log(`\n${colors.bgRed}${colors.bright} ✗ ERROR ${colors.reset} ${colors.red}${text}${colors.reset}`);
}

function statusBadge(status) {
  switch(status.toLowerCase()) {
    case 'confirmed': return `${colors.bgGreen}${colors.bright} CONFIRMED ✓ ${colors.reset}`;
    case 'pending': return `${colors.bgYellow}${colors.bright} PENDING ⏳ ${colors.reset}`;
    case 'request': return `${colors.bgBlue}${colors.bright} REQUEST 📋 ${colors.reset}`;
    case 'cancelled': return `${colors.bgRed}${colors.bright} CANCELLED ✗ ${colors.reset}`;
    default: return `${colors.bgBlue}${colors.bright} ${status.toUpperCase()} ${colors.reset}`;
  }
}

function getPaymentStatus(booking) {
  const progress = ((booking.downPayment || 0) / (booking.amount || 1) * 100);
  if (progress === 0) return 'unpaid';
  if (progress >= 100) return 'paid';
  return 'partial';
}

function getProgressCategory(booking) {
  const paymentStatus = getPaymentStatus(booking);
  const eventDate = new Date(booking.eventDate);
  const now = new Date();
  const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
  
  if (booking.status === 'cancelled') return 'cancelled';
  if (booking.status === 'request') return 'pending-approval';
  if (paymentStatus === 'paid') return 'completed';
  if (paymentStatus === 'unpaid' && daysUntilEvent < 30) return 'urgent';
  if (paymentStatus === 'partial') return 'in-progress';
  return 'on-track';
}

function getProgressBadge(category) {
  switch(category) {
    case 'completed': return `${colors.bgGreen}${colors.bright} COMPLETED ✅ ${colors.reset}`;
    case 'in-progress': return `${colors.bgBlue}${colors.bright} IN PROGRESS 🔄 ${colors.reset}`;
    case 'urgent': return `${colors.bgRed}${colors.bright} URGENT ⚠️ ${colors.reset}`;
    case 'on-track': return `${colors.bgGreen}${colors.bright} ON TRACK ✅ ${colors.reset}`;
    case 'pending-approval': return `${colors.bgYellow}${colors.bright} PENDING APPROVAL ⏳ ${colors.reset}`;
    case 'cancelled': return `${colors.bgRed}${colors.bright} CANCELLED ❌ ${colors.reset}`;
    default: return `${colors.bgBlue}${colors.bright} ${category.toUpperCase()} ${colors.reset}`;
  }
}

function formatCurrency(amount) {
  return `${colors.green}₱${amount?.toLocaleString() || '0'}${colors.reset}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  return `${colors.cyan}${date.toLocaleDateString('en-US', options)}${colors.reset}`;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return `${colors.cyan}${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}${colors.reset}`;
}

// Available filters
const availableFilters = {
  'all': 'Show all bookings',
  'confirmed': 'Show confirmed bookings only',
  'pending': 'Show pending bookings only', 
  'request': 'Show booking requests only',
  'urgent': 'Show urgent bookings (payment due soon)',
  'in-progress': 'Show bookings with partial payment',
  'completed': 'Show fully paid bookings',
  'cancelled': 'Show cancelled bookings'
};

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

async function checkUserBookings() {
  try {
    // Welcome header with filter info
    header('🎉 WEDDING BAZAAR BOOKING DASHBOARD', colors.magenta);
    console.log(`${colors.bright}${colors.white}👤 User Profile: ${colors.yellow}1-2025-001${colors.reset}`);

    if (statusFilter) {
      console.log(`${colors.cyan}🔍 Filter Applied: ${colors.yellow}${statusFilter.toUpperCase()}${colors.reset}`);
    } else {
      console.log(`${colors.dim}💡 Use --filter=status to filter bookings (all, confirmed, pending, request, urgent, in-progress, completed)${colors.reset}`);
    }

    console.log(`${colors.dim}🔍 Scanning production database for booking records...${colors.reset}`);

    const url = `${BACKEND_URL}/api/bookings/couple/1-2025-001`;
    
    // API Connection Status
    infoBox('🌐 API CONNECTION', [
      `Endpoint: ${url}`,
      `Method: GET`,
      `Status: Connecting...`
    ], colors.blue);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      successBox(`Connected successfully (${response.status})`);
      const data = await response.json();
      
      if (data.bookings && data.bookings.length > 0) {
        
        // Apply filters
        let filteredBookings = data.bookings;
        
        if (statusFilter && statusFilter !== 'all') {
          filteredBookings = data.bookings.filter(booking => {
            const progressCategory = getProgressCategory(booking);
            
            switch(statusFilter.toLowerCase()) {
              case 'confirmed': return booking.status === 'confirmed';
              case 'pending': return booking.status === 'pending';
              case 'request': return booking.status === 'request';
              case 'urgent': return progressCategory === 'urgent';
              case 'in-progress': return progressCategory === 'in-progress';
              case 'completed': return progressCategory === 'completed';
              case 'cancelled': return booking.status === 'cancelled';
              default: return true;
            }
          });
        }
        
        if (filteredBookings.length === 0) {
          header('🔍 NO MATCHING BOOKINGS', colors.yellow);
          
          infoBox('ℹ️  FILTER RESULTS', [
            `Filter: ${statusFilter}`,
            `Total bookings: ${data.bookings.length}`,
            `Matching filter: 0`,
            '',
            'Available filters:',
            ...Object.entries(availableFilters).map(([key, desc]) => `• ${key}: ${desc}`)
          ], colors.yellow);
          return;
        }
        
        // Show filter summary
        if (statusFilter && statusFilter !== 'all') {
          infoBox('📊 FILTER SUMMARY', [
            `Filter: ${statusFilter.toUpperCase()}`,
            `Total bookings: ${data.bookings.length}`,
            `Filtered results: ${filteredBookings.length}`,
            `Description: ${availableFilters[statusFilter] || 'Custom filter'}`
          ], colors.cyan);
        }
        
        // Main bookings display
        filteredBookings.forEach((booking, index) => {
          
          // Calculate progress info
          const progressCategory = getProgressCategory(booking);
          const paymentProgress = ((booking.downPayment || 0) / (booking.amount || 1) * 100).toFixed(1);
          const eventDate = new Date(booking.eventDate);
          const now = new Date();
          const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
          
          // Booking Header with Status and Progress
          header(`💍 WEDDING BOOKING #${booking.id}`, colors.magenta);
          console.log(`${statusBadge(booking.status)} ${getProgressBadge(progressCategory)}\n`);
          
          // Vendor Information Card (using correct field names)
          infoBox('🏢 VENDOR INFORMATION', [
            `Business Name: ${colors.bright}${booking.vendorName}${colors.reset}`,
            `Service Category: ${colors.yellow}${booking.vendorCategory}${colors.reset}`,
            `Package: ${colors.cyan}${booking.serviceType}${colors.reset}`,
            `Contact: ${colors.green}${booking.contactPhone || 'Not provided'}${colors.reset}`
          ], colors.blue);
          
          // Event Details Card
          infoBox('🎉 EVENT DETAILS', [
            `Wedding Date: ${formatDate(booking.eventDate)}`,
            `Time: ${formatTime(booking.eventDate)}`,
            `Days Until Event: ${colors.bright}${daysUntilEvent > 0 ? daysUntilEvent + ' days' : 'Event passed'}${colors.reset}`,
            `Venue: ${colors.bright}${booking.location || 'To be confirmed'}${colors.reset}`,
            `Booked On: ${formatDate(booking.bookingDate)}`,
            `Special Notes: ${colors.yellow}${booking.notes || 'None'}${colors.reset}`
          ], colors.magenta);
          
          // Payment Information Card (using correct field names)
          const progressBar = '█'.repeat(Math.floor(paymentProgress / 5)) + '░'.repeat(20 - Math.floor(paymentProgress / 5));
          
          infoBox('💰 PAYMENT BREAKDOWN', [
            `Total Contract: ${formatCurrency(booking.amount)}`,
            `Down Payment: ${formatCurrency(booking.downPayment)} ${colors.dim}(${paymentProgress}%)${colors.reset}`,
            `Outstanding: ${formatCurrency(booking.remainingBalance)}`,
            `Progress: ${colors.green}${progressBar}${colors.reset} ${paymentProgress}%`,
            `Payment Status: ${getPaymentStatus(booking) === 'paid' ? colors.green + '✓ Fully Paid' : getPaymentStatus(booking) === 'partial' ? colors.yellow + '🔄 Partial Payment' : colors.red + '⏳ No Payment'}${colors.reset}`,
            `Urgency: ${daysUntilEvent < 30 && booking.remainingBalance > 0 ? colors.red + '🚨 Payment Due Soon' : colors.green + '✅ On Schedule'}${colors.reset}`
          ], colors.green);
          
          // Action Items based on status and progress
          const actionItems = [];
          
          if (booking.status === 'request') {
            actionItems.push('• Wait for vendor approval');
            actionItems.push('• Check your email for updates');
          } else if (booking.remainingBalance > 0) {
            actionItems.push(`• Make remaining payment of ${formatCurrency(booking.remainingBalance)}`);
            if (daysUntilEvent < 30) {
              actionItems.push('• 🚨 URGENT: Payment due within 30 days');
            }
          }
          
          actionItems.push(`• Contact vendor at ${booking.contactPhone || 'contact number'}`);
          actionItems.push(`• Confirm final details before ${formatDate(booking.eventDate)}`);
          actionItems.push('• Review contract terms and conditions');
          
          if (actionItems.length > 0) {
            infoBox('📋 NEXT STEPS', actionItems, colors.yellow);
          }
          
        });
        
        // Executive Summary Dashboard
        header('📊 BOOKING PORTFOLIO SUMMARY', colors.cyan);
        
        const totalAmount = filteredBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
        const totalPaid = filteredBookings.reduce((sum, booking) => sum + (booking.downPayment || 0), 0);
        const totalBalance = filteredBookings.reduce((sum, booking) => sum + (booking.remainingBalance || 0), 0);
        const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = filteredBookings.filter(b => b.status === 'pending').length;
        const requestBookings = filteredBookings.filter(b => b.status === 'request').length;
        
        // Financial Overview
        console.log(`${colors.bright}${colors.white}💼 FINANCIAL OVERVIEW${colors.reset}`);
        console.log(`${colors.green}┌─────────────────────────────────────────┐${colors.reset}`);
        console.log(`${colors.green}│  Total Investment: ${formatCurrency(totalAmount).padEnd(25)} │${colors.reset}`);
        console.log(`${colors.green}│  Amount Paid:      ${formatCurrency(totalPaid).padEnd(25)} │${colors.reset}`);
        console.log(`${colors.green}│  Outstanding:      ${formatCurrency(totalBalance).padEnd(25)} │${colors.reset}`);
        console.log(`${colors.green}└─────────────────────────────────────────┘${colors.reset}`);
        
        // Booking Status Overview
        console.log(`\n${colors.bright}${colors.white}📈 BOOKING STATUS${colors.reset}`);
        console.log(`${colors.blue}┌─────────────────────────────────────────┐${colors.reset}`);
        console.log(`${colors.blue}│  Total Bookings:   ${String(filteredBookings.length).padStart(15)}     │${colors.reset}`);
        console.log(`${colors.blue}│  Confirmed:        ${String(confirmedBookings).padStart(15)}     │${colors.reset}`);
        console.log(`${colors.blue}│  Pending:          ${String(pendingBookings).padStart(15)}     │${colors.reset}`);
        console.log(`${colors.blue}│  Requests:         ${String(requestBookings).padStart(15)}     │${colors.reset}`);
        console.log(`${colors.blue}└─────────────────────────────────────────┘${colors.reset}`);
        
        // Progress Categories Summary
        const progressCounts = {};
        filteredBookings.forEach(booking => {
          const category = getProgressCategory(booking);
          progressCounts[category] = (progressCounts[category] || 0) + 1;
        });
        
        console.log(`\n${colors.bright}${colors.white}🎯 PROGRESS OVERVIEW${colors.reset}`);
        console.log(`${colors.magenta}┌─────────────────────────────────────────┐${colors.reset}`);
        Object.entries(progressCounts).forEach(([category, count]) => {
          const label = category.replace('-', ' ').toUpperCase().padEnd(15);
          console.log(`${colors.magenta}│  ${label}${String(count).padStart(15)}     │${colors.reset}`);
        });
        console.log(`${colors.magenta}└─────────────────────────────────────────┘${colors.reset}`);
        
        // Quick Actions
        console.log(`\n${colors.bright}${colors.yellow}⚡ QUICK ACTIONS AVAILABLE${colors.reset}`);
        console.log(`${colors.yellow}• Make payment online through your dashboard${colors.reset}`);
        console.log(`${colors.yellow}• Contact vendors directly for modifications${colors.reset}`);
        console.log(`${colors.yellow}• Download booking confirmations${colors.reset}`);
        console.log(`${colors.yellow}• Schedule appointment with wedding planner${colors.reset}`);
        
        // Filter Usage Tips
        if (!statusFilter) {
          console.log(`\n${colors.bright}${colors.cyan}💡 FILTER TIPS${colors.reset}`);
          console.log(`${colors.cyan}• Use --filter=urgent to see bookings needing immediate attention${colors.reset}`);
          console.log(`${colors.cyan}• Use --filter=in-progress to see partial payments${colors.reset}`);
          console.log(`${colors.cyan}• Use --filter=request to see pending approvals${colors.reset}`);
        }
        
      } else {
        header('📭 NO BOOKINGS FOUND', colors.yellow);
        
        infoBox('ℹ️  INFORMATION', [
          'No booking records exist for this user account.',
          '',
          'This could indicate:',
          '• User has not made any bookings yet',
          '• User ID might be incorrect or inactive',
          '• Bookings might be under a different account'
        ], colors.yellow);
        
        infoBox('🚀 GET STARTED', [
          '• Browse our vendor directory',
          '• Create your first booking',
          '• Contact our support team for assistance',
          '• Check your email for booking confirmations'
        ], colors.cyan);
      }
      
    } else {
      errorBox(`API request failed (${response.status})`);
      const errorText = await response.text();
      
      infoBox('🔍 ERROR DETAILS', [
        `HTTP Status: ${response.status} ${response.statusText}`,
        `Response: ${errorText}`,
        '',
        'Possible causes:',
        '• User ID does not exist in database',
        '• API server is temporarily unavailable',
        '• Network connectivity issues',
        '• Authentication or permission problems'
      ], colors.red);
      
      infoBox('🛠️  TROUBLESHOOTING', [
        '• Verify the user ID is correct',
        '• Check your internet connection',
        '• Try again in a few moments',
        '• Contact technical support if issue persists'
      ], colors.yellow);
    }
    
  } catch (error) {
    errorBox('Network connection failed');
    
    infoBox('⚠️  CONNECTION ERROR', [
      `Error: ${error.message}`,
      '',
      'Troubleshooting steps:',
      '• Check your internet connection',
      '• Verify the API server is running',
      '• Try again in a few moments',
      '• Contact IT support if problem continues'
    ], colors.red);
  }
  
  // Footer
  header('✨ SESSION COMPLETE', colors.green);
  console.log(`${colors.dim}Thank you for using Wedding Bazaar Booking Dashboard${colors.reset}`);
  console.log(`${colors.dim}For support, visit: https://weddingbazaar.ph/support${colors.reset}\n`);
}

// Run the check with help message
if (args.includes('--help') || args.includes('-h')) {
  header('📚 BOOKING DASHBOARD HELP', colors.cyan);
  
  infoBox('🔧 USAGE', [
    'node check-user-bookings.js [--filter=TYPE]',
    '',
    'Examples:',
    '• node check-user-bookings.js --filter=all',
    '• node check-user-bookings.js --filter=urgent',
    '• node check-user-bookings.js --filter=in-progress'
  ], colors.blue);
  
  infoBox('🏷️  AVAILABLE FILTERS', [
    ...Object.entries(availableFilters).map(([key, desc]) => `• ${key.padEnd(12)} - ${desc}`)
  ], colors.green);
  
  console.log(`\n${colors.dim}For more information, visit: https://weddingbazaar.ph/support${colors.reset}\n`);
} else {
  checkUserBookings();
}
