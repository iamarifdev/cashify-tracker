/**
 * Format currency with proper formatting for BDT/USD
 */
export const formatCurrency = (amount: number, currency = 'BDT'): string => {
  const absAmount = Math.abs(amount);

  // Format with Indian/Bangladeshi number system (lakhs, crores)
  if (absAmount >= 10000000) {
    return `${amount < 0 ? '-' : ''}${(absAmount / 10000000).toFixed(1)} crore`;
  } else if (absAmount >= 100000) {
    return `${amount < 0 ? '-' : ''}${(absAmount / 100000).toFixed(1)} lakh`;
  } else {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BDT',
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', '').replace('$', '').trim();
  }
};

/**
 * Format currency for display in tables
 */
export const formatCurrencyForTable = (amount: number): string => {
  return Math.abs(amount).toLocaleString('en-IN');
};