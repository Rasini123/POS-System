import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { billService } from '../../services/POS/billService';
import { productService } from '../../services/POS/ProductService';
import { getUsersList } from '../../services/userService';
import { FiPrinter, FiFileText, FiDownload, FiCalendar, FiPieChart, FiBarChart2, FiUsers, FiTag, FiShoppingBag, FiDollarSign, FiTrendingUp, FiActivity, FiBox } from 'react-icons/fi';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleString('en-GB');

const REPORT_TYPES = [
  { id: 'sales_summary', label: 'Sales Summary', icon: <FiPieChart /> },
  { id: 'item_sales', label: 'Item Sales', icon: <FiShoppingBag /> },
  { id: 'category_sales', label: 'Category Sales', icon: <FiTag /> },
  { id: 'user_sales', label: 'User Sales', icon: <FiUsers /> },
  { id: 'cashier_sales', label: 'Cashier Sales', icon: <FiBarChart2 /> },
  { id: 'tax_discount', label: 'Tax & Discount', icon: <FiDollarSign /> }
];

export default function ReportsPage() {
  const { darkMode } = useSelector(s => s.ui);
  const [activeReport, setActiveReport] = useState('sales_summary');
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const [data, setData] = useState({ bills: [], items: [], products: [], categories: [], users: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bills, items, products, categories, usersData] = await Promise.all([
          billService.getAllBills(),
          billService.getAllBillItems(),
          productService.getAllProducts(),
          productService.getAllCategories(),
          getUsersList(),
        ]);
        setData({
          bills: Array.isArray(bills) ? bills : [],
          items: Array.isArray(items) ? items : [],
          products: Array.isArray(products) ? products : [],
          categories: Array.isArray(categories) ? categories : [],
          users: usersData?.ResultSet || (Array.isArray(usersData) ? usersData : []),
        });
      } catch (error) {
        console.error("Failed to load report data:", error);
      }
    };
    loadData();
  }, []);

  // Filter Data
  const filteredBills = data.bills.filter(b => {
    const billDate = b.pbd_bill_date || b.BillDate;
    if (!billDate) return false;
    const d = new Date(billDate);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  });

  const filteredBillIds = new Set(filteredBills.map(b => b.pbd_bill_id || b.BillId));
  const filteredItems = data.items.filter(i => filteredBillIds.has(i.pid_bill_id || i.BillId));

  const totalGross = filteredBills.reduce((acc, b) => acc + Number(b.pbd_total_amount || b.TotalAmount || 0), 0);
  const totalDiscount = filteredBills.reduce((acc, b) => acc + Number(b.pbd_discount_amount || b.DiscountAmount || 0), 0);
  const totalNet = filteredBills.reduce((acc, b) => acc + Number(b.pbd_net_amount || b.NetAmount || 0), 0);
  const cashSales = filteredBills.filter(b => (b.pbd_payment_type === 'Cash' || b.PaymentType === 'CASH' || String(b.PaymentType).toUpperCase() === 'C')).reduce((acc, b) => acc + Number(b.pbd_net_amount || b.NetAmount || 0), 0);
  const cardSales = filteredBills.filter(b => (b.pbd_payment_type === 'Card' || b.PaymentType === 'CARD')).reduce((acc, b) => acc + Number(b.pbd_net_amount || b.NetAmount || 0), 0);

  // Helper for item sales mapping
  const getItemSalesMap = () => {
    const iMap = {};
    filteredItems.forEach(i => {
      const pId = i.pid_product_id || i.ProductId;
      if(!iMap[pId]) iMap[pId] = { qty: 0, val: 0 };
      iMap[pId].qty += Number(i.pid_qty || i.Qty || 0);
      iMap[pId].val += Number(i.pid_total || i.Total || 0);
    });
    return Object.entries(iMap).map(([pid, d]) => {
      const p = data.products.find(x => String(x.ppd_product_id || x.ProductId) === String(pid));
      return { code: p?.ppd_product_code || p?.ProductCode || '-', name: p?.ppd_product_name || p?.ProductName || 'Unknown', ...d };
    }).sort((a,b) => b.val - a.val);
  };

  // Helper for category sales mapping
  const getCategorySalesMap = () => {
    const cMap = {};
    filteredItems.forEach(i => {
      const pId = i.pid_product_id || i.ProductId;
      const p = data.products.find(x => String(x.ppd_product_id || x.ProductId) === String(pId));
      const catId = p?.ppd_category_id || p?.CategoryId || 0;
      if(!cMap[catId]) cMap[catId] = { qty: 0, val: 0 };
      cMap[catId].qty += Number(i.pid_qty || i.Qty || 0);
      cMap[catId].val += Number(i.pid_total || i.Total || 0);
    });
    return Object.entries(cMap).map(([cid, d]) => {
      const c = data.categories.find(x => String(x.pcd_category_id || x.CategoryId) === String(cid));
      return { name: c?.pcd_category_name || c?.CategoryName || 'Unknown', ...d };
    }).sort((a,b) => b.val - a.val);
  };

  // Helper for user sales mapping
  const getUserSalesMap = () => {
    const uMap = {};
    filteredBills.forEach(b => {
      const uId = b.pbd_user_id || b.UserId || b.CreatedBy || 0;
      if(!uMap[uId]) uMap[uId] = { count: 0, val: 0 };
      uMap[uId].count += 1;
      uMap[uId].val += Number(b.pbd_net_amount || b.NetAmount || 0);
    });
    return Object.entries(uMap).map(([uid, d]) => {
      const u = data.users.find(x => String(x.pud_user_id || x.UserId) === String(uid));
      return { id: uid, name: u?.pud_username || u?.UserName || 'Unknown', role: u?.pud_role_name || u?.RoleName || '-', ...d };
    }).sort((a,b) => b.val - a.val);
  };

  // Helper for cashier sales mapping
  const getCashierSalesMap = () => {
    const uMap = {};
    filteredBills.forEach(b => {
      const uId = b.pbd_user_id || b.UserId || b.CreatedBy || 0;
      const u = data.users.find(x => String(x.pud_user_id || x.UserId) === String(uId));
      if (u && String(u.pud_role_name || u.RoleName).toLowerCase() === 'cashier') {
        if(!uMap[uId]) uMap[uId] = { count: 0, val: 0 };
        uMap[uId].count += 1;
        uMap[uId].val += Number(b.pbd_net_amount || b.NetAmount || 0);
      }
    });
    return Object.entries(uMap).map(([uid, d]) => {
      const u = data.users.find(x => String(x.pud_user_id || x.UserId) === String(uid));
      return { id: uid, name: u?.pud_username || u?.UserName || 'Unknown', ...d };
    }).sort((a,b) => b.val - a.val);
  };

  const handleExportPDF = () => {
    let reportTitle = REPORT_TYPES.find(r => r.id === activeReport)?.label || 'Report';
    let reportContent = '';

    if (activeReport === 'sales_summary') {
      reportContent = `
        <table class="report-table">
          <tr><td class="bold w-50">Total Invoices</td><td class="right">${filteredBills.length}</td></tr>
          <tr><td class="bold">Gross Sales</td><td class="right">${fmt(totalGross)}</td></tr>
          <tr><td class="bold">Total Discounts</td><td class="right">-${fmt(totalDiscount)}</td></tr>
          <tr class="highlight"><td class="bold">Net Sales</td><td class="right bold">${fmt(totalNet)}</td></tr>
        </table>
        <br>
        <h4>Tender Breakdown</h4>
        <table class="report-table">
          <tr><td class="bold w-50">Cash Payments</td><td class="right">${fmt(cashSales)}</td></tr>
          <tr><td class="bold">Card Payments</td><td class="right">${fmt(cardSales)}</td></tr>
        </table>
      `;
    } else if (activeReport === 'item_sales') {
      const rows = getItemSalesMap();
      reportContent = `
        <table class="report-table">
          <thead>
            <tr><th class="left">Item Code</th><th class="left">Description</th><th class="right">Qty Sold</th><th class="right">Sales Value</th></tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r.code}</td><td>${r.name}</td><td class="right">${r.qty}</td><td class="right">${fmt(r.val)}</td></tr>`).join('')}
            ${rows.length === 0 ? `<tr><td colspan="4" class="center">No items sold</td></tr>` : ''}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'category_sales') {
      const rows = getCategorySalesMap();
      reportContent = `
        <table class="report-table">
          <thead>
            <tr><th class="left">Category</th><th class="right">Qty Sold</th><th class="right">Sales Value</th></tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r.name}</td><td class="right">${r.qty}</td><td class="right">${fmt(r.val)}</td></tr>`).join('')}
            ${rows.length === 0 ? `<tr><td colspan="3" class="center">No data</td></tr>` : ''}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'user_sales') {
      const rows = getUserSalesMap();
      reportContent = `
        <table class="report-table">
          <thead>
            <tr><th class="left">User ID</th><th class="left">User Name</th><th class="left">Role</th><th class="right">Invoice Count</th><th class="right">Net Sales</th></tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.role}</td><td class="right">${r.count}</td><td class="right">${fmt(r.val)}</td></tr>`).join('')}
            ${rows.length === 0 ? `<tr><td colspan="5" class="center">No data</td></tr>` : ''}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'cashier_sales') {
      const rows = getCashierSalesMap();
      reportContent = `
        <table class="report-table">
          <thead>
            <tr><th class="left">Cashier ID</th><th class="left">Cashier Name</th><th class="right">Invoice Count</th><th class="right">Net Sales</th></tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td class="right">${r.count}</td><td class="right">${fmt(r.val)}</td></tr>`).join('')}
            ${rows.length === 0 ? `<tr><td colspan="4" class="center">No data</td></tr>` : ''}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'tax_discount') {
      reportContent = `
        <table class="report-table">
          <tr><td class="bold w-50">Total Gross</td><td class="right">${fmt(totalGross)}</td></tr>
          <tr><td class="bold">Total Bill Discounts</td><td class="right">-${fmt(totalDiscount)}</td></tr>
          <tr class="highlight"><td class="bold">Total Exemptions</td><td class="right bold text-red">-${fmt(totalDiscount)}</td></tr>
        </table>
      `;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
            .header-container { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
            .company-title { font-size: 28px; font-weight: bold; color: #0f766e; margin-bottom: 5px; }
            .report-title { font-size: 20px; font-weight: bold; color: #374151; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; font-size: 14px; }
            .info-grid div span:first-child { font-weight: bold; width: 80px; display: inline-block; color: #4b5563; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
            .report-table th { background-color: #f3f4f6; color: #374151; padding: 12px; text-transform: uppercase; font-size: 12px; border-bottom: 2px solid #d1d5db; }
            .report-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .report-table .highlight { background-color: #f0fdf4; }
            .left { text-align: left; }
            .right { text-align: right; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .w-50 { width: 50%; }
            .text-red { color: #dc2626; }
            h4 { color: #4b5563; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; font-size: 13px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company-title">R.S. Bathik Gallery</div>
            <div class="report-title">${reportTitle}</div>
          </div>
          
          <div class="info-grid">
            <div><span>From:</span> ${new Date(startDate).toDateString()}</div>
            <div style="text-align: right;"><span>Generated:</span> ${new Date().toLocaleString()}</div>
            <div><span>To:</span> ${new Date(endDate).toDateString()}</div>
            <div style="text-align: right;"><span>User:</span> Administrator</div>
          </div>

          ${reportContent}

          <div class="footer">
            End of Report • Generated from R.S. Bathik Gallery POS System
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
    } border`}>
      
      {/* Header and Horizontal Navigation */}
      <div className={`flex flex-col border-b ${darkMode ? 'border-gray-700 bg-gray-850/50' : 'border-gray-200 bg-gray-50/50'}`}>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-md text-white">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Report Center</h2>
              <p className="text-xs opacity-60">Generate & export insights</p>
            </div>
          </div>
          
          {/* Horizontal Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {REPORT_TYPES.map(rt => (
              <button
                key={rt.id}
                onClick={() => setActiveReport(rt.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                  activeReport === rt.id 
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                    : `opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                <span className={activeReport === rt.id ? 'opacity-100' : 'opacity-60'}>{rt.icon}</span>
                {rt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Report Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        
        {/* Top Filter Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-4 p-5 md:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} shadow-sm`}>
              <FiCalendar className="text-teal-500" />
              <div className="flex items-center gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`text-sm font-medium focus:outline-none bg-transparent ${darkMode ? 'text-white' : 'text-gray-800'}`} />
                <span className="opacity-40">-</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`text-sm font-medium focus:outline-none bg-transparent ${darkMode ? 'text-white' : 'text-gray-800'}`} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md transition-all active:scale-95"
            >
              <FiDownload /> Export PDF
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className={`flex-1 p-5 md:p-8 overflow-y-auto ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
          
          {/* KPI Dashboard - ALWAYS VISIBLE */}
          <div className="max-w-6xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className={`p-6 rounded-lg border shadow-sm relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'}`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg">
                  <FiDollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Net Sales</h3>
              </div>
              <p className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
                Rs. {fmt(totalNet)}
              </p>
              <div className="mt-2 text-xs font-medium opacity-50 flex items-center gap-1">
                <FiTrendingUp /> <span>From {filteredBills.length} invoices</span>
              </div>
            </div>

            <div className={`p-6 rounded-lg border shadow-sm relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'}`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                  <FiFileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Total Invoices</h3>
              </div>
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                {filteredBills.length}
              </p>
              <div className="mt-2 text-xs font-medium opacity-50 flex items-center gap-1">
                <FiActivity /> <span>Across all users</span>
              </div>
            </div>

            <div className={`p-6 rounded-lg border shadow-sm relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'}`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg">
                  <FiTag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Total Discounts</h3>
              </div>
              <p className="text-4xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                Rs. {fmt(totalDiscount)}
              </p>
              <div className="mt-2 text-xs font-medium opacity-50 flex items-center gap-1">
                <FiBox /> <span>Total exemptions given</span>
              </div>
            </div>

          </div>

          <div className={`max-w-6xl mx-auto rounded-3xl border ${darkMode ? 'bg-gray-850 border-gray-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
            
            {/* Header */}
            <div className={`px-8 py-6 border-b flex items-center justify-between ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/80'}`}>
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-lg shadow-sm">
                    {REPORT_TYPES.find(r => r.id === activeReport)?.icon}
                  </div>
                  {REPORT_TYPES.find(r => r.id === activeReport)?.label}
                </h3>
                <p className="text-sm mt-1 opacity-60 font-medium">Detailed breakdown for selected period</p>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Period</div>
                <div className="text-sm font-semibold">{new Date(startDate).toDateString()} — {new Date(endDate).toDateString()}</div>
              </div>
            </div>

            {/* Content Tables */}
            
            {/* 1. SALES SUMMARY */}
            {activeReport === 'sales_summary' && (
              <div className="p-8">

                <div className="mt-8">
                  <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-widest">Financial Breakdown</h4>
                  <table className="w-full max-w-2xl text-left border-collapse">
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      <tr>
                        <td className="py-3 font-semibold">Gross Sales</td>
                        <td className="py-3 text-right font-medium">{fmt(totalGross)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Total Discounts</td>
                        <td className="py-3 text-right font-medium text-red-500">-{fmt(totalDiscount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8">
                  <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-widest">Tender Breakdown</h4>
                  <table className="w-full max-w-2xl text-left border-collapse">
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      <tr>
                        <td className="py-3 font-semibold">Cash Payments</td>
                        <td className="py-3 text-right font-medium">{fmt(cashSales)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Card Payments</td>
                        <td className="py-3 text-right font-medium">{fmt(cardSales)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. ITEM SALES */}
            {activeReport === 'item_sales' && (
              <div className="overflow-x-auto">
                <table className="hidden md:table w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-xs font-bold uppercase opacity-70 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <th className="px-6 py-4">Item Code</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Qty Sold</th>
                      <th className="px-6 py-4 text-right">Sales Value</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {(() => {
                      const rows = getItemSalesMap();
                      if(rows.length === 0) return <tr><td colSpan="4" className="text-center py-12 opacity-50">No items sold</td></tr>;
                      return rows.map((r, i) => (
                        <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400">{r.code}</td>
                          <td className="px-6 py-4 font-medium">{r.name}</td>
                          <td className="px-6 py-4 text-right font-bold">{r.qty}</td>
                          <td className="px-6 py-4 text-right font-bold">{fmt(r.val)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                {/* Mobile Cards - Item Sales */}
                <div className="md:hidden flex flex-col gap-3 p-4">
                  {(() => {
                    const rows = getItemSalesMap();
                    if(rows.length === 0) return <div className="text-center py-8 opacity-50">No items sold</div>;
                    return rows.map((r, i) => (
                      <div key={i} className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-sm">{r.name}</h3>
                            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">{r.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-60">Sales Value</p>
                            <p className="font-bold text-sm">{fmt(r.val)}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700/50">
                          <p className="text-xs opacity-60">Qty Sold</p>
                          <p className="font-bold">{r.qty}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* 3. CATEGORY SALES */}
            {activeReport === 'category_sales' && (
              <div className="overflow-x-auto">
                <table className="hidden md:table w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-xs font-bold uppercase opacity-70 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Qty Sold</th>
                      <th className="px-6 py-4 text-right">Sales Value</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {(() => {
                      const rows = getCategorySalesMap();
                      if(rows.length === 0) return <tr><td colSpan="3" className="text-center py-12 opacity-50">No data</td></tr>;
                      return rows.map((r, i) => (
                        <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 font-bold">{r.name}</td>
                          <td className="px-6 py-4 text-right font-bold">{r.qty}</td>
                          <td className="px-6 py-4 text-right font-bold">{fmt(r.val)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                {/* Mobile Cards - Category Sales */}
                <div className="md:hidden flex flex-col gap-3 p-4">
                  {(() => {
                    const rows = getCategorySalesMap();
                    if(rows.length === 0) return <div className="text-center py-8 opacity-50">No data</div>;
                    return rows.map((r, i) => (
                      <div key={i} className={`p-4 rounded-xl border shadow-sm flex justify-between items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div>
                          <h3 className="font-bold text-sm mb-1">{r.name}</h3>
                          <p className="text-xs opacity-60">Qty Sold: {r.qty}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-60">Sales Value</p>
                          <p className="font-bold text-sm">{fmt(r.val)}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* 4. USER SALES */}
            {activeReport === 'user_sales' && (
              <div className="overflow-x-auto">
                <table className="hidden md:table w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-xs font-bold uppercase opacity-70 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <th className="px-6 py-4">User ID</th>
                      <th className="px-6 py-4">User Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Invoice Count</th>
                      <th className="px-6 py-4 text-right">Net Sales</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {(() => {
                      const rows = getUserSalesMap();
                      if(rows.length === 0) return <tr><td colSpan="5" className="text-center py-12 opacity-50">No data</td></tr>;
                      return rows.map((r, i) => (
                        <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 opacity-60">{r.id}</td>
                          <td className="px-6 py-4 font-bold">{r.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              r.role.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>{r.role}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold">{r.count}</td>
                          <td className="px-6 py-4 text-right font-bold">{fmt(r.val)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                {/* Mobile Cards - User Sales */}
                <div className="md:hidden flex flex-col gap-3 p-4">
                  {(() => {
                    const rows = getUserSalesMap();
                    if(rows.length === 0) return <div className="text-center py-8 opacity-50">No data</div>;
                    return rows.map((r, i) => (
                      <div key={i} className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-sm">{r.name}</h3>
                            <p className="text-xs opacity-60 mt-0.5">ID: {r.id}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            r.role.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>{r.role}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700/50">
                          <div>
                            <p className="text-xs opacity-60">Invoices</p>
                            <p className="font-bold">{r.count}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-60">Net Sales</p>
                            <p className="font-bold">{fmt(r.val)}</p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* 5. CASHIER SALES */}
            {activeReport === 'cashier_sales' && (
              <div className="overflow-x-auto">
                <table className="hidden md:table w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-xs font-bold uppercase opacity-70 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <th className="px-6 py-4">Cashier ID</th>
                      <th className="px-6 py-4">Cashier Name</th>
                      <th className="px-6 py-4 text-right">Invoice Count</th>
                      <th className="px-6 py-4 text-right">Net Sales</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {(() => {
                      const rows = getCashierSalesMap();
                      if(rows.length === 0) return <tr><td colSpan="4" className="text-center py-12 opacity-50">No data</td></tr>;
                      return rows.map((r, i) => (
                        <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 opacity-60">{r.id}</td>
                          <td className="px-6 py-4 font-bold">{r.name}</td>
                          <td className="px-6 py-4 text-right font-bold">{r.count}</td>
                          <td className="px-6 py-4 text-right font-bold">{fmt(r.val)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                {/* Mobile Cards - Cashier Sales */}
                <div className="md:hidden flex flex-col gap-3 p-4">
                  {(() => {
                    const rows = getCashierSalesMap();
                    if(rows.length === 0) return <div className="text-center py-8 opacity-50">No data</div>;
                    return rows.map((r, i) => (
                      <div key={i} className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-sm">{r.name}</h3>
                            <p className="text-xs opacity-60 mt-0.5">ID: {r.id}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700/50">
                          <div>
                            <p className="text-xs opacity-60">Invoices</p>
                            <p className="font-bold">{r.count}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-60">Net Sales</p>
                            <p className="font-bold">{fmt(r.val)}</p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* 6. TAX & DISCOUNT */}
            {activeReport === 'tax_discount' && (
              <div className="p-6">
                <div className="mt-4 max-w-2xl">
                  <table className="w-full text-left border-collapse">
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      <tr>
                        <td className="py-4 font-semibold">Total Gross</td>
                        <td className="py-4 text-right font-medium">{fmt(totalGross)}</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-semibold">Total Bill Discounts</td>
                        <td className="py-4 text-right font-medium text-red-500">-{fmt(totalDiscount)}</td>
                      </tr>
                      <tr className={`text-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <td className="py-4 px-4 font-bold rounded-l-xl">Total Exemptions</td>
                        <td className="py-4 px-4 font-bold text-right text-red-500 rounded-r-xl">-{fmt(totalDiscount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

