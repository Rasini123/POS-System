// import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE } from '../constants/config';
// // Generate text invoice for thermal printer
// export const generateTextInvoice = (invoiceData) => {
//   // Check if invoiceData is defined and has items
//   if (!invoiceData || !invoiceData.items) {
//     console.error('Invalid invoice data:', invoiceData);
//     return 'Error: Invalid invoice data';
//   }
  
//   const { items, subtotal = 0, discount = 0, tax = 0, total = 0, paidAmount = 0, changeAmount = 0, paymentMethod = '' } = invoiceData;
  
//   let itemsText = '';
  
//   // Check if items is an array and has length
//   if (Array.isArray(items) && items.length > 0) {
//     items.forEach(item => {
//       const name = (item.name || 'Unknown Product').substring(0, 24).padEnd(24, ' ');
//       const qty = (item.quantity || 0).toString().padStart(3, ' ');
//       const price = (item.price || 0).toFixed(2).padStart(7, ' ');
//       const itemTotal = ((item.price || 0) * (item.quantity || 0)).toFixed(2).padStart(7, ' ');
//       itemsText += `${name}${qty} ${price}  ${itemTotal}\n`;
//     });
//   } else {
//     itemsText = 'No items in cart\n';
//   }
  
//   let text = '';
//   text += '**************************************************\n';
//   text += `              ${COMPANY_NAME}\n`;
//   text += '         COMPUTER PARTS SPECIALISTS\n';
//   text += '**************************************************\n';
//   text += `Store: #T42\n`;
//   text += `Address: ${COMPANY_ADDRESS}\n`;
//   text += `Phone: ${COMPANY_PHONE}\n`;
//   text += `Email: support@${COMPANY_NAME.toLowerCase().replace(/\s/g, '')}.com\n`;
//   text += '--------------------------------\n';
//   text += `Invoice #: INV-${Date.now().toString().slice(-8)}\n`;
//   text += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n`;
//   text += 'Cashier: Admin User\n';
//   text += '-------------------------------------------------\n';
//   text += 'Item Name               Qty   Price   Total\n';
//   text += '-------------------------------------------------\n';
//   text += itemsText;
//   text += '=================================================\n';
//   text += `Subtotal:                Rs. ${subtotal.toFixed(2).padStart(10, ' ')}\n`;
//   text += `Discount:                Rs. ${discount.toFixed(2).padStart(10, ' ')}\n`;
//   text += `Tax (8%):                Rs. ${tax.toFixed(2).padStart(10, ' ')}\n`;
//   text += `Total Due:               Rs. ${total.toFixed(2).padStart(10, ' ')}\n`;
  
//   if (paidAmount > 0) {
//     text += `Paid:                    Rs. ${paidAmount.toFixed(2).padStart(10, ' ')}\n`;
//     text += `Change:                  Rs. ${changeAmount.toFixed(2).padStart(10, ' ')}\n`;
//   }
  
//   if (paymentMethod) {
//     text += `Payment Method:          ${paymentMethod.toUpperCase().padStart(10, ' ')}\n`;
//   }
  
//   text += '---------------------------------------------------\n';
//   text += '     Thank you for shopping with us!\n';
//   text += '      Your tech partner for life.\n';
//   text += '    Return Policy: 30 days with receipt.\n';
//   text += '**************************************************\n';
//   text += '\n\n\n'; // Feed paper for tear-off
  
//   return text;
// };
// // Direct print function for thermal printers
// export const printDirectToPrinter = (invoiceText) => {
//   try {
//     // Create a hidden iframe for printing
//     const iframe = document.createElement('iframe');
//     iframe.style.position = 'absolute';
//     iframe.style.left = '-9999px';
//     iframe.style.top = '0';
//     iframe.style.width = '1px';
//     iframe.style.height = '1px';
//     iframe.style.border = 'none';
    
//     document.body.appendChild(iframe);
    
//     const doc = iframe.contentDocument || iframe.contentWindow.document;
    
//     // Create print-friendly content
//     doc.open();
//     doc.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Print Receipt</title>
//           <style>
//             @media print {
//               body { 
//                 margin: 0; 
//                 padding: 0; 
//                 font-family: 'Courier New', monospace;
//                 font-size: 12px;
//                 width: 80mm; /* Standard receipt width */
//               }
//               .receipt {
//                 width: 80mm;
//                 padding: 5px;
//                 word-wrap: break-word;
//                 white-space: pre-wrap;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="receipt">${invoiceText.replace(/\n/g, '<br>')}</div>
//           <script>
//             // Auto-print and close
//             window.onload = function() {
//               window.print();
//               setTimeout(function() {
//                 window.parent.postMessage('closePrintWindow', '*');
//               }, 500);
//             };
//           </script>
//         </body>
//       </html>
//     `);
//     doc.close();
    
