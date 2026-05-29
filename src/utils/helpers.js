
export const formatCurrency = (amount, currencyFormat = 'lkr') => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyFormat === 'usd' ? 'USD' : currencyFormat === 'eur' ? 'EUR' : 'LKR'
  });
  
  if (currencyFormat === 'lkr') {
    return `Rs. ${amount.toFixed(2)}`;
  }
  
  return formatter.format(amount);
};

// Generate a random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};