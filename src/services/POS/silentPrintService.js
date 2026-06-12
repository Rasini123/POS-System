
const LINE_WIDTH = 42;
const PRINT_SERVER_URL = 'http://localhost:3001/print';

class SilentPrintService {
  constructor() {
    this.LINE_WIDTH = LINE_WIDTH;
  }

  // Helper methods for text formatting
  leftRight(left, right, width = this.LINE_WIDTH) {
    const space = width - (left.length + right.length);
    return left + ' '.repeat(space > 0 ? space : 1) + right;
  }

  divider(char = '-') {
    return char.repeat(this.LINE_WIDTH) + '\n';
  }

  center(text, width = this.LINE_WIDTH) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text + ' '.repeat(padding) + '\n';
  }

  formatCurrency(amount) {
    return parseFloat(amount).toFixed(2);
  }

  // Generate plain text bill format (same as the original thermal receipt)
  generateBillText(data, company) {
    const {
      items,
      subtotal,
      total,
      paymentMethod,
      paidAmount,
      changeAmount,
      date,
      time,
      invoiceNumber,
      totalProductDiscount,
      additionalCartDiscount
    } = data;

    const companyName = company.name || 'DCSICN CLUB';
    const companyPhone = company.phone || '070 - 731 4445';
    const companyAddress = company.address || 'No. 316/7, Thalangama North, Battaramulla.';
    const footerText = company.footerText || 'Thank you for your visit.';

    let text = '';

    // Header
    text += this.center('★ POS SYSTEM ★');
    text += '\n';
    text += this.center(companyName);
    text += this.center(companyPhone);
    text += this.center(companyAddress);
    text += this.divider('=');

    // Invoice Info
    text += this.leftRight('Invoice No:', invoiceNumber || 'N/A') + '\n';
    text += this.leftRight('Date:', `${date} ${time}`) + '\n';
    text += this.divider('-');

    // Items Header
    text += this.leftRight('Item', 'Qty  Price   Total') + '\n';
    text += this.divider('-');

    // Items List
    (items || []).forEach(item => {
      const itemName = item.name || '';
      const truncatedName = itemName.length > 28 ? itemName.slice(0, 28) : itemName;
      const quantity = item.quantity || 0;
      const price = item.discountedPrice || item.price || 0;
      const itemTotal = price * quantity;
      
      text += truncatedName + '\n';
      text += this.leftRight(
        '  ' + `${quantity} x ${this.formatCurrency(price)}`,
        this.formatCurrency(itemTotal)
      ) + '\n';
    });

    text += this.divider('-');

    // Totals
    text += this.leftRight('Subtotal:', this.formatCurrency(subtotal)) + '\n';
    
    if (totalProductDiscount > 0) {
      text += this.leftRight('Prod Discount:', '-' + this.formatCurrency(totalProductDiscount) + '\n');
    }
    if (additionalCartDiscount > 0) {
      text += this.leftRight('Add. Discount:', '-' + this.formatCurrency(additionalCartDiscount) + '\n');
    }
    
    text += this.divider('=');
    text += this.leftRight('TOTAL:', this.formatCurrency(total)) + '\n';
    text += this.divider('=');

    // Payment Info
    if (paidAmount > 0) {
        text += this.leftRight(`Paid (${paymentMethod}):`, this.formatCurrency(paidAmount)) + '\n';
    }
    if (changeAmount > 0) {
        text += this.leftRight('Change:', this.formatCurrency(changeAmount)) + '\n';
    }
    
    text += this.divider('-');

    // Footer
    text += '\n';
    text += this.center('★ THANK YOU ★');
    text += '\n';
    
    // Split footer text into multiple lines if it's too long
    const words = footerText.split(' ');
    let currentLine = '';
    words.forEach(word => {
        if ((currentLine + word).length > this.LINE_WIDTH) {
            text += this.center(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    if (currentLine.trim()) {
        text += this.center(currentLine.trim());
    }
    
    text += '\n\n\n\n\n\n'; // Extra space to clear the cutter

    return text;
  }

  // Send to local print server silently
  async printSilent(dataToPrint, companyDetails) {
    try {
      const printText = this.generateBillText(dataToPrint, companyDetails);
      
      const response = await fetch(PRINT_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: printText,
          printer: 'thermal-printer',
          copies: 1
        })
      });

      if (!response.ok) {
        let errorMsg = `Print server responded with status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }

      return { success: true };
    } catch (error) {
      console.error('Silent print error:', error);
      if (error.message.includes('Print server') || error.message.includes('Printer not')) {
        throw error;
      }
      throw new Error(`${error.message}. Is the print-server running on port 3001?`);
    }
  }

  // --- HISTORY PRINTING SUPPORT ---

  generateHistoryBillText(details, company) {
    const companyName = company?.name || 'R.S.BATHIK';
    const companyPhone = company?.phone || '+94 11 234 5678';
    const companyAddress = company?.address || 'Galle Road, Colombo, Sri Lanka';
    const footerText = company?.footerText || 'Thank you for shopping with us! Exchange possible within 7 days. Powered by R.S.Bathik POS';

    let text = '';

    // Header
    text += this.center('★ POS SYSTEM ★');
    text += '\n';
    text += this.center(companyName);
    text += this.center('Premium Bathik Clothing');
    text += this.center(companyAddress);
    text += this.center('Tel: ' + companyPhone);
    text += this.divider('-');

    const formattedDate = new Date(details.bill.pbd_bill_date).toLocaleString();

    // Invoice Info
    text += this.leftRight('Bill No:', details.bill.pbd_bill_no || 'N/A') + '\n';
    text += this.leftRight('Date:', formattedDate) + '\n';
    text += this.leftRight('Cashier:', details.cashier || 'Unknown') + '\n';
    text += this.divider('-');

    // Items List
    (details.items || []).forEach(item => {
      const itemName = item.productName || '';
      const truncatedName = itemName.length > 28 ? itemName.slice(0, 28) : itemName;
      const quantity = item.pid_qty || 0;
      const price = item.pid_unit_price || 0;
      const itemTotal = item.pid_total || (price * quantity);
      
      text += truncatedName + '\n';
      text += this.leftRight(
        '  ' + `${quantity} x LKR ${this.formatCurrency(price)}`,
        'LKR ' + this.formatCurrency(itemTotal)
      ) + '\n';
    });

    text += this.divider('-');

    // Totals
    text += this.leftRight('Subtotal:', 'LKR ' + this.formatCurrency(details.bill.pbd_total_amount)) + '\n';
    
    if (details.bill.pbd_discount > 0) {
      text += this.leftRight('Discount:', '-LKR ' + this.formatCurrency(details.bill.pbd_discount)) + '\n';
    }
    
    text += this.divider('=');
    text += this.leftRight('NET TOTAL:', 'LKR ' + this.formatCurrency(details.bill.pbd_net_total)) + '\n';
    text += this.divider('=');

    // Payment Info
    if (details.bill.pbd_payment_method) {
        text += this.leftRight(`Paid Via:`, details.bill.pbd_payment_method) + '\n';
    }
    
    text += this.divider('-');

    // Footer
    text += '\n';
    
    // Split footer text into multiple lines if it's too long
    const words = footerText.split(' ');
    let currentLine = '';
    words.forEach(word => {
        if ((currentLine + word).length > this.LINE_WIDTH) {
            text += this.center(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    if (currentLine.trim()) {
        text += this.center(currentLine.trim());
    }
    
    text += '\n\n\n\n\n\n'; // Extra space to clear the cutter

    return text;
  }

  async printHistorySilent(details, companyDetails) {
    try {
      const printText = this.generateHistoryBillText(details, companyDetails);
      
      const response = await fetch(PRINT_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: printText,
          printer: 'thermal-printer',
          copies: 1
        })
      });

      if (!response.ok) {
        let errorMsg = `Print server responded with status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }

      return { success: true };
    } catch (error) {
      console.error('Silent print error:', error);
      if (error.message.includes('Print server') || error.message.includes('Printer not')) {
        throw error;
      }
      throw new Error(`${error.message}. Is the print-server running on port 3001?`);
    }
  }
}

export default new SilentPrintService();
