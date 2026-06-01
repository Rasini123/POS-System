import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiSearch, FiCalendar, FiClock, FiFileText, FiPrinter, 
  FiDollarSign, FiUser, FiCreditCard, FiX, FiCheckCircle 
} from 'react-icons/fi';
import { invoiceService } from '../../services/POS/invoiceService';

const TransactionsHistory = () => {
  const { darkMode } = useSelector((state) => state.ui);
  const products = useSelector(state => state.product?.allProducts || []);
  
  // Lists
  const [bills, setBills] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedBillDetails, setSelectedBillDetails] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Alerts
  const [alertShow, setAlertShow] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const loadBills = async () => {
    setLoading(true);
    try {
      const fetchedBills = await invoiceService.getAllBills();
      
      const list = Array.isArray(fetchedBills) ? fetchedBills : (fetchedBills?.Bills || fetchedBills?.ResultSet || []);
      const itemsList = []; // Array.isArray(fetchedItems) ? fetchedItems : (fetchedItems?.ResultSet || fetchedItems || []);
      
      const sorted = [...list].sort((a, b) => new Date(b.BillDate || b.CreateDate) - new Date(a.BillDate || a.CreateDate));
      
      const formattedBills = sorted.map(b => ({
        pbd_bill_id: String(b.BillId || b.BillNo),
        pbd_bill_no: b.BillNo || String(b.BillId),
        pbd_bill_date: b.BillDate || b.CreateDate,
        pbd_total_amount: Number(b.TotalAmount || b.NetAmount || 0),
        pbd_discount_amount: Number(b.DiscountAmount || 0),
        pbd_net_amount: Number(b.NetAmount || b.TotalAmount || 0),
        pbd_payment_type: b.PaymentType || 'CASH',
        cashier: `User ${b.CreatedBy || b.UserId || '1'}`
      }));

      setBills(formattedBills);
      setBillItems(itemsList);
    } catch (error) {
      triggerAlert('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    loadBills();
    return () => { mounted = false; };
  }, []);

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setAlertShow(true);
    setTimeout(() => setAlertShow(false), 3000);
  };

  const handleSelectBill = (billIdStr) => {
    const bill = bills.find(b => b.pbd_bill_id === billIdStr);
    if (!bill) return;

    // Filter raw API items by BillId or BillNo
    const itemsForThisTxn = billItems.filter(bi => String(bi.BillId) === billIdStr || String(bi.BillNo) === billIdStr);

    const formattedItems = itemsForThisTxn.map(bi => {
      const prod = products.find(p => String(p.ProductId) === String(bi.ProductId)) || {};
      return {
        productName: prod.ProductName || `Product ${bi.ProductId}`,
        pid_qty: Number(bi.Qty || 1),
        pid_unit_price: Number(bi.UnitPrice || 0),
        pid_total: Number(bi.Total || Number(bi.Qty || 1) * Number(bi.UnitPrice || 0))
      };
    });

    setSelectedBill(bill);
    setSelectedBillDetails({
      bill: bill,
      cashier: bill.cashier,
      items: formattedItems
    });
  };

  const getDetailsForPrint = (billIdStr) => {
    const bill = bills.find(b => b.pbd_bill_id === billIdStr);
    if (!bill) return null;
    const itemsForThisTxn = billItems.filter(bi => String(bi.BillId) === billIdStr || String(bi.BillNo) === billIdStr);
    const formattedItems = itemsForThisTxn.map(bi => {
      const prod = products.find(p => String(p.ProductId) === String(bi.ProductId)) || {};
      return {
        productName: prod.ProductName || `Product ${bi.ProductId}`,
        pid_qty: Number(bi.Qty || 1),
        pid_unit_price: Number(bi.UnitPrice || 0),
        pid_total: Number(bi.Total || Number(bi.Qty || 1) * Number(bi.UnitPrice || 0))
      };
    });
    return {
      bill: bill,
      cashier: bill.cashier,
      items: formattedItems
    };
  };

  const handlePrint = (billId) => {
    const details = getDetailsForPrint(String(billId));
    if (!details) return;
    
    // Simple inline print layout using window.open
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    
    const itemsHtml = details.items.map(item => `
      <tr>
        <td style="padding: 4px 0; font-size: 13px;">
          ${item.productName}<br/>
          <span style="font-size:11px; color:#555;">${item.pid_qty} x LKR ${item.pid_unit_price.toFixed(2)}</span>
        </td>
        <td style="text-align: right; vertical-align: top; padding: 4px 0; font-size: 13px;">
          LKR ${item.pid_total.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const formattedDate = new Date(details.bill.pbd_bill_date).toLocaleString();

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${details.bill.pbd_bill_no}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 15px; width: 280px; color: #000; }
            .text-center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .header-title { font-size: 18px; font-weight: bold; margin-bottom: 3px; }
            table { width: 100%; border-collapse: collapse; }
            .footer { font-size: 11px; margin-top: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="header-title">R.S.BATHIK</div>
            <div style="font-size: 12px;">Premium Bathik Clothing</div>
            <div style="font-size: 11px;">Galle Road, Colombo, Sri Lanka</div>
            <div style="font-size: 11px;">Tel: +94 11 234 5678</div>
          </div>
          <div class="divider"></div>
          <div style="font-size: 12px; line-height: 1.4;">
            <b>Bill No :</b> ${details.bill.pbd_bill_no}<br/>
            <b>Date    :</b> ${formattedDate}<br/>
            <b>Cashier :</b> ${details.cashier}<br/>
          </div>
          <div class="divider"></div>
          <table>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <div style="font-size: 13px; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span>LKR ${details.bill.pbd_total_amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-style: italic;">
              <span>Discount:</span>
              <span>-LKR ${details.bill.pbd_discount_amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 4px;">
              <span>NET TOTAL:</span>
              <span>LKR ${details.bill.pbd_net_amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size:12px; margin-top: 4px;">
              <span>Paid Via:</span>
              <span>${details.bill.pbd_payment_type}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="footer">
            Thank you for shopping with us!<br/>
            Exchange possible within 7 days.<br/>
            <b>Powered by R.S.Bathik POS</b>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    triggerAlert('Sending receipt to printer...');
  };

  // Filter Logic
  const filteredBills = bills.filter(b => {
    const matchSearch = b.pbd_bill_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPayment = paymentFilter === 'all' || b.pbd_payment_type.toLowerCase() === paymentFilter.toLowerCase();
    
    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && new Date(b.pbd_bill_date) >= new Date(startDate);
    }
    if (endDate) {
      // Set end date to end of the day
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      matchDate = matchDate && new Date(b.pbd_bill_date) <= eDate;
    }
    return matchSearch && matchPayment && matchDate;
  });

  return (
    <div className={`flex flex-col p-6 rounded-2xl shadow-xl h-full overflow-hidden transition-all duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
    } border`}>

      {/* Alert */}
      {alertShow && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 font-bold">
            <FiCheckCircle className="text-green-600 w-5 h-5" />
            {alertMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg text-white">
          <FiFileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-xs opacity-75">View, filter, and reprint previous billing records</p>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase opacity-75 tracking-wider">Bill Number</label>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. RSB-B-10001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase opacity-75 tracking-wider">Pay Method</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
            }`}
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase opacity-75 tracking-wider">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-700'
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase opacity-75 tracking-wider">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-700'
            }`}
          />
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Bills Table */}
        <div className="flex-1 overflow-auto rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}`}>
                <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Bill Number</th>
                <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Date/Time</th>
                <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Payment</th>
                <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-right">Net Amount</th>
                <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p>Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No transactions found for the given filters.
                  </td>
                </tr>
              ) : filteredBills.map((b) => (
                <tr 
                  key={b.pbd_bill_id} 
                  onClick={() => handleSelectBill(b.pbd_bill_id)}
                  className={`cursor-pointer transition-colors ${
                    selectedBill?.pbd_bill_id === b.pbd_bill_id
                      ? (darkMode ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100')
                      : (darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50')
                  }`}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                    {b.pbd_bill_no}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                    <div className="font-semibold">{new Date(b.pbd_bill_date).toLocaleDateString()}</div>
                    <div className="opacity-60 flex items-center gap-1 mt-0.5"><FiClock /> {new Date(b.pbd_bill_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      b.pbd_payment_type === 'Cash' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {b.pbd_payment_type === 'Cash' ? <FiDollarSign className="w-3" /> : <FiCreditCard className="w-3" />}
                      {b.pbd_payment_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-right">
                    LKR {b.pbd_net_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(b.pbd_bill_id);
                      }}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
                      title="Reprint Bill"
                    >
                      <FiPrinter className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBills.length === 0 && (
            <div className="text-center py-16">
              <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold opacity-75">No transactions found</p>
              <p className="text-xs opacity-60">Complete a sale on the POS screen to record a transaction</p>
            </div>
          )}
        </div>

        {/* Selected Bill Detailed Sidebar */}
        {selectedBillDetails && (
          <div className={`w-full md:w-80 rounded-2xl p-5 border flex flex-col overflow-hidden animate-slide-in-right ${
            darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{selectedBill.pbd_bill_no}</h3>
                <span className="text-[11px] opacity-60">Receipt Details</span>
              </div>
              <button 
                onClick={() => { setSelectedBill(null); setSelectedBillDetails(null); }}
                className="hover:opacity-75"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Info */}
            <div className="space-y-2.5 text-xs border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="opacity-60 flex items-center gap-1"><FiCalendar /> Date & Time:</span>
                <span className="font-semibold">{new Date(selectedBill.pbd_bill_date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60 flex items-center gap-1"><FiUser /> Cashier:</span>
                <span className="font-semibold">{selectedBillDetails.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60 flex items-center gap-1"><FiCreditCard /> Payment:</span>
                <span className="font-semibold">{selectedBill.pbd_payment_type}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-auto mb-4 pr-1 space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider opacity-60">Items purchased</span>
              {selectedBillDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-dashed border-gray-200 dark:border-gray-750 pb-2">
                  <div className="pr-2">
                    <p className="font-bold">{item.productName}</p>
                    <p className="opacity-60 mt-0.5">{item.pid_qty} x LKR {item.pid_unit_price.toLocaleString()}</p>
                  </div>
                  <span className="font-bold whitespace-nowrap">LKR {item.pid_total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="mt-auto space-y-2 border-t pt-4 border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex justify-between">
                <span className="opacity-70">Subtotal:</span>
                <span className="font-semibold">LKR {selectedBill.pbd_total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-red-500 font-medium">
                <span>Discount:</span>
                <span>-LKR {selectedBill.pbd_discount_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-2 border-dashed border-gray-200 dark:border-gray-700">
                <span>NET TOTAL:</span>
                <span className="text-blue-600 dark:text-blue-400">LKR {selectedBill.pbd_net_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              <button
                onClick={() => handlePrint(selectedBill.pbd_bill_id)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow"
              >
                <FiPrinter /> Print Receipt
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default TransactionsHistory;
