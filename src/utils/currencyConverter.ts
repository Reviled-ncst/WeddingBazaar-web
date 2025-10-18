/**
 * Currency Conversion Utility
 * Converts budget ranges based on location/country
 */

// Exchange rates (base: USD) - Updated October 2025
export const EXCHANGE_RATES = {
  USD: 1,        // United States Dollar
  PHP: 56.50,    // Philippine Peso
  EUR: 0.92,     // Euro
  GBP: 0.79,     // British Pound
  AUD: 1.52,     // Australian Dollar
  CAD: 1.36,     // Canadian Dollar
  SGD: 1.34,     // Singapore Dollar
  JPY: 149.50,   // Japanese Yen
  CNY: 7.24,     // Chinese Yuan
  INR: 83.12,    // Indian Rupee
  MYR: 4.72,     // Malaysian Ringgit
  THB: 35.80,    // Thai Baht
  IDR: 15420,    // Indonesian Rupiah
  KRW: 1340,     // South Korean Won
  HKD: 7.82,     // Hong Kong Dollar
  NZD: 1.67,     // New Zealand Dollar
  MXN: 17.10,    // Mexican Peso
  BRL: 4.97,     // Brazilian Real
  AED: 3.67,     // UAE Dirham
  SAR: 3.75,     // Saudi Riyal
};

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  PHP: '₱',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  MYR: 'RM',
  THB: '฿',
  IDR: 'Rp',
  KRW: '₩',
  HKD: 'HK$',
  NZD: 'NZ$',
  MXN: 'MX$',
  BRL: 'R$',
  AED: 'د.إ',
  SAR: '﷼',
};

// Location to currency mapping
export const LOCATION_TO_CURRENCY: Record<string, string> = {
  // Philippines
  'Philippines': 'PHP',
  'Manila': 'PHP',
  'Cebu': 'PHP',
  'Davao': 'PHP',
  'Quezon': 'PHP',
  'Makati': 'PHP',
  'Taguig': 'PHP',
  'Pasig': 'PHP',
  'Boracay': 'PHP',
  'Palawan': 'PHP',
  
  // United States
  'United States': 'USD',
  'USA': 'USD',
  'New York': 'USD',
  'Los Angeles': 'USD',
  'Chicago': 'USD',
  'San Francisco': 'USD',
  'Las Vegas': 'USD',
  'Miami': 'USD',
  'Hawaii': 'USD',
  
  // Europe
  'France': 'EUR',
  'Germany': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Paris': 'EUR',
  'Rome': 'EUR',
  'Barcelona': 'EUR',
  
  // UK
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'England': 'GBP',
  'London': 'GBP',
  'Scotland': 'GBP',
  'Wales': 'GBP',
  
  // Asia Pacific
  'Australia': 'AUD',
  'Sydney': 'AUD',
  'Melbourne': 'AUD',
  'Canada': 'CAD',
  'Toronto': 'CAD',
  'Vancouver': 'CAD',
  'Singapore': 'SGD',
  'Japan': 'JPY',
  'Tokyo': 'JPY',
  'China': 'CNY',
  'Beijing': 'CNY',
  'Shanghai': 'CNY',
  'India': 'INR',
  'Delhi': 'INR',
  'Mumbai': 'INR',
  'Malaysia': 'MYR',
  'Kuala Lumpur': 'MYR',
  'Thailand': 'THB',
  'Bangkok': 'THB',
  'Phuket': 'THB',
  'Indonesia': 'IDR',
  'Bali': 'IDR',
  'Jakarta': 'IDR',
  'South Korea': 'KRW',
  'Seoul': 'KRW',
  'Hong Kong': 'HKD',
  'New Zealand': 'NZD',
  'Auckland': 'NZD',
  
  // Middle East & Latin America
  'Mexico': 'MXN',
  'Brazil': 'BRL',
  'UAE': 'AED',
  'Dubai': 'AED',
  'Saudi Arabia': 'SAR',
};

/**
 * Detect currency from location string
 */
