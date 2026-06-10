import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiSearch, FiCalendar, FiClock, FiFileText, FiDollarSign, 
  FiUser, FiCreditCard, FiX, FiCheckCircle, FiAlertCircle, 
  FiCornerUpLeft, FiActivity, FiArrowRight, FiInfo
} from 'react-icons/fi';
import { returnService } from '../../services/POS/returnService';
import { billService } from '../../services/POS/billService';
import { productService } from '../../services/POS/ProductService';

const ReturnsPage = () => {
  const { darkMode } = useSelector((state) => state.ui);
  
  // Tab State: 'process' = Lookup & Process Returns, 'records' = All Return Records, 'summary' = Return Summary Dashboard
  const [activeTab, setActiveTab] = useState('process');
  
  // Data Lists
  const [returnRecords, setReturnRecords] = useState([]);
  const [summaryData, setSummaryData] = useState({
    TotalReturnsCount: 0,
    TotalReturnedQty: 0,
    TotalRefundAmount: 0,
    TopReturnedProducts: [],
    RecentReturns: []
  });
  const [allProducts, setAllProducts] = useState([]);
  const [allBillItems, setAllBillItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Process States
  const [billSearchId, setBillSearchId] = useState('');
  const [searchedBill, setSearchedBill] = useState(null);
  const [searchedBillItems, setSearchedBillItems] = useState([]);
  const [alreadyReturnedQtys, setAlreadyReturnedQtys] = useState({}); // maps BillItemId -> qty
  const [returnQtysInput, setReturnQtysInput] = useState({}); // maps BillItemId -> input value
  const [searchLoading, setSearchLoading] = useState(false);
  const [processingReturnId, setProcessingReturnId] = useState(null);
  const [processingFullBill, setProcessingFullBill] = useState(false);

  // Alerts
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load basic details
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [fetchedReturns, fetchedSummary, fetchedProducts, fetchedBillItems] = await Promise.all([
        returnService.getAllReturns(),
        returnService.getReturnSummary(),
        productService.getAllProducts().catch(() => []),
        billService.getAllBillItems().catch(() => [])
      ]);
      
      setReturnRecords(Array.isArray(fetchedReturns) ? fetchedReturns : []);
      setAllProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      setAllBillItems(Array.isArray(fetchedBillItems) ? fetchedBillItems : []);
      
      if (fetchedSummary) {
        const returnsList = Array.isArray(fetchedReturns) ? fetchedReturns : [];
        const calculatedTotalRefund = returnsList.reduce((sum, r) => sum + getRefundAmount(r, fetchedBillItems), 0);
        const calculatedProductSummary = Object.values(returnsList.reduce((summary, record) => {
          const productName = record.ProductName || `Product ${record.ProductId}`;
          if (!summary[productName]) {
            summary[productName] = { productName, returnedQty: 0, refundAmount: 0 };
          }
          summary[productName].returnedQty += Number(record.ReturnedQty || 0);
          summary[productName].refundAmount += getRefundAmount(record, fetchedBillItems);
          return summary;
        }, {})).sort((a, b) => b.refundAmount - a.refundAmount);

        setSummaryData({
          TotalReturnsCount: fetchedSummary.TotalReturnsCount || returnsList.length || 0,
          TotalReturnedQty: fetchedSummary.TotalReturnedQty || returnsList.reduce((sum, r) => sum + Number(r.ReturnedQty || 0), 0),
          TotalRefundAmount: calculatedTotalRefund || fetchedSummary.TotalRefundAmount || 0,
          TopReturnedProducts: calculatedProductSummary.length > 0 ? calculatedProductSummary : (fetchedSummary.TopReturnedProducts || []),
          RecentReturns: returnsList.length > 0 ? returnsList.slice(0, 5) : (fetchedSummary.RecentReturns || [])
        });
      }
    } catch (error) {
      triggerAlert('Failed to load returns data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [autoLookupId, setAutoLookupId] = useState('');

  useEffect(() => {
    loadInitialData();
    const savedBillId = sessionStorage.getItem('return_bill_id');
    if (savedBillId) {
      sessionStorage.removeItem('return_bill_id');
      setAutoLookupId(savedBillId);
      setBillSearchId(savedBillId);
    }
  }, []);

  useEffect(() => {
    if (autoLookupId && allProducts.length > 0) {
      handleBillLookup(autoLookupId);
      setAutoLookupId('');
    }
  }, [autoLookupId, allProducts]);

  const triggerAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  // Search bill to perform return
  const handleBillLookup = async (idToSearch = billSearchId) => {
    const searchId = typeof idToSearch === 'string' ? idToSearch : billSearchId;
    if (!searchId.trim()) {
      triggerAlert('Please enter a valid Bill ID or Bill Number.', 'error');
      return;
    }
    setSearchLoading(true);
    setSearchedBill(null);
    setSearchedBillItems([]);
    setAlreadyReturnedQtys({});
    setReturnQtysInput({});
    
    try {
      // 1. Fetch bill details
      const bill = await billService.getBillById(searchId.trim());
      if (!bill || (!bill.BillId && !bill.pbd_bill_id)) {
        triggerAlert('Bill not found. Please verify the ID.', 'error');
        setSearchLoading(false);
        return;
      }

      const cleanBillId = bill.BillId || bill.pbd_bill_id;

      // 2. Fetch all bill items & filter for this bill
      const allBillItems = await billService.getAllBillItems();
      const filteredItems = allBillItems.filter(item => 
        String(item.BillId || item.pid_bill_id) === String(cleanBillId)
      );

      if (filteredItems.length === 0) {
        triggerAlert('No items found for this bill in database records.', 'error');
        setSearchLoading(false);
        return;
      }

      // 3. Fetch already returned quantities for this bill
      const returnsForBill = await returnService.getReturnsByBillId(cleanBillId);
      
      const returnedMap = {};
      returnsForBill.forEach(ret => {
        const itemKey = String(ret.BillItemId);
        returnedMap[itemKey] = (returnedMap[itemKey] || 0) + parseInt(ret.ReturnedQty || 0);
      });

      // 4. Map items
      const mappedItems = filteredItems.map(item => {
        const itemKey = String(item.BillItemId || item.pid_billitem_id || item.id);
        const prod = allProducts.find(p => String(p.ProductId || p.ppd_product_id) === String(item.ProductId || item.pid_product_id)) || {};
        return {
          ...item,
          id: itemKey,
          productName: prod.ProductName || prod.ppd_product_name || `Product ${item.ProductId || item.pid_product_id}`,
          productCode: prod.ProductCode || prod.ppd_product_code || '-',
          qty: parseInt(item.Qty || item.pid_qty || 1),
          unitPrice: parseFloat(item.UnitPrice || item.pid_unit_price || 0),
          total: parseFloat(item.Total || item.pid_total || 0)
        };
      });

      setSearchedBill(bill);
      setSearchedBillItems(mappedItems);
      setAlreadyReturnedQtys(returnedMap);
      
      // Initialize return input quantities to 1 for returnable items
      const initialInputs = {};
      mappedItems.forEach(item => {
        const returned = returnedMap[item.id] || 0;
        const available = item.qty - returned;
        if (available > 0) {
          initialInputs[item.id] = 1;
        }
      });
      setReturnQtysInput(initialInputs);
      
      triggerAlert('Bill loaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to load bill. Check connections.', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  // Process item return
  const handleMarkReturn = async (item) => {
    const qtyToReturn = parseInt(returnQtysInput[item.id]);
    const alreadyReturned = alreadyReturnedQtys[item.id] || 0;
    const available = item.qty - alreadyReturned;

    if (isNaN(qtyToReturn) || qtyToReturn <= 0) {
      triggerAlert('Please enter a valid quantity to return.', 'error');
      return;
    }

    if (qtyToReturn > available) {
      triggerAlert(`Cannot return ${qtyToReturn} units. Only ${available} available.`, 'error');
      return;
    }

    setProcessingReturnId(item.id);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.UserId || userData?.LogId || 1;

      // Call API
      await returnService.markReturn(item.id, qtyToReturn, userId);
      
      // Update already returned quantities in UI
      setAlreadyReturnedQtys(prev => ({
        ...prev,
        [item.id]: alreadyReturned + qtyToReturn
      }));

      // Reset input qty
      const newAvailable = available - qtyToReturn;
      setReturnQtysInput(prev => {
        const updated = { ...prev };
        if (newAvailable > 0) {
          updated[item.id] = 1;
        } else {
          delete updated[item.id];
        }
        return updated;
      });

      triggerAlert(`Successfully returned ${qtyToReturn} units of ${item.productName}.`, 'success');
      
      // Reload lists in background
      loadInitialData();
    } catch (error) {
      triggerAlert(error.message || 'Failed to process return.', 'error');
    } finally {
      setProcessingReturnId(null);
    }
  };

  const handleReturnFullBill = async () => {
    const returnableItems = searchedBillItems.filter(item => {
      const returned = alreadyReturnedQtys[item.id] || 0;
      return item.qty - returned > 0;
    });

    if (returnableItems.length === 0) {
      triggerAlert('All items in this bill are already fully returned.', 'error');
      return;
    }

    setProcessingFullBill(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.UserId || userData?.LogId || 1;

      for (const item of returnableItems) {
        const alreadyReturned = alreadyReturnedQtys[item.id] || 0;
        const available = item.qty - alreadyReturned;
        await returnService.markReturn(item.id, available, userId);
      }

      const updatedReturnedQtys = { ...alreadyReturnedQtys };
      returnableItems.forEach(item => {
        updatedReturnedQtys[item.id] = item.qty;
      });

      setAlreadyReturnedQtys(updatedReturnedQtys);
      setReturnQtysInput({});
      triggerAlert(`Returned all remaining items for ${searchedBill.BillNo || searchedBill.pbd_bill_no}.`, 'success');
      await loadInitialData();
    } catch (error) {
      triggerAlert(error.message || 'Failed to process full bill return.', 'error');
    } finally {
      setProcessingFullBill(false);
    }
  };

  // Helper formatting LKR currency
  const fmtLKR = (num) => {
    return 'LKR ' + Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getBillItemUnitPrice = (billItemId, billItems = allBillItems) => {
    const item = billItems.find(bi => String(bi.BillItemId || bi.pid_billitem_id || bi.id) === String(billItemId));
    return Number(item?.UnitPrice || item?.pid_unit_price || 0);
  };

  const getRefundAmount = (record, billItems = allBillItems) => {
    const qty = Number(record.ReturnedQty || record.returnedQty || 0);
    const unitPrice = Number(record.UnitPrice || record.unitPrice || 0) || getBillItemUnitPrice(record.BillItemId, billItems);
    const apiRefund = Number(record.TotalRefund || record.RefundAmount || record.pbd_return_amount || 0);

    return qty > 0 && unitPrice > 0 ? qty * unitPrice : apiRefund;
  };

  return (
    <div className={`flex flex-col p-6 rounded-2xl shadow-xl h-full overflow-hidden transition-all duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
    } border`}>

      {/* Toast Alert */}
      {alert.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 font-bold border ${
            alert.type === 'success' 
              ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
              : 'bg-rose-100 border-rose-300 text-rose-800'
          }`}>
            {alert.type === 'success' ? <FiCheckCircle className="w-5 h-5 text-emerald-600" /> : <FiAlertCircle className="w-5 h-5 text-rose-600" />}
            {alert.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg text-white">
            <FiCornerUpLeft className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Returns & Exchanges</h1>
            <p className="text-xs opacity-75">Mark customer item returns, search history, and track refunds</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800 self-start md:self-center">
          <button
            onClick={() => setActiveTab('process')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'process' 
                ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            Process Return
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'records'
                ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            Return Records
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* main scroll container */}
      <div className="flex-grow overflow-auto pr-1">

        {/* TAB 1: PROCESS RETURN */}
        {activeTab === 'process' && (
          <div className="space-y-6">
            
            {/* Bill Lookup Bar */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h2 className="text-sm font-bold uppercase opacity-75 mb-3 tracking-wider flex items-center gap-1.5"><FiSearch /> Lookup Sale Invoice</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter Bill ID or Bill Number (e.g. 1 or RSB-B-10001)"
                  value={billSearchId}
                  onChange={(e) => setBillSearchId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleBillLookup(); }}
                  className={`flex-1 px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={handleBillLookup}
                  disabled={searchLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : 'Find Bill'}
                </button>
              </div>
            </div>

            {/* Searched Bill Content */}
            {searchedBill ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                
                {/* Bill details card */}
                <div className={`lg:col-span-1 p-5 rounded-2xl border flex flex-col justify-between h-fit ${
                  darkMode ? 'bg-gray-850 border-gray-750' : 'bg-gray-50/50 border-gray-200'
                }`}>
                  <div>
                    <h3 className="font-bold text-lg text-rose-600 dark:text-rose-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-1">
                      <FiFileText /> Invoice Info
                    </h3>
                    <div className="space-y-3.5 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-60">Bill ID:</span>
                        <span className="font-semibold">{searchedBill.BillId || searchedBill.pbd_bill_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Bill Number:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{searchedBill.BillNo || searchedBill.pbd_bill_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Date:</span>
                        <span className="font-semibold">{new Date(searchedBill.BillDate || searchedBill.pbd_bill_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Payment Method:</span>
                        <span className="font-semibold flex items-center gap-1">
                          {String(searchedBill.PaymentType || searchedBill.pbd_payment_type).toLowerCase() === 'cash' ? <FiDollarSign className="text-emerald-500" /> : <FiCreditCard className="text-blue-500" />}
                          {searchedBill.PaymentType || searchedBill.pbd_payment_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 text-sm space-y-2.5">
                    <div className="flex justify-between">
                      <span className="opacity-60">Subtotal:</span>
                      <span className="font-semibold">{fmtLKR(searchedBill.TotalAmount || searchedBill.pbd_total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Discount:</span>
                      <span>-{fmtLKR(searchedBill.DiscountAmount || searchedBill.pbd_discount_amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>Net Total:</span>
                      <span className="text-rose-600 dark:text-rose-400">{fmtLKR(searchedBill.NetAmount || searchedBill.pbd_net_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Returnable items table */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 bg-gray-55 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm flex items-center gap-1.5"><FiActivity /> Eligible Items for Return</h3>
                      <span className="text-xs opacity-60">Manage item return count</span>
                    </div>
                    <button
                      onClick={handleReturnFullBill}
                      disabled={processingFullBill || searchedBillItems.every(item => item.qty - (alreadyReturnedQtys[item.id] || 0) <= 0)}
                      className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {processingFullBill ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FiCornerUpLeft className="w-3.5 h-3.5" />
                      )}
                      Return Full Bill
                    </button>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`text-xs font-bold uppercase opacity-75 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <th className="px-5 py-3.5">Product</th>
                        <th className="px-5 py-3.5 text-center">Purchased</th>
                        <th className="px-5 py-3.5 text-center">Returned</th>
                        <th className="px-5 py-3.5 text-right">Price</th>
                        <th className="px-5 py-3.5 text-center w-28">Return Qty</th>
                        <th className="px-5 py-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {searchedBillItems.map((item) => {
                        const returned = alreadyReturnedQtys[item.id] || 0;
                        const available = item.qty - returned;
                        const isFullyReturned = available <= 0;

                        return (
                          <tr key={item.id} className={isFullyReturned ? 'opacity-50 bg-gray-100/30 dark:bg-gray-800/10' : ''}>
                            <td className="px-5 py-4">
                              <p className="font-bold text-sm">{item.productName}</p>
                              <span className="text-xs opacity-60">Code: {item.productCode}</span>
                            </td>
                            <td className="px-5 py-4 text-center font-semibold text-sm">{item.qty}</td>
                            <td className="px-5 py-4 text-center text-sm">
                              {returned > 0 ? (
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                                  {returned} units
                                </span>
                              ) : (
                                <span className="opacity-40">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right font-semibold text-sm">{fmtLKR(item.unitPrice)}</td>
                            <td className="px-5 py-4 text-center">
                              {!isFullyReturned ? (
                                <input
                                  type="number"
                                  min="1"
                                  max={available}
                                  value={returnQtysInput[item.id] || ''}
                                  onChange={(e) => {
                                    const val = Math.min(available, Math.max(1, parseInt(e.target.value) || 0));
                                    setReturnQtysInput(prev => ({ ...prev, [item.id]: val }));
                                  }}
                                  className={`w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                  }`}
                                />
                              ) : (
                                <span className="text-xs text-rose-500 dark:text-rose-400 font-bold uppercase">Fully Returned</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-center">
                              {!isFullyReturned ? (
                                <button
                                  onClick={() => handleMarkReturn(item)}
                                  disabled={processingReturnId === item.id}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1 mx-auto"
                                >
                                  {processingReturnId === item.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-rose-500 border-t-transparent"></div>
                                  ) : 'Process'}
                                </button>
                              ) : (
                                <FiCheckCircle className="text-green-500 w-5 h-5 mx-auto" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              !searchLoading && (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
                  <FiCornerUpLeft className="w-14 h-14 mx-auto mb-3 opacity-30 text-rose-500" />
                  <p className="font-semibold text-lg opacity-75">No Bill Loaded</p>
                  <p className="text-xs opacity-50 mt-1 max-w-sm mx-auto">Please input a Bill ID or Bill Number above to lookup details and process items for refund/return.</p>
                </div>
              )
            )}

          </div>
        )}

        {/* TAB 2: RETURN RECORDS */}
        {activeTab === 'records' && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-55 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-bold text-sm flex items-center gap-1.5"><FiFileText /> Return Records Log</h3>
              <div className="text-xs opacity-60 font-semibold">{returnRecords.length} records in system</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs font-bold uppercase opacity-75 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <th className="px-5 py-4">Bill ID</th>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4 text-center">Returned Qty</th>
                    <th className="px-5 py-4 text-right">Refund Amount</th>
                    <th className="px-5 py-4 text-right">Return Date</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                          <p>Loading return logs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : returnRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-500">
                        <FiInfo className="w-10 h-10 mx-auto mb-2 opacity-40 text-gray-400" />
                        No return records found in the database.
                      </td>
                    </tr>
                  ) : returnRecords.map((rec) => (
                    <tr key={`${rec.BillItemId || rec.ProductId}-${rec.ReturnDate || rec.ReturnedQty}`} className={`${darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}`}>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                        {rec.BillId}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-sm">{rec.ProductName || `Product ${rec.ProductId}`}</div>
                        <span className="text-[10px] opacity-50">Item ID: {rec.BillItemId}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center font-bold text-sm">
                        {rec.ReturnedQty}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-right text-rose-600 dark:text-rose-400">
                        {fmtLKR(getRefundAmount(rec))}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-right">
                        <div className="font-semibold">{new Date(rec.ReturnDate).toLocaleDateString()}</div>
                        <div className="opacity-55 flex items-center justify-end gap-0.5 mt-0.5"><FiClock /> {new Date(rec.ReturnDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DASHBOARD */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-850 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'}`}>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg">
                    <FiCornerUpLeft className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Total Returns</h3>
                </div>
                <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                  {summaryData.TotalReturnsCount}
                </p>
                <div className="mt-1 text-[11px] font-medium opacity-50">
                  Transactions marked returned
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-850 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'}`}>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg">
                    <FiActivity className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Returned Items</h3>
                </div>
                <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight">
                  {summaryData.TotalReturnedQty} Units
                </p>
                <div className="mt-1 text-[11px] font-medium opacity-50">
                  Total physical units refunded
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-850 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'}`}>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                    <FiDollarSign className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Total Refunded Value</h3>
                </div>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {fmtLKR(summaryData.TotalRefundAmount)}
                </p>
                <div className="mt-1 text-[11px] font-medium opacity-50">
                  Value returned to clients
                </div>
              </div>

            </div>

            {/* Top Returned & Recent Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Top Returned Products */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-850 border-gray-750' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold text-sm mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                  <FiActivity className="text-orange-500" /> Top Returned Products
                </h3>
                {summaryData.TopReturnedProducts.length === 0 ? (
                  <p className="text-xs opacity-50 text-center py-10">No top returned products data available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {summaryData.TopReturnedProducts.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 dark:border-gray-700/60 pb-2">
                        <div>
                          <p className="font-bold">{p.productName}</p>
                          <span className="text-xs opacity-50">{p.returnedQty} units returned</span>
                        </div>
                        <span className="font-bold text-rose-500 dark:text-rose-400">{fmtLKR(p.refundAmount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Returns Summary */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-850 border-gray-750' : 'bg-white border-gray-200'}`}>
                <h3 className="font-bold text-sm mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                  <FiClock className="text-blue-500" /> Recent Returns
                </h3>
                {summaryData.RecentReturns.length === 0 ? (
                  <p className="text-xs opacity-50 text-center py-10">No recent returns recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {summaryData.RecentReturns.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-dashed border-gray-200 dark:border-gray-700/60 pb-2">
                        <div>
                          <p className="font-bold text-sm">{r.ProductName || `Product ${r.ProductId}`}</p>
                          <div className="flex gap-2.5 mt-0.5 opacity-60">
                            <span>Bill: {r.BillNo || `Bill ${r.BillId}`}</span>
                            <span>Qty: {r.ReturnedQty}</span>
                            <span>Date: {new Date(r.ReturnDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-rose-600 dark:text-rose-400">{fmtLKR(getRefundAmount(r))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ReturnsPage;
