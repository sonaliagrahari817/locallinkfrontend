/**
 * Formats a number or string amount into Indian Rupee format (INR).
 * Example: 150000 -> ₹1,50,000
 * Example: "$45" or "45" -> ₹45
 */
export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  
  // If string already contains ₹, return as is
  if (typeof amount === 'string' && amount.includes('₹')) {
    return amount;
  }

  // If string contains $, replace or clean up
  let numericVal = amount;
  if (typeof amount === 'string') {
    // Extract raw number
    const matches = amount.match(/[\d.]+/g);
    if (!matches) return amount; // Return string if no digits
    numericVal = parseFloat(matches.join(''));
  }

  if (isNaN(numericVal)) return '₹0';

  // Format using Indian locale
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(numericVal);

  return `₹${formatted}`;
};

/**
 * Parses and formats price text like "$45/hr" -> "₹499/hr" or formats raw values
 */
export const formatPriceText = (priceStr, fallbackHourly = 399) => {
  if (!priceStr) return `₹${fallbackHourly}/hr`;
  if (priceStr.includes('₹')) return priceStr;

  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return priceStr;

  // Convert USD-like dummy values to realistic INR amounts if small
  let inrValue = num;
  if (num < 500) {
    inrValue = Math.round(num * 15); // e.g. 35 -> ~525, 45 -> ~675, 120 -> 1800
  }

  const formatted = new Intl.NumberFormat('en-IN').format(inrValue);
  const suffix = priceStr.includes('/hr') ? '/hr' : '';
  return `₹${formatted}${suffix}`;
};
