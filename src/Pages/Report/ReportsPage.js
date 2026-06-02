import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { billService } from '../../services/POS/billService';
import { productService } from '../../services/POS/ProductService';
import { getUsersList } from '../../services/userService';
import { FiPrinter, FiSearch, FiFileText } from 'react-icons/fi';

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleString('en-GB');

const REPORT_TYPES = [
  { id: 'sales_summary', label: 'Sales Summary' },
  { id: 'item_sales', label: 'Item Sales' },
  { id: 'category_sales', label: 'Category Sales' },
  { id: 'user_sales', label: 'User Sales' },
  { id: 'cashier_sales', label: 'Cashier Sales' },
  { id: 'tax_discount', label: 'Tax & Discount' }
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

  // Styling (Minimal / Monochrome)
  const bgMain = darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800';
  const bgPanel = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';
  const border = darkMode ? 'border-gray-700' : 'border-gray-300';
  const thStyle = `px-3 py-2 text-left text-xs font-semibold uppercase border-b border-r last:border-r-0 ${darkMode ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'}`;
  const tdStyle = `px-3 py-2 text-sm border-b border-r last:border-r-0 ${darkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-900'}`;
  const inputStyle = `text-sm px-2 py-1 border focus:outline-none ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-400 text-black'}`;
  
  const handlePrint = () => {
    let reportTitle = REPORT_TYPES.find(r => r.id === activeReport)?.label || 'Report';
    let reportContent = '';

    if (activeReport === 'sales_summary') {
      reportContent = `
        <div class="line"><span class="left">Total Invoices</span><span class="right">${filteredBills.length}</span></div>
        <div class="line"><span class="left">Gross Sales</span><span class="right">${fmt(totalGross)}</span></div>
        <div class="line"><span class="left">Total Discounts</span><span class="right">${fmt(totalDiscount)}</span></div>
        <div class="divider"></div>
        <div class="line bold"><span class="left">Net Sales</span><span class="right">${fmt(totalNet)}</span></div>
        <div class="divider"></div>
        <div class="center bold uppercase">Tender Breakdown</div>
        <div class="line"><span class="left">Cash Payments</span><span class="right">${fmt(cashSales)}</span></div>
        <div class="line"><span class="left">Card Payments</span><span class="right">${fmt(cardSales)}</span></div>
      `;
    } else if (activeReport === 'item_sales') {
      const iMap = {};
      filteredItems.forEach(i => {
        const pId = i.pid_product_id || i.ProductId;
        if(!iMap[pId]) iMap[pId] = { qty: 0, val: 0 };
        iMap[pId].qty += Number(i.pid_qty || i.Qty || 0);
        iMap[pId].val += Number(i.pid_total || i.Total || 0);
      });
      const rows = Object.entries(iMap).map(([pid, d]) => {
        const p = data.products.find(x => String(x.ppd_product_id || x.ProductId) === String(pid));
        return { name: p?.ppd_product_name || p?.ProductName || 'Unknown', ...d };
      }).sort((a,b) => b.val - a.val);

      reportContent = `
        <div class="line bold uppercase">
          <span class="left" style="width: 55%;">Item</span>
          <span class="right" style="width: 15%;">Qty</span>
          <span class="right" style="width: 30%;">Total</span>
        </div>
        <div class="divider"></div>
      ` + rows.map(r => `
        <div class="line">
          <span class="left" style="width: 55%; font-size:11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.name}</span>
          <span class="right" style="width: 15%;">${r.qty}</span>
          <span class="right" style="width: 30%;">${fmt(r.val)}</span>
        </div>
      `).join('');
    } else if (activeReport === 'category_sales') {
      const cMap = {};
      filteredItems.forEach(i => {
        const pId = i.pid_product_id || i.ProductId;
        const p = data.products.find(x => String(x.ppd_product_id || x.ProductId) === String(pId));
        const catId = p?.ppd_category_id || p?.CategoryId || 0;
        if(!cMap[catId]) cMap[catId] = { qty: 0, val: 0 };
        cMap[catId].qty += Number(i.pid_qty || i.Qty || 0);
        cMap[catId].val += Number(i.pid_total || i.Total || 0);
      });
      const rows = Object.entries(cMap).map(([cid, d]) => {
        const c = data.categories.find(x => String(x.pcd_category_id || x.CategoryId) === String(cid));
        return { name: c?.pcd_category_name || c?.CategoryName || 'Unknown', ...d };
      }).sort((a,b) => b.val - a.val);

      reportContent = `
        <div class="line bold uppercase">
          <span class="left" style="width: 50%;">Category</span>
          <span class="right" style="width: 20%;">Qty</span>
          <span class="right" style="width: 30%;">Total</span>
        </div>
        <div class="divider"></div>
      ` + rows.map(r => `
        <div class="line">
          <span class="left" style="width: 50%; font-size:11px;">${r.name}</span>
          <span class="right" style="width: 20%;">${r.qty}</span>
          <span class="right" style="width: 30%;">${fmt(r.val)}</span>
        </div>
      `).join('');
    } else if (activeReport === 'user_sales') {
      const uMap = {};
      filteredBills.forEach(b => {
        const uId = b.pbd_user_id || b.UserId || b.CreatedBy || 0;
        if(!uMap[uId]) uMap[uId] = { count: 0, val: 0 };
        uMap[uId].count += 1;
        uMap[uId].val += Number(b.pbd_net_amount || b.NetAmount || 0);
      });
      const rows = Object.entries(uMap).map(([uid, d]) => {
        const u = data.users.find(x => String(x.pud_user_id || x.UserId) === String(uid));
        return { name: u?.pud_username || u?.UserName || 'Unknown', role: u?.pud_role_name || u?.RoleName || '-', ...d };
      }).sort((a,b) => b.val - a.val);

      reportContent = `
        <div class="line bold uppercase">
          <span class="left" style="width: 40%;">User (Role)</span>
          <span class="right" style="width: 25%;">Count</span>
          <span class="right" style="width: 35%;">Net</span>
        </div>
        <div class="divider"></div>
      ` + rows.map(r => `
        <div class="line">
          <span class="left" style="width: 40%; font-size:11px;">${r.name} (${r.role})</span>
          <span class="right" style="width: 25%;">${r.count}</span>
          <span class="right" style="width: 35%;">${fmt(r.val)}</span>
        </div>
      `).join('');
    } else if (activeReport === 'cashier_sales') {
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
      const rows = Object.entries(uMap).map(([uid, d]) => {
        const u = data.users.find(x => String(x.pud_user_id || x.UserId) === String(uid));
        return { name: u?.pud_username || u?.UserName || 'Unknown', ...d };
      }).sort((a,b) => b.val - a.val);

      reportContent = `
        <div class="line bold uppercase">
          <span class="left" style="width: 40%;">Cashier</span>
          <span class="right" style="width: 25%;">Count</span>
          <span class="right" style="width: 35%;">Net</span>
        </div>
        <div class="divider"></div>
      ` + rows.map(r => `
        <div class="line">
          <span class="left" style="width: 40%; font-size:11px;">${r.name}</span>
          <span class="right" style="width: 25%;">${r.count}</span>
          <span class="right" style="width: 35%;">${fmt(r.val)}</span>
        </div>
      `).join('');
    } else if (activeReport === 'tax_discount') {
      reportContent = `
        <div class="line"><span class="left">Total Gross</span><span class="right">${fmt(totalGross)}</span></div>
        <div class="line"><span class="left">Line Discounts</span><span class="right">0.00</span></div>
        <div class="line"><span class="left">Bill Discounts</span><span class="right">${fmt(totalDiscount)}</span></div>
        <div class="divider"></div>
        <div class="line bold"><span class="left">Total Exemptions</span><span class="right">${fmt(totalDiscount)}</span></div>
      `;
    }

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { 
              font-family: 'Courier New', Courier, monospace; 
              margin: 0; 
              padding: 15px; 
              width: 280px; 
              color: #000; 
              font-size: 12px;
            }
            .center { text-align: center; }
            .left { text-align: left; display: inline-block; }
            .right { text-align: right; display: inline-block; }
            .bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .header-title { font-size: 16px; font-weight: bold; margin-bottom: 3px; }
            .line { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .footer { font-size: 11px; margin-top: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header-title">R.S.BATHIK</div>
            <div>${reportTitle.toUpperCase()}</div>
            <div class="divider"></div>
          </div>
          
          <div class="line">
            <span class="left bold">From:</span>
            <span class="right">${startDate}</span>
          </div>
          <div class="line">
            <span class="left bold">To:</span>
            <span class="right">${endDate}</span>
          </div>
          <div class="line">
            <span class="left bold">Printed:</span>
            <span class="right">${new Date().toLocaleString()}</span>
          </div>
          <div class="divider"></div>

          ${reportContent}

          <div class="divider"></div>
          <div class="footer">
            <b>END OF REPORT</b>
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
  };

  return (
    <div className={`flex h-full w-full border ${border} ${bgMain}`}>
      
      {/* Sidebar Report Navigation */}
      <div className={`w-64 flex flex-col border-r ${bgPanel}`}>
        <div className={`p-4 border-b ${border}`}>
          <h2 className="text-lg font-bold">Report Center</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {REPORT_TYPES.map(rt => (
            <button
              key={rt.id}
              onClick={() => setActiveReport(rt.id)}
              className={`w-full text-left px-4 py-3 text-sm font-medium border-b ${border} transition-colors ${
                activeReport === rt.id 
                  ? (darkMode ? 'bg-gray-700 border-l-4 border-l-gray-300' : 'bg-gray-200 border-l-4 border-l-gray-700')
                  : `hover:${darkMode ? 'bg-gray-750' : 'bg-gray-100'}`
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Filter Bar */}
        <div className={`flex items-center justify-between p-3 border-b ${bgPanel}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">From:</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputStyle} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">To:</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputStyle} />
            </div>
          </div>
          
          <button 
            onClick={handlePrint}
            className={`flex items-center gap-2 px-4 py-1.5 border text-sm font-bold shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-200 border-gray-400 hover:bg-gray-300'}`}
          >
            <FiPrinter /> Print
          </button>
        </div>

        {/* Report Content */}
        <div className="flex-1 p-4 overflow-y-auto print:p-0">
          <div className={`border ${bgPanel} shadow-sm`}>
            
            {/* Header for print */}
            <div className={`p-4 border-b ${border}`}>
              <h3 className="text-xl font-bold">{REPORT_TYPES.find(r => r.id === activeReport)?.label}</h3>
              <p className="text-sm mt-1 opacity-80">Period: {startDate} to {endDate}</p>
              <p className="text-sm opacity-80">Generated: {new Date().toLocaleString()}</p>
            </div>

            {/* Content Tables */}
            
            {/* 1. SALES SUMMARY */}
            {activeReport === 'sales_summary' && (
              <div className="p-4">
                <table className="w-full max-w-md border-collapse border border-gray-300 dark:border-gray-700">
                  <tbody>
                    <tr>
                      <td className={`${tdStyle} font-semibold w-1/2`}>Total Invoices</td>
                      <td className={`${tdStyle} text-right`}>{filteredBills.length}</td>
                    </tr>
                    <tr>
                      <td className={`${tdStyle} font-semibold`}>Gross Sales</td>
                      <td className={`${tdStyle} text-right`}>{fmt(totalGross)}</td>
                    </tr>
                    <tr>
                      <td className={`${tdStyle} font-semibold`}>Total Discounts</td>
                      <td className={`${tdStyle} text-right`}>{fmt(totalDiscount)}</td>
                    </tr>
                    <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-200'}>
                      <td className={`${tdStyle} font-bold`}>Net Sales</td>
                      <td className={`${tdStyle} font-bold text-right`}>{fmt(totalNet)}</td>
                    </tr>
                    <tr>
                      <td colSpan="2" className={`p-2 bg-gray-100 dark:bg-gray-900 font-bold text-xs uppercase border-b ${border}`}>Tender Breakdown</td>
                    </tr>
                    <tr>
                      <td className={`${tdStyle} font-semibold`}>Cash Payments</td>
                      <td className={`${tdStyle} text-right`}>{fmt(cashSales)}</td>
                    </tr>
                    <tr>
                      <td className={`${tdStyle} font-semibold`}>Card Payments</td>
                      <td className={`${tdStyle} text-right`}>{fmt(cardSales)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. ITEM SALES */}
            {activeReport === 'item_sales' && (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={thStyle}>Item Code</th>
                    <th className={thStyle}>Description</th>
                    <th className={`${thStyle} text-right`}>Qty Sold</th>
                    <th className={`${thStyle} text-right`}>Sales Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const iMap = {};
                    filteredItems.forEach(i => {
                      const pId = i.pid_product_id || i.ProductId;
                      if(!iMap[pId]) iMap[pId] = { qty: 0, val: 0 };
                      iMap[pId].qty += Number(i.pid_qty || i.Qty || 0);
                      iMap[pId].val += Number(i.pid_total || i.Total || 0);
                    });
                    const rows = Object.entries(iMap).map(([pid, itemData]) => {
                      const p = data.products.find(x => String(x.ppd_product_id || x.ProductId) === String(pid));
                      return { code: p?.ppd_product_code || p?.ProductCode || '-', name: p?.ppd_product_name || p?.ProductName || 'Unknown', ...itemData };
                    }).sort((a,b) => b.val - a.val);

                    if(rows.length === 0) return <tr><td colSpan="4" className={`${tdStyle} text-center py-6`}>No items sold</td></tr>;

                    return rows.map((r, i) => (
                      <tr key={i} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <td className={tdStyle}>{r.code}</td>
                        <td className={tdStyle}>{r.name}</td>
                        <td className={`${tdStyle} text-right`}>{r.qty}</td>
                        <td className={`${tdStyle} text-right`}>{fmt(r.val)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}

            {/* 3. CATEGORY SALES */}
            {activeReport === 'category_sales' && (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={thStyle}>Category</th>
                    <th className={`${thStyle} text-right`}>Qty Sold</th>
                    <th className={`${thStyle} text-right`}>Sales Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const cMap = {};
                    filteredItems.forEach(i => {
                      const pId = i.pid_product_id || i.ProductId;
                      const p = data.products.find(x => String(x.ppd_product_id || x.ProductId) === String(pId));
                      const catId = p?.ppd_category_id || p?.CategoryId || 0;
                      if(!cMap[catId]) cMap[catId] = { qty: 0, val: 0 };
                      cMap[catId].qty += Number(i.pid_qty || i.Qty || 0);
                      cMap[catId].val += Number(i.pid_total || i.Total || 0);
                    });
                    const rows = Object.entries(cMap).map(([cid, d]) => {
                      const c = data.categories.find(x => String(x.pcd_category_id || x.CategoryId) === String(cid));
                      return { name: c?.pcd_category_name || c?.CategoryName || 'Unknown', ...d };
                    }).sort((a,b) => b.val - a.val);

                    if(rows.length === 0) return <tr><td colSpan="3" className={`${tdStyle} text-center py-6`}>No data</td></tr>;

                    return rows.map((r, i) => (
                      <tr key={i} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <td className={tdStyle}>{r.name}</td>
                        <td className={`${tdStyle} text-right`}>{r.qty}</td>
                        <td className={`${tdStyle} text-right`}>{fmt(r.val)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}

            {/* 4. USER SALES */}
            {activeReport === 'user_sales' && (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={thStyle}>User ID</th>
                    <th className={thStyle}>User Name</th>
                    <th className={thStyle}>Role</th>
                    <th className={`${thStyle} text-right`}>Invoice Count</th>
                    <th className={`${thStyle} text-right`}>Net Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const uMap = {};
                    filteredBills.forEach(b => {
                      const uId = b.pbd_user_id || b.UserId || b.CreatedBy || 0;
                      if(!uMap[uId]) uMap[uId] = { count: 0, val: 0 };
                      uMap[uId].count += 1;
                      uMap[uId].val += Number(b.pbd_net_amount || b.NetAmount || 0);
                    });
                    const rows = Object.entries(uMap).map(([uid, d]) => {
                      const u = data.users.find(x => String(x.pud_user_id || x.UserId) === String(uid));
                      return { id: uid, name: u?.pud_username || u?.UserName || 'Unknown', role: u?.pud_role_name || u?.RoleName || '-', ...d };
                    }).sort((a,b) => b.val - a.val);

                    if(rows.length === 0) return <tr><td colSpan="5" className={`${tdStyle} text-center py-6`}>No data</td></tr>;

                    return rows.map((r, i) => (
                      <tr key={i} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <td className={tdStyle}>{r.id}</td>
                        <td className={tdStyle}>{r.name}</td>
                        <td className={tdStyle}>{r.role}</td>
                        <td className={`${tdStyle} text-right`}>{r.count}</td>
                        <td className={`${tdStyle} text-right`}>{fmt(r.val)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}

            {/* 5. CASHIER SALES */}
            {activeReport === 'cashier_sales' && (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={thStyle}>Cashier ID</th>
                    <th className={thStyle}>Cashier Name</th>
                    <th className={`${thStyle} text-right`}>Invoice Count</th>
                    <th className={`${thStyle} text-right`}>Net Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
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
                    const rows = Object.entries(uMap).map(([uid, d]) => {
                      const u = data.users.find(x => String(x.pud_user_id || x.UserId) === String(uid));
                      return { id: uid, name: u?.pud_username || u?.UserName || 'Unknown', ...d };
                    }).sort((a,b) => b.val - a.val);

                    if(rows.length === 0) return <tr><td colSpan="4" className={`${tdStyle} text-center py-6`}>No data</td></tr>;

                    return rows.map((r, i) => (
                      <tr key={i} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <td className={tdStyle}>{r.id}</td>
                        <td className={tdStyle}>{r.name}</td>
                        <td className={`${tdStyle} text-right`}>{r.count}</td>
                        <td className={`${tdStyle} text-right`}>{fmt(r.val)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}

            {/* 5. TAX & DISCOUNT */}
            {activeReport === 'tax_discount' && (
              <div className="p-4">
                <table className="w-full max-w-md border-collapse border border-gray-300 dark:border-gray-700">
                  <tbody>
                    <tr>
                      <td className={`${tdStyle} font-semibold w-1/2`}>Total Gross</td>
                      <td className={`${tdStyle} text-right`}>{fmt(totalGross)}</td>
                    </tr>
                    <tr>
                      <td className={`${tdStyle} font-semibold`}>Total Line Discounts</td>
                      <td className={`${tdStyle} text-right`}>0.00</td>
                    </tr>
                    <tr>
                      <td className={`${tdStyle} font-semibold`}>Total Bill Discounts</td>
                      <td className={`${tdStyle} text-right`}>{fmt(totalDiscount)}</td>
                    </tr>
                    <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-200'}>
                      <td className={`${tdStyle} font-bold`}>Total Exemptions</td>
                      <td className={`${tdStyle} font-bold text-right`}>{fmt(totalDiscount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
