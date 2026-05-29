
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};


export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
};


export const validateDiscount = (value, type, subtotal, isAdmin = false) => {
  if (type === 'percent') {
    const percent = parseFloat(value);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      return { valid: false, error: 'Please enter a valid percentage between 0 and 100' };
    }
    if (percent > 5 && !isAdmin) {
      return { valid: false, error: 'Discounts over 5% require admin authorization' };
    }
    return { valid: true, amount: subtotal * (percent / 100) };
  } else {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < 0) {
      return { valid: false, error: 'Please enter a valid discount amount' };
    }
    if (amount > 500 && !isAdmin) {
      return { valid: false, error: 'Discounts over Rs. 500 require admin authorization' };
    }
    return { valid: true, amount: Math.min(amount, subtotal) };
  }
};