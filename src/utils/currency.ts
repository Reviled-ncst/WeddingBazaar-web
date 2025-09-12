/**
 * Currency utilities for PHP (Philippine Peso) formatting
 */

export const formatPHP = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPHPCompact = (amount: number): string => {
  if (amount >= 1000000) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  }
  return formatPHP(amount);
};

export const parsePHP = (formattedAmount: string): number => {
  // Remove PHP symbol, commas, and convert to number
  const cleanAmount = formattedAmount.replace(/[₱,\s]/g, '');
  return parseFloat(cleanAmount) || 0;
};

export const formatPHPRange = (min: number, max: number): string => {
  if (min === max) {
    return formatPHP(min);
  }
  return `${formatPHP(min)} - ${formatPHP(max)}`;
};

export const calculatePercentage = (amount: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((amount / total) * 100);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage}%`;
};

export const calculateDownpayment = (totalAmount: number, percentage: number = 30): number => {
  return (totalAmount * percentage) / 100;
};

export const calculateRemainingBalance = (totalAmount: number, paidAmount: number): number => {
  return Math.max(0, totalAmount - paidAmount);
};

export const getPaymentStatus = (totalAmount: number, paidAmount: number): {
  status: 'unpaid' | 'partial' | 'full';
  percentage: number;
  remaining: number;
} => {
  const percentage = calculatePercentage(paidAmount, totalAmount);
  const remaining = calculateRemainingBalance(totalAmount, paidAmount);
  
  let status: 'unpaid' | 'partial' | 'full' = 'unpaid';
  
  if (paidAmount === 0) {
    status = 'unpaid';
  } else if (paidAmount >= totalAmount) {
    status = 'full';
  } else {
    status = 'partial';
  }
  
  return {
    status,
    percentage,
    remaining
  };
};

export const formatPaymentSummary = (totalAmount: number, paidAmount: number) => {
  const paymentStatus = getPaymentStatus(totalAmount, paidAmount);
  
  return {
    totalAmount: formatPHP(totalAmount),
    paidAmount: formatPHP(paidAmount),
    remainingBalance: formatPHP(paymentStatus.remaining),
    percentage: formatPercentage(paymentStatus.percentage),
    status: paymentStatus.status,
    isFullyPaid: paymentStatus.status === 'full',
    isPartiallyPaid: paymentStatus.status === 'partial',
    isUnpaid: paymentStatus.status === 'unpaid'
  };
};

// Validation helpers
export const isValidPHPAmount = (amount: number): boolean => {
  return amount >= 0 && Number.isFinite(amount);
};

export const sanitizePHPAmount = (amount: number): number => {
  if (!isValidPHPAmount(amount)) return 0;
  return Math.round(amount * 100) / 100; // Round to 2 decimal places
};

// Payment plan calculations
export const calculateInstallmentPlan = (
  totalAmount: number, 
  downpaymentPercentage: number = 30, 
  installments: number = 3
): {
  downpayment: number;
  installmentAmount: number;
  installments: Array<{
    number: number;
    amount: number;
    formatted: string;
  }>;
  total: number;
} => {
  const downpayment = calculateDownpayment(totalAmount, downpaymentPercentage);
  const remainingAmount = totalAmount - downpayment;
  const installmentAmount = remainingAmount / installments;
  
  const installmentPlan = Array.from({ length: installments }, (_, index) => ({
    number: index + 1,
    amount: installmentAmount,
    formatted: formatPHP(installmentAmount)
  }));
  
  return {
    downpayment,
    installmentAmount,
    installments: installmentPlan,
    total: totalAmount
  };
};

export default {
  formatPHP,
  formatPHPCompact,
  parsePHP,
  formatPHPRange,
  calculatePercentage,
  formatPercentage,
  calculateDownpayment,
  calculateRemainingBalance,
  getPaymentStatus,
  formatPaymentSummary,
  isValidPHPAmount,
  sanitizePHPAmount,
  calculateInstallmentPlan
};