export function detectCurrencyFromLocation(location: string | undefined | null): string {
  if (!location) return 'USD';
  
  const locationUpper = location.toUpperCase();
  
  // Check for direct matches first
  for (const [place, currency] of Object.entries(LOCATION_TO_CURRENCY)) {
    if (locationUpper.includes(place.toUpperCase())) {
      return currency;
    }
  }
  
  // Check for country codes in location
  if (locationUpper.includes('PH')) return 'PHP';
  if (locationUpper.includes('US')) return 'USD';
  if (locationUpper.includes('UK') || locationUpper.includes('GB')) return 'GBP';
  if (locationUpper.includes('AU')) return 'AUD';
  if (locationUpper.includes('CA')) return 'CAD';
  if (locationUpper.includes('SG')) return 'SGD';
  if (locationUpper.includes('JP')) return 'JPY';
  if (locationUpper.includes('CN')) return 'CNY';
  if (locationUpper.includes('IN')) return 'INR';
  if (locationUpper.includes('MY')) return 'MYR';
  if (locationUpper.includes('TH')) return 'THB';
  if (locationUpper.includes('ID')) return 'IDR';
  if (locationUpper.includes('KR')) return 'KRW';
  if (locationUpper.includes('HK')) return 'HKD';
  if (locationUpper.includes('NZ')) return 'NZD';
  if (locationUpper.includes('MX')) return 'MXN';
  if (locationUpper.includes('BR')) return 'BRL';
  if (locationUpper.includes('AE')) return 'AED';
  if (locationUpper.includes('SA')) return 'SAR';
  
  // Default to USD if no match
  return 'USD';
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
  const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
}

/**
 * Parse budget range string (e.g., "$1,000 - $2,500" or "₱50,000 - ₱150,000")
 */
export function parseBudgetRange(budgetRange: string): { min: number; max: number; currency: string } | null {
  if (!budgetRange) return null;
  
  // Detect currency from the string
  let currency = 'USD';
  for (const [curr, symbol] of Object.entries(CURRENCY_SYMBOLS)) {
    if (budgetRange.includes(symbol)) {
      currency = curr;
      break;
    }
  }
  
  // Extract numbers (remove currency symbols, commas, etc.)
  const numbers = budgetRange.match(/[\d,]+/g);
  if (!numbers || numbers.length < 2) return null;
  
  const min = parseFloat(numbers[0].replace(/,/g, ''));
  const max = parseFloat(numbers[1].replace(/,/g, ''));
  
  return { min, max, currency };
}

/**
 * Format currency amount with proper symbol and formatting
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  
  // Format based on currency
  if (currency === 'JPY' || currency === 'KRW' || currency === 'IDR') {
    // No decimals for these currencies
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  // Default formatting with 2 decimals
  return `${symbol}${amount.toLocaleString(undefined, { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Convert and format budget range based on location
 */
export function convertBudgetRange(
  budgetRange: string | undefined | null,
  eventLocation: string | undefined | null
): string {
  if (!budgetRange) return '';
  
  // Parse the original budget range
  const parsed = parseBudgetRange(budgetRange);
  if (!parsed) return budgetRange; // Return original if can't parse
  
  // Detect target currency from location
  const targetCurrency = detectCurrencyFromLocation(eventLocation);
  
  // If same currency, just return formatted version
  if (parsed.currency === targetCurrency) {
    return `${formatCurrency(parsed.min, targetCurrency)} - ${formatCurrency(parsed.max, targetCurrency)}`;
  }
  
  // Convert to target currency
  const convertedMin = convertCurrency(parsed.min, parsed.currency, targetCurrency);
  const convertedMax = convertCurrency(parsed.max, parsed.currency, targetCurrency);
  
  return `${formatCurrency(convertedMin, targetCurrency)} - ${formatCurrency(convertedMax, targetCurrency)}`;
}

/**
 * Get display with both original and converted currencies
 */
export function getBudgetRangeDisplay(
  budgetRange: string | undefined | null,
  eventLocation: string | undefined | null
): { display: string; converted: boolean; targetCurrency: string } {
  if (!budgetRange) {
    return { display: '', converted: false, targetCurrency: 'USD' };
  }
  
  const parsed = parseBudgetRange(budgetRange);
  if (!parsed) {
    return { display: budgetRange, converted: false, targetCurrency: 'USD' };
  }
  
  const targetCurrency = detectCurrencyFromLocation(eventLocation);
  
  // If same currency, no conversion needed
  if (parsed.currency === targetCurrency) {
    const display = `${formatCurrency(parsed.min, targetCurrency)} - ${formatCurrency(parsed.max, targetCurrency)}`;
    return { display, converted: false, targetCurrency };
  }
  
  // Convert and show both currencies
  const convertedMin = convertCurrency(parsed.min, parsed.currency, targetCurrency);
  const convertedMax = convertCurrency(parsed.max, parsed.currency, targetCurrency);
  
  const convertedDisplay = `${formatCurrency(convertedMin, targetCurrency)} - ${formatCurrency(convertedMax, targetCurrency)}`;
  
  return {
    display: convertedDisplay,
    converted: true,
    targetCurrency
  };
}