//     // Listen for close message
//     const handleMessage = (event) => {
//       if (event.data === 'closePrintWindow') {
//         document.body.removeChild(iframe);
//         window.removeEventListener('message', handleMessage);
//       }
//     };
    
//     window.addEventListener('message', handleMessage);
//   } catch (error) {
//     console.error('Error in direct printing:', error);
//     // Fallback to browser print
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Print Receipt</title>
//           <style>
//             body { 
//               margin: 0; 
//               padding: 10px; 
//               font-family: 'Courier New', monospace;
//               font-size: 12px;
//             }
//             @media print {
//               body { width: 80mm; }
//             }
//           </style>
//         </head>
//         <body onload="window.print(); setTimeout(() => window.close(), 500);">
//           <pre>${invoiceText}</pre>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   }
// };


import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE } from '../constants/config';
// Generate styled HTML invoice
export const generateHTMLInvoice = (invoiceData) => {
  if (!invoiceData || !invoiceData.items) {
    
    return '<p>Error: Invalid invoice data</p>';
  }
  const { items, subtotal = 0, discount = 0, tax = 0, total = 0, paidAmount = 0, changeAmount = 0, paymentMethod = '' } = invoiceData;
  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
  const invoiceDate = new Date().toLocaleDateString();
  const invoiceTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="receipt">
      <h2 class="company">${COMPANY_NAME}</h2>
      <p class="subtitle">COMPUTER PARTS SPECIALISTS</p>
      <hr>
      <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
      <p><strong>Date:</strong> ${invoiceDate} ${invoiceTime}</p>
      <p><strong>Cashier:</strong> Admin User</p>
      <hr>
      <table class="items">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${Array.isArray(items) && items.length > 0 
            ? items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.price.toFixed(2)}</td>
                <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')
            : `<tr><td colspan="4" class="empty">No items in cart</td></tr>`
          }
        </tbody>
      </table>
      <hr>
      <table class="totals">
        <tr><td>Subtotal:</td><td>Rs. ${subtotal.toFixed(2)}</td></tr>
        <tr><td>Discount:</td><td>-Rs. ${discount.toFixed(2)}</td></tr>
        <tr><td>Tax (8%):</td><td>Rs. ${tax.toFixed(2)}</td></tr>
        <tr class="total"><td><strong>Total:</strong></td><td><strong>Rs. ${total.toFixed(2)}</strong></td></tr>
        ${paidAmount > 0 ? `<tr><td>Paid:</td><td>Rs. ${paidAmount.toFixed(2)}</td></tr>` : ''}
        ${changeAmount > 0 ? `<tr><td>Change:</td><td>Rs. ${changeAmount.toFixed(2)}</td></tr>` : ''}
        ${paymentMethod ? `<tr><td>Payment:</td><td>${paymentMethod.toUpperCase()}</td></tr>` : ''}
      </table>
      <hr>
      <p class="thanks"><strong>Thank you for your business!</strong></p>
      <p class="footer-company"><strong>${COMPANY_NAME}</strong></p>
      <p class="footer-contact">${COMPANY_PHONE} • ${COMPANY_ADDRESS}</p>
      <p class="footer-email">support@${COMPANY_NAME.toLowerCase().replace(/\s/g, '')}.com</p>
      <p class="policy">Return Policy: 30 days with receipt</p>
    </div>
    <style>
      body { font-family: 'Arial', sans-serif; font-size: 12px; margin: 0; padding: 0; }
      .receipt { width: 80mm; margin: auto; text-align: center; }
      h2.company { font-size: 18px; margin: 5px 0; font-weight: bold; }
      .subtitle { font-size: 10px; margin-bottom: 10px; }
      hr { border: 0; border-top: 1px dashed #555; margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
      th, td { text-align: left; padding: 2px 0; font-size: 12px; }
      th { border-bottom: 1px solid #333; font-weight: bold; }
      td:last-child { text-align: right; }
      .totals td { font-size: 12px; padding: 2px 0; }
      .totals .total td { font-weight: bold; font-size: 13px; }
      .thanks { margin-top: 10px; font-size: 13px; font-weight: bold; }
      .footer-company { font-size: 12px; font-weight: bold; margin-top: 8px; }
      .footer-contact, .footer-email { font-size: 11px; font-weight: bold; margin: 2px 0; }
      .policy { font-size: 10px; margin-top: 6px; font-style: italic; font-weight: bold; }
      .empty { text-align: center; color: #888; font-style: italic; }
    </style>
  `;
};
// Direct print function for thermal printers
export const printDirectToPrinter = (invoiceHTML) => {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Print Receipt</title></head><body>${invoiceHTML}</body></html>`);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  } catch (error) {
    
    window.print();
  }
};