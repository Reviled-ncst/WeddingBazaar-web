/**
 * DOWNLOAD & EXPORT UTILITIES
 * Separate file to handle download functionality without affecting existing components
 */

import type { ProcessedBookingData } from './bookingDataMapper';

export interface DownloadOptions {
  format: 'csv' | 'json' | 'pdf';
  includeFields?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Generate CSV content from booking data
 */
export const generateCSVContent = (bookings: ProcessedBookingData[], options?: DownloadOptions): string => {
  const defaultFields = [
    'ID',
    'Client Name', 
    'Service Type',
    'Event Date',
    'Event Location',
    'Guest Count',
    'Status',
    'Total Amount',
    'Payment Progress',
    'Contact Email',
    'Contact Phone',
    'Special Requests',
    'Created Date'
  ];

  const fields = options?.includeFields || defaultFields;
  
  // Create header row
  const headers = fields.join(',');
  
  // Filter by date range if specified
  let filteredBookings = bookings;
  if (options?.dateRange) {
    const startDate = new Date(options.dateRange.start);
    const endDate = new Date(options.dateRange.end);
    filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.eventDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }
  
  // Create data rows
  const rows = filteredBookings.map(booking => [
    booking.id,
    `"${booking.coupleName}"`,
    `"${booking.serviceType}"`,
    booking.eventDate,
    `"${booking.eventLocation}"`,
    booking.guestCount,
    booking.status.replace(/_/g, ' ').toUpperCase(),
    booking.formatted.totalAmount,
    booking.formatted.paymentProgress,
    booking.contactEmail,
    booking.contactPhone,
    `"${booking.specialRequests.replace(/"/g, '""')}"`, // Escape quotes in CSV
    new Date(booking.createdAt).toLocaleDateString()
  ].join(','));

  return [headers, ...rows].join('\n');
};

/**
 * Generate JSON content from booking data
 */
export const generateJSONContent = (bookings: ProcessedBookingData[], options?: DownloadOptions): string => {
  let filteredBookings = bookings;
  
  // Filter by date range if specified
  if (options?.dateRange) {
    const startDate = new Date(options.dateRange.start);
    const endDate = new Date(options.dateRange.end);
    filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.eventDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    totalBookings: filteredBookings.length,
    bookings: filteredBookings.map(booking => ({
      id: booking.id,
      clientName: booking.coupleName,
      serviceType: booking.serviceType,
      eventDetails: {
        date: booking.eventDate,
        time: booking.eventTime,
        location: booking.eventLocation,
        guestCount: booking.guestCount
      },
      contactInfo: {
        email: booking.contactEmail,
        phone: booking.contactPhone,
        preferredMethod: booking.preferredContactMethod
      },
      financial: {
        totalAmount: booking.totalAmount,
        totalPaid: booking.totalPaid,
        remainingBalance: booking.remainingBalance,
        paymentProgress: booking.paymentProgressPercentage
      },
      status: booking.status,
      specialRequests: booking.specialRequests,
      timestamps: {
        created: booking.createdAt,
        updated: booking.updatedAt
      }
    }))
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (vendorId: string, format: string, dateRange?: { start: string; end: string }): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const dateRangeStr = dateRange ? `_${dateRange.start}_to_${dateRange.end}` : '';
  return `vendor-${vendorId}-bookings${dateRangeStr}_${timestamp}.${format}`;
};

/**
 * Trigger download of content
 */
export const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Main download function
 */
export const downloadBookings = (
  bookings: ProcessedBookingData[], 
  vendorId: string, 
  options: DownloadOptions = { format: 'csv' }
) => {
  let content: string;
  let mimeType: string;
  
  switch (options.format) {
    case 'csv':
      content = generateCSVContent(bookings, options);
      mimeType = 'text/csv;charset=utf-8;';
      break;
    case 'json':
      content = generateJSONContent(bookings, options);
      mimeType = 'application/json;charset=utf-8;';
      break;
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
  
  const filename = generateFilename(vendorId, options.format, options.dateRange);
  triggerDownload(content, filename, mimeType);
};

/**
 * Generate summary report for download
 */
export const generateSummaryReport = (bookings: ProcessedBookingData[]): string => {
  const totalBookings = bookings.length;
  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const totalPaid = bookings.reduce((sum, booking) => sum + booking.totalPaid, 0);
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  
  const report = `
BOOKING SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

OVERVIEW
========
Total Bookings: ${totalBookings}
Total Revenue: ₱${totalRevenue.toLocaleString()}
Total Collected: ₱${totalPaid.toLocaleString()}
Average Booking Value: ₱${averageBookingValue.toLocaleString()}

STATUS BREAKDOWN
===============
${Object.entries(statusCounts)
  .map(([status, count]) => `${status.replace(/_/g, ' ').toUpperCase()}: ${count}`)
  .join('\n')}

RECENT BOOKINGS
==============
${bookings.slice(0, 5).map(booking => 
  `${booking.eventDate} - ${booking.coupleName} (${booking.serviceType}) - ${booking.formatted.totalAmount}`
).join('\n')}
`;

  return report.trim();
};
