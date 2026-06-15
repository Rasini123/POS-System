export const printInvoiceBrowser = (invoiceData, companyDetails) => {
  return new Promise((resolve, reject) => {
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      
      if (!printWindow) {
        reject(new Error('Popup blocked! Please allow popups for this site to print.'));
        return;
      }

      // Generate the HTML content for the receipt
      const htmlContent = generateReceiptHTML(invoiceData, companyDetails);
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        try {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            
            // Close after printing
            setTimeout(() => {
              printWindow.close();
              resolve();
            }, 500);
          }, 500);
        } catch (error) {
          printWindow.close();
          reject(new Error('Print failed: ' + error.message));
        }
      };

      // Fallback in case onload doesn't fire
      setTimeout(() => {
        if (printWindow.document.readyState === 'complete') {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            resolve();
          }, 500);
        }
      }, 1000);

    } catch (error) {
      reject(new Error('Print setup failed: ' + error.message));
    }
  });
};

const formatCurrency = (value) => {
  const amount = parseFloat(value) || 0;
  return `Rs. ${Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const generateReceiptHTML = (data, company) => {
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

  const companyName = company.name || 'R. S. Bathik';
  const companyPhone = company.phone || '070 - 731 4445';
  const companyAddress = company.address || 'No. 316/7, Thalangama North, Battaramulla.';
  const footerText = company.footerText || 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace;
        }
        body {
            width: 80mm; /* Standard thermal receipt width */
            margin: 0 auto;
            padding: 5mm;
            color: #000;
            background: #fff;
            font-size: 12px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .mb-1 { margin-bottom: 5px; }
        .mb-2 { margin-bottom: 10px; }
        .mb-4 { margin-bottom: 20px; }
        .mt-2 { margin-top: 10px; }
        .mt-4 { margin-top: 20px; }
        
        .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
        .divider-solid {
            border-top: 1px solid #000;
            margin: 5px 0;
        }
        
        .header h1 {
            font-size: 18px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 12px;
            line-height: 1.2;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 2px 0;
            vertical-align: top;
        }
        th {
            border-bottom: 1px dashed #000;
            text-align: left;
        }
        .col-qty { width: 15%; text-align: center; }
        .col-price { width: 25%; text-align: right; }
        .col-total { width: 30%; text-align: right; }
        .col-item { width: 30%; }
        
        .totals {
            margin-top: 10px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
        }
        .grand-total {
            font-size: 16px;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 11px;
        }
        
        @media print {
            body { width: 100%; margin: 0; padding: 0; }
            @page { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header text-center mb-4">
        ${company.logo ? `<img src="${company.logo}" style="max-width: 60px; margin-bottom: 5px;" />` : ''}
        <h1 class="font-bold">★ ${companyName} ★</h1>
        <p>${companyPhone}</p>
        <p>${companyAddress}</p>
    </div>
    
    <div class="mb-2">
        <div class="info-row">
            <span>Invoice:</span>
            <span>${invoiceNumber}</span>
        </div>
        <div class="info-row">
            <span>Date:</span>
            <span>${date} ${time}</span>
        </div>
    </div>
    
    <div class="divider"></div>
    
    <table>
        <thead>
            <tr>
                <th class="col-item">Item</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Price</th>
                <th class="col-total">Total</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => `
            <tr>
                <td class="col-item">${item.name}</td>
                <td class="col-qty">${item.quantity}</td>
                <td class="col-price">${formatCurrency(item.discountedPrice || item.price)}</td>
                <td class="col-total">${formatCurrency((item.discountedPrice || item.price) * item.quantity)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="divider"></div>
    
    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
        </div>
        ${totalProductDiscount > 0 ? `
        <div class="total-row">
            <span>Product Discount:</span>
            <span>-${formatCurrency(totalProductDiscount)}</span>
        </div>
        ` : ''}
        ${additionalCartDiscount > 0 ? `
        <div class="total-row">
            <span>Additional Discount:</span>
            <span>-${formatCurrency(additionalCartDiscount)}</span>
        </div>
        ` : ''}
        
        <div class="divider-solid"></div>
        
        <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(total)}</span>
        </div>
        
        <div class="divider-solid"></div>
        
        ${paidAmount > 0 ? `
        <div class="total-row">
            <span>Paid (${paymentMethod}):</span>
            <span>${formatCurrency(paidAmount)}</span>
        </div>
        ` : ''}
        ${changeAmount > 0 ? `
        <div class="total-row">
            <span>Change:</span>
            <span>${formatCurrency(changeAmount)}</span>
        </div>
        ` : ''}
    </div>
    
    <div class="footer mt-4">
        <p class="font-bold mb-1">★ THANK YOU ★</p>
        <p>${footerText}</p>
    </div>
</body>
</html>
  `;
};
