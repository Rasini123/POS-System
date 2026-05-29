
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format number with thousands separators
export const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};

// Format product name for display
export const formatProductName = (name, maxLength = 24) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};